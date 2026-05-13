import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';

// --- Types -----------------------------------------------------------------

type Size = 'short' | 'tall' | 'grande' | 'venti' | 'trenta';
type When = 'has_modifier' | 'no_modifier';

interface Step {
  n: number;
  text: string;
  when?: When;
}

interface Variant {
  usesMilk?: boolean;
  usesIce?: boolean;
  recipes: Partial<Record<Size, Record<string, number | null>>>;
  steps: Step[];
}

interface Drink {
  name: string;
  category: string | null;
  defaultMilk?: string | null;
  defaultIced?: boolean;
  hot?: Variant;
  iced?: Variant;
}

// --- Helpers ---------------------------------------------------------------

const VALID_SIZES: Size[] = ['short', 'tall', 'grande', 'venti', 'trenta'];

// Placeholders that are always provided by the API substitution layer.
// Drink-specific ones (ingredients named in recipes) are added dynamically.
const BUILTIN_PLACEHOLDERS = new Set(['shots', 'pumps', 'size', 'flavor', 'milk']);

// Infer the SQL unit from an ingredient name. Override by adding cases.
function unitFor(ingredient: string): string {
  const n = ingredient.toLowerCase();
  if (n === 'espresso' || n === 'ristretto') return 'shots';
  if (n.endsWith('sauce') || n.endsWith('syrup') || n === 'pumps') return 'pumps';
  if (n === 'frap roast' || n === 'frap base') return 'pumps';
  if (n === 'green tea extract') return 'pumps';
  if (n === 'choco chips' || n.endsWith('inclusions')) return 'scoops';
  if (n.endsWith('powder')) return 'shakes';
  return 'units';
}

// Turn "mocha sauce" into "mocha_sauce" so templates can reference it.
function placeholderFor(ingredient: string): string {
  return ingredient.toLowerCase().replace(/\s+/g, '_');
}

function sqlString(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

function sqlNullable(s: string | null | undefined): string {
  return s === null || s === undefined ? 'NULL' : sqlString(s);
}

// --- Validation ------------------------------------------------------------

function validateDrink(drink: Drink, file: string): string[] {
  const errors: string[] = [];
  const push = (msg: string) => errors.push(`${file}: ${msg}`);

  if (!drink.name || typeof drink.name !== 'string') push('missing "name"');
  if (!drink.hot && !drink.iced) push('must have at least one of "hot" or "iced"');

  for (const [variantKey, variant] of [['hot', drink.hot], ['iced', drink.iced]] as const) {
    if (!variant) continue;

    if (!variant.recipes || Object.keys(variant.recipes).length === 0) {
      push(`${variantKey}.recipes is empty`);
      continue;
    }

    // Every ingredient that appears in any size for this variant.
    const ingredientSet = new Set<string>();
    for (const [size, recipe] of Object.entries(variant.recipes)) {
      if (!VALID_SIZES.includes(size as Size)) {
        push(`${variantKey} has invalid size "${size}"`);
      }
      for (const ingredient of Object.keys(recipe ?? {})) {
        ingredientSet.add(ingredient);
      }
    }
    if (variant.usesMilk) ingredientSet.add('milk');
    if (variant.usesIce) ingredientSet.add('ice');

    // Cross-check: each size should list the same ingredients (warn, not error)
    for (const [size, recipe] of Object.entries(variant.recipes)) {
      for (const ing of ingredientSet) {
        if (ing === 'milk' || ing === 'ice') continue;
        if (!(ing in (recipe ?? {}))) {
          push(`${variantKey}.${size} is missing ingredient "${ing}" (present in other sizes)`);
        }
      }
    }

    // Validate step templates reference only known placeholders.
    const allowed = new Set(BUILTIN_PLACEHOLDERS);
    for (const ing of ingredientSet) allowed.add(placeholderFor(ing));

    for (const step of variant.steps ?? []) {
      if (typeof step.n !== 'number') push(`${variantKey} step has non-numeric "n"`);
      if (!step.text) push(`${variantKey} step n=${step.n} missing "text"`);
      if (step.when && step.when !== 'has_modifier' && step.when !== 'no_modifier') {
        push(`${variantKey} step n=${step.n} has invalid "when": ${step.when}`);
      }
      const refs = [...step.text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
      for (const ref of refs) {
        if (!allowed.has(ref)) {
          push(
            `${variantKey} step n=${step.n} references {${ref}} but no such placeholder exists ` +
              `(allowed: ${[...allowed].sort().join(', ')})`
          );
        }
      }
    }
  }

  return errors;
}

// --- SQL generation --------------------------------------------------------

function generateDrinkSQL(drink: Drink): string {
  const lines: string[] = [];
  const name = sqlString(drink.name);
  const category = sqlNullable(drink.category);

  lines.push(`-- ${drink.name}`);
  lines.push(`INSERT INTO drinks (name, category) VALUES (${name}, ${category}) ON CONFLICT (name) DO NOTHING;`);
  lines.push('');

  for (const [variantKey, variant] of [['hot', drink.hot], ['iced', drink.iced]] as const) {
    if (!variant) continue;
    const iced = variantKey === 'iced' ? 'TRUE' : 'FALSE';

    // Recipes: one row per (size, ingredient). Milk/ice are null-quantity rows.
    const rows: string[] = [];
    for (const [size, recipe] of Object.entries(variant.recipes)) {
      for (const [ingredient, quantity] of Object.entries(recipe ?? {})) {
        const qty = quantity === null ? 'NULL' : String(quantity);
        const unit = quantity === null ? 'NULL' : sqlString(unitFor(ingredient));
        rows.push(`  (${sqlString(size)}, ${sqlString(ingredient)}, ${qty}, ${unit})`);
      }
      if (variant.usesMilk) {
        rows.push(`  (${sqlString(size)}, 'milk', NULL, NULL)`);
      }
      if (variant.usesIce) {
        rows.push(`  (${sqlString(size)}, 'ice', NULL, NULL)`);
      }
    }
    if (rows.length > 0) {
      lines.push(`INSERT INTO drink_recipes (drink_id, size, iced, ingredient, quantity, unit)`);
      lines.push(`SELECT d.id, v.size, ${iced}, v.ingredient, v.quantity, v.unit`);
      lines.push(`FROM drinks d`);
      lines.push(`CROSS JOIN (VALUES`);
      lines.push(rows.join(',\n'));
      lines.push(`) AS v(size, ingredient, quantity, unit)`);
      lines.push(`WHERE d.name = ${name}`);
      lines.push(`ON CONFLICT DO NOTHING;`);
      lines.push('');
    }

    // Steps.
    if (variant.steps.length > 0) {
      const stepRows = variant.steps.map(
        (s) =>
          `  (${s.n}, ${sqlString(s.text)}, ${s.when ? sqlString(s.when) : 'NULL'})`
      );
      lines.push(`INSERT INTO drink_steps (drink_id, iced, step_number, template, applies_when)`);
      lines.push(`SELECT d.id, ${iced}, s.step_number, s.template, s.applies_when`);
      lines.push(`FROM drinks d`);
      lines.push(`CROSS JOIN (VALUES`);
      lines.push(stepRows.join(',\n'));
      lines.push(`) AS s(step_number, template, applies_when)`);
      lines.push(`WHERE d.name = ${name}`);
      lines.push(`ON CONFLICT DO NOTHING;`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

// --- Entry point -----------------------------------------------------------

const drinksDir = resolve('db/drinks');
const outPath = resolve('db/drinks.generated.sql');
const catalogOutPath = resolve('src/catalog.generated.ts');

const files = readdirSync(drinksDir).filter((f) => f.endsWith('.json')).sort();
if (files.length === 0) {
  console.error(`No .json files found in ${drinksDir}`);
  process.exit(1);
}

let allErrors: string[] = [];
const perFileSQL: string[] = [];
const catalogEntries: Drink[] = [];

for (const file of files) {
  const path = join(drinksDir, file);
  const raw = readFileSync(path, 'utf8').trim();
  if (raw === '') continue;
  let drink: Drink;
  try {
    drink = JSON.parse(raw) as Drink;
  } catch (e) {
    allErrors.push(`${basename(file)}: invalid JSON — ${e instanceof Error ? e.message : e}`);
    continue;
  }
  const errors = validateDrink(drink, basename(file));
  if (errors.length > 0) {
    allErrors.push(...errors);
    continue;
  }
  perFileSQL.push(generateDrinkSQL(drink));
  catalogEntries.push(drink);
}

if (allErrors.length > 0) {
  console.error('Validation failed:');
  for (const e of allErrors) console.error(`  ${e}`);
  process.exit(1);
}

const header =
  `-- AUTO-GENERATED from db/drinks/*.json by scripts/build-drinks.ts\n` +
  `-- Do not edit by hand. Regenerate with: npm run db:build\n\n`;

writeFileSync(outPath, header + perFileSQL.join('\n'));
console.log(`Wrote ${outPath} (${files.length} drink${files.length === 1 ? '' : 's'})`);

const catalogHeader =
  `// AUTO-GENERATED from db/drinks/*.json by scripts/build-drinks.ts\n` +
  `// Do not edit by hand. Regenerate with: npm run db:build\n\n`;

function recipeIngredients(d: Drink): string[] {
  const set = new Set<string>();
  for (const variant of [d.hot, d.iced]) {
    if (!variant) continue;
    for (const recipe of Object.values(variant.recipes)) {
      for (const ing of Object.keys(recipe ?? {})) set.add(ing);
    }
  }
  return [...set].sort();
}

const catalogBody = catalogEntries
  .map((d) => {
    const hasHot = d.hot !== undefined;
    const hasIced = d.iced !== undefined;
    return `  {
    name: ${JSON.stringify(d.name)},
    defaultMilk: ${JSON.stringify(d.defaultMilk ?? null)},
    defaultIced: ${JSON.stringify(d.defaultIced ?? false)},
    hasHot: ${hasHot},
    hasIced: ${hasIced},
    recipeIngredients: ${JSON.stringify(recipeIngredients(d))},
  }`;
  })
  .join(',\n');

const catalogTs =
  catalogHeader +
  `export interface DrinkCatalogEntry {
  name: string;
  defaultMilk: string | null;
  defaultIced: boolean;
  hasHot: boolean;
  hasIced: boolean;
  recipeIngredients: readonly string[];
}

export const drinkCatalog: readonly DrinkCatalogEntry[] = [
${catalogBody},
] as const;
`;

writeFileSync(catalogOutPath, catalogTs);
console.log(`Wrote ${catalogOutPath}`);
