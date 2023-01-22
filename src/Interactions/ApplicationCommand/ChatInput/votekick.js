const Message = require('../../../modules/message.js');
const onlineMultiplayer = require('../../../modules/onlineMultiplayer.js');

const gameIdRegex = /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/;

module.exports = {
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
  ],
  async respond(interaction) {
    const gameId = interaction.data.options[0].value.trim();

    if (!gameId || !gameIdRegex.test(gameId)) {
      return new Message(
        {
          title: 'VoteKick Prompt',
          description: 'Invalid game ID !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    await console.log(1);
    const game = await onlineMultiplayer.getFullGame(gameId);
    await console.log(2);

    if (game === null) {
      return new Message(
        {
          title: 'VoteKick Prompt',
          description: "Game doesn't exist !",
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const uniquePlayers = [
      ...new Set(game.civilizations.filter(c => c.playerId).map(c => c.playerId)),
    ];
    const playerCount = uniquePlayers.length;

    if (playerCount < 3) {
      return new Message(
        {
          title: 'VoteKick Prompt',
          description: 'VoteKick is only applicable to games with more than 3 Human players !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    return new Message({
      title: 'VoteKick Prompt',
      description: 'Test',
    }).toResponse();
  },
};
