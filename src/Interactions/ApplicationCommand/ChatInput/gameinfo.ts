import { enCode } from '@lib';
import Message from '@modules/message';
import { getFullGame } from '@modules/onlineMultiplayer';
import { UUID_REGEX } from '@src/constants';
import {
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
} from 'discord-api-types/v10';
import { stringify } from 'yaml';

export default {
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
  ] satisfies APIApplicationCommandOption[],
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    //@ts-ignore
    const gameId: string = interaction.data.options[0].value.trim();

    if (!gameId || !UUID_REGEX.test(gameId)) {
      return new Message(
        {
          title: 'GameInfo Prompt',
          description: 'Invalid game ID !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const game = await getFullGame(gameId);

    if (game === null) {
      return new Message(
        {
          title: 'GameInfo Prompt',
          description: "Game doesn't exist !",
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const {
      name,
      turns = 0,
      currentPlayer,
      civilizations,
      gameParameters,
      tileMap: { mapParameters },
      version: { createdWith },
    } = game;

    const { seed } = mapParameters;

    delete gameParameters.players;
    delete gameParameters.randomNationsPool;
    delete mapParameters.seed;
    delete mapParameters.createdWithVersion;

    return new Message({
      title: 'GameInfo Prompt',
      fields: [
        {
          name: 'game ID',
          value: enCode(gameId),
        },
        !name
          ? undefined
          : {
              name: 'Name',
              value: enCode(name),
            },
        {
          name: 'Turns',
          value: enCode(turns),
          inline: true,
        },
        {
          name: 'Current Turn',
          value: enCode(currentPlayer),
          inline: true,
        },
        {
          name: 'Players',
          value: enCode(
            civilizations
              .filter(c => c.playerType === 'Human')
              .map(c => c.civName)
              .join(', ')
          ),
        },
        {
          name: 'Seed',
          value: enCode(seed),
          inline: true,
        },
        {
          name: 'Made With',
          value: enCode(`${createdWith.text} (Build ${createdWith.number})`),
          inline: true,
        },
        {
          name: 'Map Parameters',
          value: enCode(stringify(mapParameters), 'yml'),
        },
        {
          name: 'Game Parameters',
          value: enCode(stringify(gameParameters), 'yml'),
        },
      ],
    }).toResponse();
  },
};
