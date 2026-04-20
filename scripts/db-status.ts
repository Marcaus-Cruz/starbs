import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = postgres(url, { ssl: 'require', max: 1 });

try {
  const rows = await sql<{ table_name: string; row_count: number }[]>`
    SELECT 'drinks'           AS table_name, COUNT(*)::int AS row_count FROM drinks
    UNION ALL SELECT 'drink_recipes',    COUNT(*)::int FROM drink_recipes
    UNION ALL SELECT 'drink_steps',      COUNT(*)::int FROM drink_steps
    UNION ALL SELECT 'milks',            COUNT(*)::int FROM milks
    UNION ALL SELECT 'modifiers',        COUNT(*)::int FROM modifiers
    UNION ALL SELECT 'modifier_recipes', COUNT(*)::int FROM modifier_recipes
  `;
  console.table(rows);
} finally {
  await sql.end();
}
