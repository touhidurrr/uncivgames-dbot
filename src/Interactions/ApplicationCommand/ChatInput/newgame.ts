import Discord from '@modules/discord.js';
import Message from '@modules/message.js';
import { TIMESTAMP_SQL } from '@src/constants.js';
import prisma, { libsql } from '@src/modules/prisma.js';
import {
  APIChatInputApplicationCommandInteraction,
  RESTPostAPIChannelMessageResult,
  Routes,
} from 'discord-api-types/v10';

const INCREMENT_GAMES_CREATED_SQL = `
update Variable set
  "value" = cast("value" + 1 as text),
  "updatedAt" = ${TIMESTAMP_SQL}
where id = "Games Count";
`;

export default {
  name: 'newgame',
  description: 'Creates a new Game Channel',
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    if (!interaction.guild_id) {
      return new Message(
        {
          title: 'NewGame Prompt',
          description: `Not Available in DMs !`,
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    // Get Game Number
    const gameNo = await prisma.variable
      .findUniqueOrThrow({
        where: { id: 'Games Count' },
        select: { value: true },
      })
      .then(({ value }) => value);

    // Create Message
    const { id, channel_id } = (await Discord(
      'POST',
      Routes.channelMessages(interaction.channel.id),
      new Message({
        title: `Game ${gameNo} Prompt`,
        description:
          'A new Game Chat has been Opened !**' +
          `\nOpened By\t:\t<@${interaction.member.user.id}>` +
          `\nTime\t\t\t:\t<t:${Math.floor(Date.now() / 1000)}:R>**`,
      }).getData()
    )) as RESTPostAPIChannelMessageResult;

    if (!id) {
      // Notify failure
      return new Message(
        {
          title: 'NewGame Prompt',
          description: `Failed !`,
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    // Open Thread & Increment Game number
    await Promise.all([
      Discord('POST', Routes.threads(channel_id, id), {
        name: `Game ${gameNo}`,
      }),
      libsql.execute(INCREMENT_GAMES_CREATED_SQL),
    ]);

    // Respond
    return new Message(
      {
        title: 'NewGame Prompt',
        description: `Success !`,
      },
      Message.Flags.Ephemeral
    ).toResponse();
  },
};
