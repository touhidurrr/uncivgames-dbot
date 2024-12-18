import Discord from '@modules/discord.js';
import Message from '@modules/message.js';
import MongoDB from '@modules/mongodb.js';
import {
  APIChatInputApplicationCommandInteraction,
  RESTPostAPIChannelMessageResult,
  Routes,
} from 'discord-api-types/v10';

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
    const gameNo = await MongoDB.findOne('Variables', 'Games Created', { _id: 0 }).then(
      doc => doc.value
    );

    // Create Message
    const { id, channel_id } = (await Discord(
      'POST',
      Routes.channelMessages(interaction.channel.id),
      new Message({
        title: `Game ${gameNo} Prompt`,
        description:
          'A new Game Chat has been Opened !**' +
          `\nOpened By\t:\t<@${interaction.member.user.id}>` +
          `\nTime\t\t\t:\t<t:${~~(Date.now() / 1000)}:R>**`,
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
      MongoDB.updateOne('Variables', 'Games Created', { $inc: { value: 1 } }),
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
