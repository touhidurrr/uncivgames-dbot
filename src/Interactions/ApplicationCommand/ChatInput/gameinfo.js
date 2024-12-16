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
      autocomplete: true,
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

    const game = await onlineMultiplayer.getFullGame(gameId);

    if (game === null) {
      return new Message(
        {
          title: 'GameInfo Prompt',
          description: "Game doesn't exist !",
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const {
      turns,
      currentPlayer,
      civilizations,
      gameParameters,
      tileMap: { mapParameters },
      version: { createdWith },
    } = game;

    const { seed } = mapParameters;

    delete gameParameters.players;
    delete mapParameters.seed;

    return new Message({
      title: 'GameInfo Prompt',
      fields: [
        {
          name: 'game ID',
          value: `\`\`\`js\n${gameId}\n\`\`\``,
        },
        {
          name: 'Turns',
          value: `\`\`\`js\n${turns || 0}\n\`\`\``,
          inline: true,
        },
        {
          name: 'Current Turn',
          value: `\`\`\`js\n${currentPlayer}\n\`\`\``,
          inline: true,
        },
        {
          name: 'Players',
          value: `\`\`\`js\n${civilizations
            .filter(c => c.playerType === 'Human')
            .map(c => c.civName)
            .join(', ')}\n\`\`\``,
        },
        {
          name: 'Seed',
          value: `\`\`\`js\n${seed}\n\`\`\``,
          inline: true,
        },
        {
          name: 'Made With',
          value: `\`\`\`js\n${createdWith.text} (Build ${createdWith.number})\n\`\`\``,
          inline: true,
        },
        {
          name: 'Map Parameters',
          value: `\`\`\`js\n${JSON.stringify(mapParameters, null, 2)}\n\`\`\``,
        },
        {
          name: 'Game Parameters',
          value: `\`\`\`js\n${JSON.stringify(gameParameters, null, 2)}\n\`\`\``,
        },
      ],
    }).toResponse();
  },
};
