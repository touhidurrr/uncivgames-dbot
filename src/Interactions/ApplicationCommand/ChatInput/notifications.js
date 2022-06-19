const Message = require('../../../modules/message.js');
const MongoDB = require('../../../modules/mongodbApi.js');

module.exports = {
  name: 'notifications',
  description: 'Enable or Disable Notifications',
  usage: '/notifications',
  example: '/notifications',
  async respond(interaction) {
    const userId = !interaction.user ? interaction.member.user.id : interaction.user.id;
    let profile = await MongoDB.findOne('PlayerProfiles', userId, { _id: 0, notifications: 1 });

    if (profile === null) {
      profile = {
        _id: userId,
        games: {
          won: 0,
          lost: 0,
          played: 0,
          winPercentage: null,
        },
        rating: null,
        uncivUserIds: [],
        notifications: 'enabled',
      };

      await MongoDB.insertOne('PlayerProfiles', profile);
    }

    let { notifications } = profile;
    const timestamp = Date.now();

    return new Message({
      title: 'Notifications Prompt',
      description: `Your Notifications are currently **${
        notifications.at(0).toUpperCase() + notifications.slice(1)
      }**.\nUse the buttons below to change this setting.`,
      footer: 'You have arround 300 seconds or more to react to this Message.',
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 3,
              label: 'Enable',
              custom_id: `notifications-${userId}-enabled-${timestamp}`,
              disabled: notifications === 'enabled',
            },
            {
              type: 2,
              style: 4,
              label: 'Disable',
              custom_id: `notifications-${userId}-disabled-${timestamp}`,
              disabled: notifications === 'disabled',
            },
          ],
        },
      ],
    }).toResponse();
  },
};
