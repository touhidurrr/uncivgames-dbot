import { APIEmbed } from 'discord-api-types/v10';

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

// Support
export const SUPPORT_CHANNEL_NAME = 'Buy Me A Coffee';
export const SUPPORT_URL = 'https://buymeacoffee.com/touhidurrr';
export const SUPPORT_MESSAGE = `Enjoying UncivServer.xyz? Consider supporting the project at https://uncivserver.xyz/support !`;
export const SUPPORT_EMBED_MESSAGE = `Enjoying **UncivServer.xyz**? **[${SUPPORT_CHANNEL_NAME}](${SUPPORT_URL})**!`;

export const SUPPORT_EMBED: Readonly<APIEmbed> = {
  author: {
    name: 'Support UncivServer.xyz & UncivGames Democracy Bot!',
    icon_url: 'https://media.giphy.com/media/TDQOtnWgsBx99cNoyH/giphy.gif',
  },
  description: SUPPORT_EMBED_MESSAGE,
  color: 0xffdd00,
};
