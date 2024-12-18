import Message from '@modules/message.js';
import { getFullGame, getGame } from '@modules/onlineMultiplayer.js';
import {
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
  ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { stringify } from 'yaml';

const gameIdRegex = /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/;

export default {
  name: 'gamejson',
  description: 'Uploads a JSON file from given game ID',
  usage: '/gamejson game-id: <Unciv Multiplayer game ID>',
  example: '/gamejson game-id: 12345678-abcd-bcde-cdef-abc123456def',
  options: [
    {
      name: 'game-id',
      description: 'Unciv Multiplayer game ID',
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
    {
      name: 'preview',
      description: 'Whether the uploaded file should be a Preview file',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ] satisfies APIApplicationCommandOption[],
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    const gameId: string | undefined = interaction.data.options.find(
      o => o.name === 'game-id'
      //@ts-ignore
    )?.value;

    if (!gameId || !gameIdRegex.test(gameId)) {
      return new Message(
        {
          title: 'GameJSON Prompt',
          description: 'Invalid game ID !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const preview: boolean | undefined = interaction.data.options.find(
      o => o.name === 'preview'
      //@ts-ignore
    )?.value;

    const game = await (preview ? getGame(gameId) : getFullGame(gameId));

    if (!game) {
      return new Message({
        title: 'GameJSON Prompt',
        description: 'Game not found !',
      }).toResponse();
    }

    const filename = `${gameId}${preview ? '_Preview' : ''}.json`;

    return new Message({
      title: 'GameJSON Prompt',
      description: 'Your JSON is ready !',
    })
      .addFile({
        filename,
        data: [JSON.stringify(game, null, 2)],
        description: `JSON ${preview ? 'Preview ' : ''}file for Game ${gameId}`,
      })
      .toResponse();
  },
};
