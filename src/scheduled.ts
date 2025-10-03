import {
  RESTPostAPIChannelMessageCrosspostResult,
  RESTPostAPIChannelMessageResult,
  Routes,
} from 'discord-api-types/v10';
import { UNCIV_UPDATE_CHANNEL_ID } from './constants';
import Discord from './modules/discord';
import Message from './modules/message';
import { getPrisma } from './modules/prisma';
import secrets from './secrets';

export async function scheduled(
  _event: ScheduledController,
  env: Env
): Promise<void> {
  secrets.setEnv(env);
  const prisma = await getPrisma();

  const githubApi =
    'https://api.github.com/repos/yairm210/Unciv/releases/latest';

  const releaseId = await prisma.variable
    .findUniqueOrThrow({
      where: { id: 'UncivReleaseId' },
      select: { value: true },
    })
    .then(({ value }) => +value);

  const { id, tag_name, html_url, assets } = await fetch(githubApi, {
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
        assets: { name: string; browser_download_url: string }[];
      }>
  );

  if (!(id > releaseId)) return;
  if (assets.length < 6) return;

  await Promise.all([
    Discord<unknown, RESTPostAPIChannelMessageResult>(
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
      Discord<unknown, RESTPostAPIChannelMessageCrosspostResult>(
        'POST',
        Routes.channelMessageCrosspost(UNCIV_UPDATE_CHANNEL_ID, id)
      )
    ),
    prisma.variable.update({
      where: { id: 'UncivReleaseId' },
      data: { value: id.toString() },
    }),
  ]);
}
