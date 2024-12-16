const { stringify } = require('yaml');
const Message = require('../../../modules/message.js');
const MongoDB = require('../../../modules/mongodbApi.js');

module.exports = {
  name: 'profile',
  description: 'Shows a Players Profile',
  async respond(interaction) {
    const user = interaction.user || interaction.member.user;

    var profile = await MongoDB.findOne('PlayerProfiles', user.id, { dmChannel: 0 });

    if (profile === null) {
      profile = {
        _id: user.id,
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

    delete profile._id;

    return new Message({
      title: 'Profile Prompt',
      description:
        `\`\`\`yml\n# ${user.username}'s Profile\n${stringify(profile)}\n\`\`\``,
    }).toResponse();
  },
};
