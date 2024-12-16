import Message from '../../../modules/message';
import MongoDB from '../../../modules/mongodbApi';

export default {
  name: 'dropid',
  description: 'Drops one of your Unciv user Ids',
  options: [
    {
      name: 'position',
      description: 'Position of your user Id (default 1)',
      type: 4,
      min_value: 1,
    },
  ],
  async respond(interaction) {
    const position = interaction.data.options ? interaction.data.options[0].value : 1;
    const userId = interaction.user ? interaction.user.id : interaction.member.user.id;

    var profile = await MongoDB.findOne('PlayerProfiles', userId, { _id: 0, uncivUserIds: 1 });

    if (!profile || !profile.uncivUserIds || profile.uncivUserIds.length < 1) {
      return new Message('You have no user Ids available!').toResponse();
    }

    if (position > profile.uncivUserIds.length) {
      return new Message("Position doesn't exist !").toResponse();
    }

    return new Message(profile.uncivUserIds[position - 1]).toResponse();
  },
};
