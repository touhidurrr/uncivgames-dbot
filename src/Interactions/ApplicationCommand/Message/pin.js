import Channels from '../../../channels.json';
import Discord from '../../../modules/discordApi.js';
import Message from '../../../modules/message.js';

export default {
  name: 'pin',
  guildId: '866650187211210762',
  async respond(interaction) {
    const { messages } = interaction.data.resolved;
    const message = messages[Object.keys(messages)[0]];
    const { name, parent_id } = await Discord('GET', `/channels/${message.channel_id}`);

    if (parent_id !== Channels.Games || !RegExp('^game-\\d+$').test(name)) {
      return new Message(
        {
          title: 'Pin Prompt',
          description: 'Only usable in **G**ame **C**hannels !',
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

    await Discord('PUT', `/channels/${message.channel_id}/pins/${message.id}`);

    return new Message({
      title: 'Pin Prompt',
      description: `<@${message.author.id}> tried to Pin a Message !`,
    }).toResponse();
  },
};
