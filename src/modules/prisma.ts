import { createClient } from '@libsql/client/web';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client/edge';
import { env } from '@src/secrets.js';

export const libsql = createClient({
  url: env.TURSO_DATABASE_URL!,
  authToken: env.TURSO_AUTH_TOKEN!,
  intMode: 'bigint',
});

// @ts-ignore url is not supposed to be empty
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
