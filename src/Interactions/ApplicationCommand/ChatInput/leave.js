const Message = require('../../../modules/message.js');
const Channels = require('../../../channels.json');
const Discord = require('../../../modules/discordApi.js');
const MongoDB = require('../../../modules/mongodbApi.js');
const Permissions = require('../../../modules/permissionsManager.js');

module.exports = {
  name: 'leave',
  guildId: '866650187211210762',
  description: 'Leaves a Game Channel',
  async respond(interaction) {
    const { name, parent_id } = await Discord('GET', `/channels/${interaction.channel_id}`);

    if (parent_id !== Channels.Games || !RegExp('^game-\\d+$').test(name)) {
      return new Message(
        {
          title: 'Leave Prompt',
          description:
            'Only usable in **G**ame **C**hannels !' +
            '\nUse this command to leave a **G**ame **C**hannel.',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const { id, username, discriminator } = interaction.member.user;

    let dmChannel = null;
    const queryRespone = await MongoDB.findOne('PlayerProfiles', id, { _id: 0, dmChannel: 1 });

    if (!queryRespone) {
      dmChannel = await Discord('POST', '/users/@me/channels', { recipient_id: id }).then(
        ch => ch.id
      );
      await MongoDB.insertOne('PlayerProfiles', {
        _id: id,
        games: {
          won: 0,
          lost: 0,
          played: 0,
          winPercentage: null,
        },
        rating: null,
        uncivUserIds: [],
        notifications: 'enabled',
        dmChannel,
      });
    }

    if (!dmChannel || !queryRespone.dmChannel) {
      dmChannel = await Discord('POST', '/users/@me/channels', { recipient_id: id }).then(
        ch => ch.id
      );
      await MongoDB.updateOne('PlayerProfiles', userId, { $set: { dmChannel } });
    }

    if (!dmChannel) dmChannel = queryRespone.dmChannel;

    await Discord('PUT', `/channels/${interaction.channel_id}/permissions/${id}`, {
      type: 1,
      deny: String(Permissions.VIEW_CHANNEL),
    });

    await Discord(
      'POST',
      `/channels/${dmChannel}/messages`,
      new Message({
        title: 'Leave Prompt',
        description: `You have left **Game ${name.slice(5)}**`,
      }).body.data
    );

    return new Message({
      title: 'Leave Prompt',
      description: `**${username}#${discriminator}** left the Channel !`,
    }).toResponse();
  },
};
