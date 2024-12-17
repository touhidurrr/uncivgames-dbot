import Message from '../../../modules/message.js';
import mongodbApi from '../../../modules/mongodb.js';
import { getFullGame } from '../../../modules/onlineMultiplayer.js';

const gameIdRegex = /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/;

export default {
  name: 'votekick',
  description: 'Kick a player by Unanimous Agreement!',
  usage: '/votekick game-id: <Unciv Multiplayer game ID>',
  example: '/votekick game-id: 12345678-abcd-bcde-cdef-abc123456def',
  options: [
    {
      name: 'game-id',
      description: 'Unciv Multiplayer game ID',
      type: 3,
      required: true,
      autocomplete: true,
    },
    {
      name: 'civ',
      description: 'Civilization to VoteKick!',
      type: 3,
      required: true,
    },
  ],
  async respond(interaction) {
    const gameId = interaction.data.options[0].value.trim();
    const civName = interaction.data.options[1].value.trim().toLowerCase();

    if (!gameId || !gameIdRegex.test(gameId)) {
      return new Message(
        {
          title: 'VoteKick Prompt',
          description: 'Invalid game ID !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const game = await getFullGame(gameId);

    if (game === null) {
      return new Message(
        {
          title: 'VoteKick Prompt',
          description: "Game doesn't exist !",
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const uniquePlayers = new Set(game.civilizations.filter(c => c.playerId).map(c => c.playerId));
    const playerCount = [...uniquePlayers].length;

    if (playerCount < 3) {
      return new Message(
        {
          title: 'VoteKick Prompt',
          description: 'VoteKick is only applicable to games with 3 or more Human players !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const playerToKick = game.civilizations.find(
      c => c.playerId && civName === c.civName.toLowerCase()
    )?.playerId;

    if (!playerToKick) {
      return new Message(
        {
          title: 'VoteKick Prompt',
          description: 'Civilization not found !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    uniquePlayers.delete(playerToKick);

    const registeredPlayers = await mongodbApi.find(
      'PlayerProfiles',
      { uncivUserIds: { $in: [...uniquePlayers] } },
      { _id: 1, uncivUserIds: 1 }
    );

    const registeredPlayerIds = registeredPlayers
      .map(r => r.uncivUserIds)
      .flat()
      .filter(id => uniquePlayers.has(id));

    if (registeredPlayerIds.length < playerCount - 1) {
      return new Message(
        {
          title: 'VoteKick Prompt',
          description:
            'VoteKick can only be initiated when all players except the player to kick is registered via `/addid`!',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    return new Message({
      title: 'VoteKick Prompt',
      description: 'Test Success!',
    }).toResponse();
  },
};
