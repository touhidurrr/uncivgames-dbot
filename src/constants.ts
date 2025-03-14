export const AUTHOR_ID = '577491473100963840';
export const MOD_ROLE_ID = '872192680095023215';
export const GUILD_ID = '866650187211210762';
export const UNCIV_UPDATE_CHANNEL_ID = '886341846383607878';

export const MAX_GAME_NAME_LENGTH = 50;

export const UUID_REGEX = /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/;
export const GAME_ID_REGEX =
  /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}(_Preview)?$/;

// SQL
export const PRISMA_SCHEMA_URL =
  'https://raw.githubusercontent.com/touhidurrr/UncivServer.xyz/refs/heads/turso/prisma/schema.prisma';
export const TIMESTAMP_SQL = "(cast(1000 * unixepoch('subsec') as integer))";

// misc
export const NUMBER_EMOJIS = [
  '0️⃣',
  '1️⃣',
  '2️⃣',
  '3️⃣',
  '4️⃣',
  '5️⃣',
  '6️⃣',
  '7️⃣',
  '8️⃣',
  '9️⃣',
  '🔟',
];
