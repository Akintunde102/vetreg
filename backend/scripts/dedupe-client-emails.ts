/**
 * One-off script: clear duplicate client emails per organization so that
 * @@unique([organization_id, email]) can be applied.
 * For each (org, email) with multiple clients, keeps the oldest and sets email = null on the rest.
 * Run from backend: npx dotenv -e .env -- npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/dedupe-client-emails.ts
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required');
const connectionString = url.replace(/[?&]sslmode=[^&]+/g, '').replace(/\?&/, '?').replace(/\?$/, '') || url;
const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const clients = await prisma.client.findMany({
    where: { email: { not: null } },
    select: { id: true, organizationId: true, email: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const key = (c: { organizationId: string; email: string | null }) =>
    `${c.organizationId}:${(c.email ?? '').toLowerCase().trim()}`;

  const byKey = new Map<string, typeof clients>();
  for (const c of clients) {
    if (!c.email?.trim()) continue;
    const k = key(c);
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(c);
  }

  let updated = 0;
  for (const [, group] of byKey) {
    if (group.length <= 1) continue;
    const [, ...dupes] = group;
    for (const d of dupes) {
      await prisma.client.update({
        where: { id: d.id },
        data: { email: null },
      });
      updated++;
    }
  }

  console.log(`Cleared email on ${updated} duplicate client(s).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
