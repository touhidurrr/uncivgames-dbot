import { PrismaLibSql } from '@prisma/adapter-libsql/web';
import { PrismaClient } from '@prismaGenerated/edge';
import { env } from 'cloudflare:workers';

const [TURSO_DATABASE_URL, TURSO_AUTH_TOKEN] = await Promise.all([
  env.TURSO_DATABASE_URL.get(),
  env.TURSO_AUTH_TOKEN.get(),
]);

const adapter = new PrismaLibSql(
  {
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
    intMode: 'bigint',
  },
  { timestampFormat: 'unixepoch-ms' }
);

export const prisma = new PrismaClient({ adapter });
