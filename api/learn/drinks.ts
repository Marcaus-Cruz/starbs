import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_db';

type DrinkRow = { name: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const kindRaw = req.query.kind;
  const valueRaw = req.query.value;
  const kind = String(Array.isArray(kindRaw) ? kindRaw[0] : kindRaw ?? '');
  const value = String(Array.isArray(valueRaw) ? valueRaw[0] : valueRaw ?? '').replace(
    /\+/g,
    ' '
  );

  if (kind !== 'syrup' && kind !== 'milk') {
    return res.status(400).json({ error: "kind must be 'syrup' or 'milk'" });
  }
  if (!value) {
    return res.status(400).json({ error: 'Missing value' });
  }

  try {
    let rows: DrinkRow[];
    if (kind === 'syrup') {
      // Drinks whose recipe (any size/iced) includes this ingredient by default.
      rows = await sql<DrinkRow[]>`
        SELECT DISTINCT d.name
        FROM drinks d
        JOIN drink_recipes r ON r.drink_id = d.id
        WHERE LOWER(r.ingredient) = LOWER(${value})
        ORDER BY d.name
      `;
    } else {
      // Drinks whose default milk matches. defaultMilk lives in the JSON, not
      // the DB schema yet — for now, fall back to: any drink whose recipe uses
      // 'milk' AND the catalog default milk equals the requested value. The
      // catalog default lookup happens client-side via catalog.generated.ts.
      rows = await sql<DrinkRow[]>`
        SELECT DISTINCT d.name
        FROM drinks d
        JOIN drink_recipes r ON r.drink_id = d.id
        WHERE r.ingredient = 'milk'
        ORDER BY d.name
      `;
    }

    return res.status(200).json({ drinks: rows.map((r) => r.name) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
