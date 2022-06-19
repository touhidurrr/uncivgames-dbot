const Message = require('../../../modules/message.js');
const Discord = require('../../../modules/discordApi.js');
const Channels = require('../../../channels.json');

module.exports = {
  name: 'unpin',
  guildId: '866650187211210762',
  description: 'Unpin your message from a Game Channel',
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
          title: 'Unpin Prompt',
          description: 'Only usable in **G**ame **C**hannels !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const messageId = interaction.data.options[0].value;
    const message = (await Discord('GET', `/channels/${interaction.channel_id}/pins`)).find(
      msg => msg.id === messageId
    );

    if (!message) {
      return new Message(
        {
          title: 'Unpin Prompt',
          description: 'There is no such Message Pinned !',
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

    await Discord('DELETE', `/channels/${interaction.channel_id}/pins/${messageId}`);

    return new Message({
      title: 'Unpin Prompt',
      description: `<@${interaction.member.user.id}> tried to Unpin a Message !`,
    }).toResponse();
  },
};
