const Message = require('../../../modules/message.js');
const onlineMultiplayer = require('../../../modules/onlineMultiplayer.js');

const gameIdRegex = /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/;

module.exports = {
  name: 'gameinfo',
  description: 'Show information about Unciv Multiplayer Games',
  usage: '/gameinfo game-id: <Unciv Multiplayer game ID>',
  example: '/gameinfo game-id: 12345678-abcd-bcde-cdef-abc123456def',
  options: [
    {
      name: 'game-id',
      description: 'Unciv Multiplayer game ID',
      type: 3,
      required: true,
    },
  ],
  async respond(interaction) {
    const gameId = interaction.data.options[0].value.trim();

    if (!gameId || !gameIdRegex.test(gameId)) {
      return new Message(
        {
          title: 'GameInfo Prompt',
          description: 'Invalid game ID !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const game = await onlineMultiplayer.getGame(gameId);

    if (game === null) {
      return new Message(
        {
          title: 'GameInfo Prompt',
          description: "Game doesn't exist !",
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    game.gameParameters.players = undefined;

    return new Message({
      title: 'GameInfo Prompt',
      fields: [
        {
          name: 'game ID',
          value: `\`\`\`js\n'${game.gameId}'\n\`\`\``,
        },
        {
          name: 'Turns',
          value: `\`\`\`js\n${game.turns || 0}\n\`\`\``,
          inline: true,
        },
        {
          name: 'Current Turn',
          value: `\`\`\`js\n'${game.currentPlayer}'\n\`\`\``,
          inline: true,
        },
        {
          name: 'Players',
          value: `\`\`\`js\n${game.civilizations
            .filter(c => c.playerType === 'Human')
            .map(c => c.civName)
            .join(', ')}\n\`\`\``,
        },
        {
          name: 'Game Settings',
          value: `\`\`\`js\n${JSON.stringify(game.gameParameters, null, 2)}\n\`\`\``,
        },
      ],
    }).toResponse();
  },
};
