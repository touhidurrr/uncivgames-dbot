import Message from '../../../modules/message';
import MongoDB from '../../../modules/mongodb.js';
import { getGame } from '../../../modules/onlineMultiplayer.js';

const gameIdRegex = /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/;

export default {
  name: 'setgamename',
  description: 'Name a Multiplayer Game to appear on UncivServer.xyz Turn Notifications',
  options: [
    {
      name: 'name',
      description: 'Desired Name!',
      type: 3,
      required: true,
    },
    {
      name: 'game-id',
      description: 'UncivServer.xyz game ID!',
      type: 3,
      required: true,
      autocomplete: true,
    },
  ],
  async respond(interaction) {
    const gameId = interaction.data.options[1].value.trim();

    if (!gameId || !gameIdRegex.test(gameId)) {
      return new Message(
        {
          title: 'SetGameName Prompt',
          description: 'Invalid game ID !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const game = await getGame(gameId);

    if (game === null) {
      return new Message(
        {
          title: 'SetGameName Prompt',
          description: "Game doesn't exist !",
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const userId = !interaction.user ? interaction.member.user.id : interaction.user.id;
    const profile = await MongoDB.findOne('PlayerProfiles', userId, { _id: 0, uncivUserIds: 1 });

    if (
      !profile ||
      !profile.uncivUserIds ||
      !game.civilizations.find(p => p.playerId && profile.uncivUserIds.includes(p.playerId))
    ) {
      return new Message(
        {
          title: 'SetGameName Prompt',
          description: 'You are not a Player of this Game !',
          footer: 'Note: Use `/addid` command to add your Unciv user ID to your Profile',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const name = interaction.data.options[0].value.trim().replace(/\s+/g, ' ');

    if (name.length > 36) {
      return new Message(
        {
          title: 'SetGameName Prompt',
          description: 'Error: Name too Big !\nAllowed 50 Characters Max.',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    await MongoDB.updateMany('UncivServer', { _id: gameId + '_Preview' }, { $set: { name } });

    return new Message({
      title: 'SetGameName Prompt',
      description: 'Name Set !',
      fields: [
        {
          name: 'game ID',
          value: `\`\`\`js\n${gameId}\n\`\`\``,
        },
        {
          name: 'New Name',
          value: `\`\`\`js\n${name}\n\`\`\``,
          inline: true,
        },
      ],
    }).toResponse();
  },
};
