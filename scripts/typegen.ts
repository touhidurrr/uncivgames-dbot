import { PRISMA_SCHEMA_URL } from '@src/constants.js';
import { rm } from 'node:fs/promises';

const cleanup = () =>
  Promise.all([
    rm('prisma/temp.db', { force: true }),
    rm('.wrangler', { recursive: true, force: true }),
  ]);

await cleanup();
await Bun.$`prisma generate`;
await Bun.$`bunx wrangler types src/types.d.ts --include-runtime false`;
await cleanup();
