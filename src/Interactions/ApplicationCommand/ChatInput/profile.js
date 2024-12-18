const { stringify } = require('yaml');
import { InteractionContextType } from 'discord-api-types/v10';
import Message from '../../../modules/message.js';
import MongoDB from '../../../modules/mongodb.js';

export default {
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

    if (interaction.context !== InteractionContextType.BotDM)
      profile.uncivUserIds = [
        `Count: ${profile.uncivUserIds.length}. You can only see your ids when dm the bot this command!`,
      ];

    return new Message({
      title: 'Profile Prompt',
      description: `\`\`\`yml\n# ${user.username}'s Profile\n${stringify(profile)}\n\`\`\``,
    }).toResponse();
  },
};
