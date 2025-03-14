import type { Event } from '@cloudflare/workers-types';
import {
  RESTPostAPIChannelMessageCrosspostResult,
  RESTPostAPIChannelMessageResult,
  Routes,
} from 'discord-api-types/v10';
import { UNCIV_UPDATE_CHANNEL_ID } from './constants.js';
import Discord from './modules/discord.js';
import Message from './modules/message.js';
import prisma from './modules/prisma.js';
import secrects from './secrets.js';

//@ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

var subRequestCount = 0;

export async function scheduled(event: Event, env, ctx) {
  secrects.setEnv(env);

  const githubApi =
    'https://api.github.com/repos/yairm210/Unciv/releases/latest';

  const releaseId = await prisma.variable
    .findUniqueOrThrow({
      where: { id: 'Unciv Release Id' },
      select: { value: true },
    })
    .then(({ value }) => +value);

  let { id, tag_name, html_url, assets } = await fetch(githubApi, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'UncivGames Democracy Bot',
    },
  }).then(
    res =>
      res.json() as Promise<{
        id: number;
        tag_name: string;
        html_url: string;
        assets: any[];
      }>
  );

  ++subRequestCount;

  if (!(id > releaseId)) return;
  if (assets.length < 6) return;

  await Promise.all([
    Discord<any, RESTPostAPIChannelMessageResult>(
      'POST',
      Routes.channelMessages(UNCIV_UPDATE_CHANNEL_ID),
      new Message('<@&1110904546642886679>')
        .addEmbed({
          fields: [
            {
              name: 'Release Id',
              value: id.toString(),
              inline: true,
            },
            {
              name: 'Version',
              value: `[${tag_name}](${html_url})`,
              inline: true,
            },
            !assets
              ? undefined
              : {
                  name: 'Attachments',
                  value: assets
                    .map(a => `[${a.name}](${a.browser_download_url})`)
                    .join('\n'),
                },
          ],
        })
        .getData()
    ).then(({ id }) =>
      Discord<any, RESTPostAPIChannelMessageCrosspostResult>(
        'POST',
        Routes.channelMessageCrosspost(UNCIV_UPDATE_CHANNEL_ID, id)
      )
    ),
    prisma.variable.update({
      where: { id: 'Unciv Release Id' },
      data: { value: id.toString(), updatedAt: Date.now() },
    }),
  ]);

  subRequestCount += 2;
}
