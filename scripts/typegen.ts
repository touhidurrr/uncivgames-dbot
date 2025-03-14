import { PRISMA_SCHEMA_URL } from '@src/constants.js';
import { rm } from 'node:fs/promises';

const cleanup = () => rm('prisma', { recursive: true, force: true });

await cleanup();

await fetch(PRISMA_SCHEMA_URL).then(res =>
  Bun.write('prisma/schema.prisma', res)
);

await Bun.$`prisma generate`;
await cleanup();
