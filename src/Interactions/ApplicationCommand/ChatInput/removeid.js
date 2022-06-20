const Message = require('../../../modules/message.js');
const MongoDB = require('../../../modules/mongodbApi.js');
const Discord = require('../../../modules/discordApi.js');

const uncivUserIdRegex = /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/;

module.exports = {
  name: 'removeid',
  description: 'Removes an Unciv user ID from your profile.',
  usage: '/removeid unciv-user-id: <Unciv user ID>',
  example: '/removeid unciv-user-id: 12345678-abcd-bcde-cdef-abc123456def',
  options: [
    {
      name: 'unciv-user-id',
      description: 'your Unciv user ID',
      type: 3,
      required: true,
    },
  ],
  async respond(interaction) {
    const uncivUserId = interaction.data.options[0].value.trim();
    const userId = !interaction.user ? interaction.member.user.id : interaction.user.id;

    if (!uncivUserId || !uncivUserIdRegex.test(uncivUserId)) {
      return new Message(
        {
          title: 'RemoveID Prompt',
          description: 'Invalid user ID !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const queryResponse = await MongoDB.findOne(
      'PlayerProfiles',
      { uncivUserIds: uncivUserId },
      { uncivUserIds: 1 }
    );

    if (queryResponse === null) {
      const playerProfile = await MongoDB.findOne('PlayerProfiles', userId, {
        _id: 0,
        arrayLength: { $size: '$uncivUserIds' },
      });

      if (playerProfile === null) {
        await MongoDB.insertOne('PlayerProfiles', {
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
        });
      }

      return new Message({
        title: 'RemoveID Prompt',
        description: 'Nobody owns this user ID !',
      }).toResponse();
    } else if (queryResponse._id === userId) {
      await MongoDB.updateOne('PlayerProfiles', userId, { $pull: { uncivUserIds: uncivUserId } });

      return new Message({
        title: 'RemoveID Prompt',
        description: 'I have tried to remove this user ID from your Profile !',
      }).toResponse();
    }

    const { username, discriminator } = await Discord('GET', `/users/${queryResponse._id}`);

    return new Message({
      title: 'RemoveID Prompt',
      description: `This ID is owned by **${username}#${discriminator}**, not You !`,
    }).toResponse();
  },
};
