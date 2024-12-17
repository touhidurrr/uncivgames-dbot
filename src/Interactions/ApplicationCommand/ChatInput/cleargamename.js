import Message from '../../../modules/message';
import MongoDB from '../../../modules/mongodb';
import { getGame } from '../../../modules/onlineMultiplayer';

const gameIdRegex = /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/;

export default {
  name: 'cleargamename',
  description: 'Name a Multiplayer Game to appear on UncivServer.xyz Turn Notifications',
  options: [
    {
      name: 'game-id',
      description: 'UncivServer.xyz game ID!',
      type: 3,
      required: true,
      autocomplete: true,
    },
  ],
  async respond(interaction) {
    const gameId = interaction.data.options[0].value.trim();

    if (!gameId || !gameIdRegex.test(gameId)) {
      return new Message(
        {
          title: 'ClearGameName Prompt',
          description: 'Invalid game ID !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const game = await getGame(gameId);

    if (game === null) {
      return new Message(
        {
          title: 'ClearGameName Prompt',
          description: "Game doesn't exist !",
        },
        Message.Flags.EPHEMERAL
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
          title: 'ClearGameName Prompt',
          description: 'You are not a Player of this Game !',
          footer: 'Note: Use `/addid` command to add your Unciv user ID to your Profile',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    await MongoDB.updateMany('UncivServer', { _id: gameId + '_Preview' }, { $unset: { name: 1 } });

    return new Message({
      title: 'ClearGameName Prompt',
      description: 'Name Cleared !',
    }).toResponse();
  },
};
