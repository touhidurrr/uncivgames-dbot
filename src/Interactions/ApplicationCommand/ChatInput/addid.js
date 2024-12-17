import Discord from '../../../modules/discord';
import Message from '../../../modules/message';
import MongoDB from '../../../modules/mongodb';

const uncivUserIdRegex = /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/;

export default {
  name: 'addid',
  description: 'Adds an Unciv user ID to your Profile',
  usage: '/addid unciv-user-id: <Unciv user ID>',
  example: '/addid unciv-user-id: 12345678-abcd-bcde-cdef-abc123456def',
  options: [
    {
      name: 'unciv-user-id',
      description: 'Your Unciv user ID',
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
          title: 'AddID Prompt',
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
          uncivUserIds: [uncivUserId],
          notifications: 'enabled',
        });
      } else if (playerProfile.arrayLength === 10) {
        return new Message({
          title: 'AddID Prompt',
          description:
            "You already have 10 user ID's in your Profile !" + '\nRemove some to add another one.',
        }).toResponse();
      } else {
        await MongoDB.updateOne('PlayerProfiles', userId, {
          $addToSet: { uncivUserIds: uncivUserId },
        });
      }

      return new Message({
        title: 'AddID Prompt',
        description: 'user ID added to your profile !',
      }).toResponse();
    } else if (queryResponse._id === userId) {
      return new Message({
        title: 'AddID Prompt',
        description: 'Already in your Profile !',
      }).toResponse();
    }

    const { username, discriminator } = await Discord('GET', `/users/${queryResponse._id}`);
    const uniqueName = discriminator !== '0' ? `${username}#${discriminator}` : `@${username}`;

    return new Message({
      title: 'AddID Prompt',
      description: `This ID is Already owned by **${uniqueName}** !`,
    }).toResponse();
  },
};
