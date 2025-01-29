import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';

export const libsql = createClient({
  url: env.TURSO_DATABASE_URL!,
  authToken: env.TURSO_AUTH_TOKEN!,
  intMode: 'bigint',
});

const adapter = new PrismaLibSQL(libsql);
export const prisma = new PrismaClient({ adapter });

export const getGameWithPrima = async (gameId: string) => {
  if (gameId.endsWith('_Preview')) {
    const game = await prisma.game.findUnique({
      where: { id: gameId.replace('_Preview', '') },
      select: { preview: true },
    });
    return game ? game.preview : null;
  }

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { save: true },
  });
  return game ? game.save : null;
};

await prisma.$connect();
export default prisma;
