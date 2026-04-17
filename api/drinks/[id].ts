import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';

type RecipeRow = {
  size: string;
  iced: boolean;
  ingredient: string;
  quantity: string;
  unit: string;
};

type StepRow = {
  step_number: number;
  instruction: string;
};

type DrinkRow = {
  id: number;
  name: string;
  category: string | null;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const idParam = req.query.id;
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid drink id' });
  }

  try {
    const [drinkRows, recipeRows, stepRows] = await Promise.all([
      sql<DrinkRow[]>`
        SELECT id, name, category
        FROM drinks
        WHERE id = ${id}
      `,
      sql<RecipeRow[]>`
        SELECT size, iced, ingredient, quantity, unit
        FROM drink_recipes
        WHERE drink_id = ${id}
        ORDER BY iced, size, ingredient
      `,
      sql<StepRow[]>`
        SELECT step_number, instruction
        FROM drink_steps
        WHERE drink_id = ${id}
        ORDER BY step_number
      `,
    ]);

    const drink = drinkRows[0];
    if (!drink) return res.status(404).json({ error: 'Drink not found' });

    // Fold relational rows into the nested shape the frontend expects:
    // variants[].ingredients[name] = { quantity, unit }
    const variantMap = new Map<
      string,
      {
        size: string;
        iced: boolean;
        ingredients: Record<string, { quantity: number; unit: string }>;
      }
    >();
    for (const r of recipeRows) {
      const key = `${r.size}|${r.iced}`;
      let v = variantMap.get(key);
      if (!v) {
        v = { size: r.size, iced: r.iced, ingredients: {} };
        variantMap.set(key, v);
      }
      v.ingredients[r.ingredient] = { quantity: Number(r.quantity), unit: r.unit };
    }

    return res.status(200).json({
      id: drink.id,
      name: drink.name,
      category: drink.category,
      variants: Array.from(variantMap.values()),
      steps: stepRows.map((s) => ({ stepNumber: s.step_number, instruction: s.instruction })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
