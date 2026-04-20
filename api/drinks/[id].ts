import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';

type DrinkRow = { id: number; name: string; category: string | null };
type RecipeRow = {
  size: string;
  iced: boolean;
  ingredient: string;
  quantity: string | null;
  unit: string | null;
};
type MilkRow = { id: number; name: string };
type StepRow = {
  step_number: string;
  template: string;
  applies_when: 'has_modifier' | 'no_modifier' | null;
};
type ModifierRow = {
  id: number;
  name: string;
  quantity: string;
  unit: string;
};

function parseBool(v: unknown): boolean {
  return v === true || v === 'true' || v === '1';
}

function parseModifierIds(v: unknown): number[] {
  if (!v) return [];
  const raw = Array.isArray(v) ? v[0] : String(v);
  return raw
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const idParam = req.query.id;
  const drinkId = Number(Array.isArray(idParam) ? idParam[0] : idParam);
  if (!Number.isInteger(drinkId) || drinkId <= 0) {
    return res.status(400).json({ error: 'Invalid drink id' });
  }

  const size = String(req.query.size ?? 'grande');
  const iced = parseBool(req.query.iced);
  const modifierIds = parseModifierIds(req.query.modifiers);
  const milkRaw = req.query.milk;
  const milkName = milkRaw ? String(Array.isArray(milkRaw) ? milkRaw[0] : milkRaw) : null;

  try {
    const drinkRows = await sql<DrinkRow[]>`
      SELECT id, name, category FROM drinks WHERE id = ${drinkId}
    `;
    const drink = drinkRows[0];
    if (!drink) return res.status(404).json({ error: 'Drink not found' });

    const [recipeRows, stepRows, modifierRows, milkRows] = await Promise.all([
      sql<RecipeRow[]>`
        SELECT size, iced, ingredient, quantity, unit
        FROM drink_recipes
        WHERE drink_id = ${drinkId} AND size = ${size} AND iced = ${iced}
      `,
      sql<StepRow[]>`
        SELECT step_number, template, applies_when
        FROM drink_steps
        WHERE drink_id = ${drinkId} AND iced = ${iced}
        ORDER BY step_number
      `,
      modifierIds.length > 0
        ? sql<ModifierRow[]>`
            SELECT m.id, m.name, mr.quantity, mr.unit
            FROM modifiers m
            JOIN modifier_recipes mr ON mr.modifier_id = m.id
            WHERE m.id IN ${sql(modifierIds)} AND mr.size = ${size}
          `
        : Promise.resolve([] as ModifierRow[]),
      milkName !== null
        ? sql<MilkRow[]>`SELECT id, name FROM milks WHERE name = ${milkName}`
        : Promise.resolve([] as MilkRow[]),
    ]);

    if (recipeRows.length === 0) {
      return res.status(404).json({
        error: `No recipe for ${drink.name} size=${size} iced=${iced}`,
      });
    }

    const ingredients: Record<string, { quantity: number | null; unit: string | null }> = {};
    for (const r of recipeRows) {
      ingredients[r.ingredient] = {
        quantity: r.quantity === null ? null : Number(r.quantity),
        unit: r.unit,
      };
    }

    const needsMilk = 'milk' in ingredients;
    if (needsMilk) {
      if (milkName === null) {
        return res.status(400).json({ error: 'Milk selection required for this drink' });
      }
      if (milkRows.length === 0) {
        return res.status(400).json({ error: `Unknown milk: ${milkName}` });
      }
    }
    const resolvedMilkName = milkRows[0]?.name.toLowerCase() ?? 'milk';

    const hasModifier = modifierRows.length > 0;
    const firstModifier = modifierRows[0];
    const totalPumps = modifierRows.reduce((sum, m) => sum + Number(m.quantity), 0);
    const flavorName = firstModifier ? firstModifier.name.replace(/\s*syrup$/i, '').toLowerCase() : 'flavor';

    const shots = ingredients['espresso']?.quantity ?? 0;

    const substitutions: Record<string, string> = {
      shots: String(shots),
      pumps: String(totalPumps),
      size,
      flavor: flavorName,
      milk: resolvedMilkName,
    };

    const steps = stepRows
      .filter((s) => {
        if (s.applies_when === 'has_modifier') return hasModifier;
        if (s.applies_when === 'no_modifier') return !hasModifier;
        return true;
      })
      .map((s) => ({
        stepNumber: Number(s.step_number),
        text: s.template.replace(/\{(\w+)\}/g, (_, key) => substitutions[key] ?? `{${key}}`),
      }));

    return res.status(200).json({
      id: drink.id,
      name: drink.name,
      category: drink.category,
      size,
      iced,
      ingredients,
      milk: milkRows[0] ?? null,
      modifiers: modifierRows.map((m) => ({
        id: m.id,
        name: m.name,
        quantity: Number(m.quantity),
        unit: m.unit,
      })),
      steps,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
