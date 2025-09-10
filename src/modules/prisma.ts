import { PrismaLibSQL } from '@prisma/adapter-libsql/web';
import { PrismaClient } from '@prisma/client';
import type { DefaultArgs } from '@prisma/client/runtime/library';
import { env } from '@src/secrets';

let prisma: PrismaClient<
  {
    adapter: PrismaLibSQL;
  },
  never,
  DefaultArgs
> | null = null;

export async function getPrisma() {
  if (prisma) return prisma;

  const [TURSO_DATABASE_URL, TURSO_AUTH_TOKEN] = await Promise.all([
    env.TURSO_DATABASE_URL.get(),
    env.TURSO_AUTH_TOKEN.get(),
  ]);

  const adapter = new PrismaLibSQL(
    {
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
      intMode: 'bigint',
    },
    { timestampFormat: 'unixepoch-ms' }
  );

  prisma = new PrismaClient({ adapter });
  return prisma;
}
