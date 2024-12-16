import Channels from '../../../channels.json';
import Discord from '../../../modules/discordApi.js';
import Message from '../../../modules/message.js';

export default {
  name: 'pin',
  guildId: '866650187211210762',
  description: 'Pin your message on a Game Channel',
  options: [
    {
      name: 'message-id',
      description: 'Discord Message ID or Snowflake',
      type: 3,
      required: true,
    },
  ],
  async respond(interaction) {
    const { name, parent_id } = await Discord('GET', `/channels/${interaction.channel_id}`);

    if (parent_id !== Channels.Games || !RegExp('^game-\\d+$').test(name)) {
      return new Message(
        {
          title: 'Pin Prompt',
          description: 'Only usable in **G**ame **C**hannels !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    let message;
    const messageId = interaction.data.options[0].value;

    try {
      message = await Discord('GET', `/channels/${interaction.channel_id}/messages/${messageId}`);
    } catch (e) {
      return new Message(
        {
          title: 'Pin Prompt',
          description: 'Internal Error or Message not found !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    if (message.author.id !== interaction.member.user.id) {
      return new Message(
        {
          title: 'Pin Prompt',
          description: 'You are not the Author of this Message !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    if (message.pinned) {
      return new Message(
        {
          title: 'Pin Prompt',
          description: 'Already Pinned !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    await Discord('PUT', `/channels/${interaction.channel_id}/pins/${messageId}`);

    return new Message({
      title: 'Pin Prompt',
      description: `<@${interaction.member.user.id}> tried to Pin a Message !`,
    }).toResponse();
  },
};
