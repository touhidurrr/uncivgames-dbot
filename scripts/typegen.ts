import { PRISMA_SCHEMA_URL } from '@src/constants.js';
import { rm } from 'node:fs/promises';

const cleanup = () =>
  Promise.all([
    rm('prisma/temp.db', { force: true }),
    rm('.wrangler', { recursive: true, force: true }),
  ]);

await cleanup();
await Promise.all([
  Bun.$`prisma generate`,
  Bun.$`bunx wrangler types src/types.d.ts --include-runtime false`.then(
    () => Bun.$`bunx prettier --write src/types.d.ts`
  ),
]);
await cleanup();
