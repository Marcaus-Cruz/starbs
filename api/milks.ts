import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const rows = await sql<{ id: number; name: string; is_default: boolean }[]>`
      SELECT id, name, is_default FROM milks ORDER BY is_default DESC, name
    `;
    return res.status(200).json(
      rows.map((r) => ({ id: r.id, name: r.name, isDefault: r.is_default }))
    );
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
}
