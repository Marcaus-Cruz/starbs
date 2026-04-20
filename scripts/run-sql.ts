import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set. Run `vercel env pull` or set it in .env.local');
  process.exit(1);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: tsx scripts/run-sql.ts <file.sql> [file.sql ...]');
  process.exit(1);
}

const sql = postgres(url, { ssl: 'require', max: 1 });

try {
  for (const file of files) {
    const path = resolve(file);
    const content = readFileSync(path, 'utf8');
    console.log(`→ ${file}`);
    await sql.begin(async (tx) => {
      await tx.unsafe(content);
    });
    console.log(`  ok`);
  }
} catch (e) {
  console.error('SQL execution failed:', e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await sql.end();
}
