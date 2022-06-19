const Message = require('../../../modules/message.js');
const Channels = require('../../../channels.json');
const Permissions = require('../../../modules/permissionsManager.js');
const Discord = require('../../../modules/discordApi.js');

module.exports = {
  name: 'add',
  description: 'Adds a player in a Game Channel',
  guildId: '866650187211210762',
  options: [
    {
      name: 'player',
      description: 'Mention a Player',
      type: 6,
      required: true,
    },
  ],
  async respond(interaction) {
    const { name, parent_id } = await Discord('GET', `/channels/${interaction.channel_id}`);

    if (parent_id !== Channels.Games || !RegExp('^game-\\d+$').test(name)) {
      return new Message(
        { title: 'Add Prompt', description: 'Only usable in **G**ame **C**hannels !' },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    if (!new Permissions(interaction.member.permissions).has(Permissions.MANAGE_ROLES)) {
      return new Message(
        {
          title: 'Add Prompt',
          description: 'Only usable by the **O**wner of a **G**ame **C**hannel !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const targetId = interaction.data.options[0].value;
    const targetPerms = interaction.data.resolved.members[targetId].permissions;

    if (!new Permissions(targetPerms).has(Permissions.VIEW_CHANNEL)) {
      await Discord('PUT', `/channels/${interaction.channel_id}/permissions/${targetId}`, {
        type: 1,
        allow: String(Permissions.VIEW_CHANNEL),
      });

      const { username, discriminator } = interaction.data.resolved.users[targetId];

      return new Message({
        title: 'Add Prompt',
        description: `Added **${username}#${discriminator}** !`,
      }).toResponse();
    }

    return new Message(
      {
        title: 'Add Prompt',
        description: 'The User already has Permission to view this Channel !',
      },
      Message.Flags.EPHEMERAL
    ).toResponse();
  },
};
