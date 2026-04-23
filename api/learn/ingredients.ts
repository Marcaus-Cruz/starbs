import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';

type IngredientRow = { ingredient: string };
type MilkRow = { name: string };

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const [syrups, milks] = await Promise.all([
      sql<IngredientRow[]>`
        SELECT DISTINCT ingredient
        FROM drink_recipes
        WHERE ingredient ILIKE '%syrup%'
           OR ingredient ILIKE '%sauce%'
        ORDER BY ingredient
      `,
      sql<MilkRow[]>`
        SELECT name FROM milks ORDER BY name
      `,
    ]);

    return res.status(200).json({
      syrups: syrups.map((r) => r.ingredient),
      milks: milks.map((r) => r.name),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
