import { PrismaLibSql } from '@prisma/adapter-libsql/web';
import { PrismaClient } from '@prismaGenerated/client';
import { env } from '@src/secrets';

let prisma: PrismaClient | null = null;

export async function getPrisma() {
  if (prisma) return prisma;

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

  prisma = new PrismaClient({ adapter });
  return prisma;
}
