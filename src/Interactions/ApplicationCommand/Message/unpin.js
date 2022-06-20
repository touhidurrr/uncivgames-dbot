const Message = require('../../../modules/message.js');
const Discord = require('../../../modules/discordApi.js');
const Channels = require('../../../channels.json');

module.exports = {
  name: 'unpin',
  guildId: '866650187211210762',
  async respond(interaction) {
    const { messages } = interaction.data.resolved;
    const message = messages[Object.keys(messages)[0]];
    const { name, parent_id } = await Discord('GET', `/channels/${message.channel_id}`);

    if (parent_id !== Channels.Games || !RegExp('^game-\\d+$').test(name)) {
      return new Message(
        {
          title: 'Unpin Prompt',
          description: 'Only usable in **G**ame **C**hannels !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    if (message.author.id !== interaction.member.user.id) {
      return new Message(
        {
          title: 'Unpin Prompt',
          description: 'You are not the Author of this Message !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    if (!message.pinned) {
      return new Message(
        {
          title: 'Unpin Prompt',
          description: 'This Message is not Pinned !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    await Discord('DELETE', `/channels/${message.channel_id}/pins/${message.id}`);

    return new Message({
      title: 'Unpin Prompt',
      description: `<@${message.author.id}> tried to Unpin a Message !`,
    }).toResponse();
  },
};
