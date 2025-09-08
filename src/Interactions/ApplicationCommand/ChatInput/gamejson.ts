import Discord from '@modules/discord.js';
import Message from '@modules/message.js';
import { getFullGame, getGame } from '@modules/onlineMultiplayer.js';
import { UUID_REGEX } from '@src/constants.js';
import {
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
  ApplicationCommandOptionType,
  InteractionContextType,
  RESTPostAPIChannelMessageResult,
  RESTPostAPICurrentUserCreateDMChannelJSONBody,
  RESTPostAPICurrentUserCreateDMChannelResult,
  Routes,
} from 'discord-api-types/v10';

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

    if (!gameId || !UUID_REGEX.test(gameId)) {
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

    const userId = interaction.user?.id ?? interaction.member?.user?.id;
    const filename = `${gameId}${preview ? '_Preview' : ''}.json`;
    const filedata = [JSON.stringify(game, null, 2)];

    if (interaction.context === InteractionContextType.BotDM) {
      return new Message({
        title: 'GameJSON Prompt',
        description: 'Your JSON is ready !',
      })
        .addAttachment({
          filename,
          data: filedata,
        })
        .toResponse();
    }

    try {
      const { id } = await Discord<
        RESTPostAPICurrentUserCreateDMChannelJSONBody,
        RESTPostAPICurrentUserCreateDMChannelResult
      >('POST', Routes.userChannels(), { recipient_id: userId });

      const fd = new Message({
        title: 'GameJSON Prompt',
        description: 'Your JSON is ready !',
      })
        .addAttachment({
          filename,
          data: filedata,
        })
        .getDataFormData();

      await Discord<any, RESTPostAPIChannelMessageResult>(
        'POST',
        Routes.channelMessages(id),
        fd
      );
    } catch {
      return new Message({
        title: 'GameJSON Prompt',
        description: 'Failed to DM user!',
      }).toResponse();
    }

    return new Message({
      title: 'GameJSON Prompt',
      description: 'Your JSON is sent to your inbox !',
    }).toResponse();
  },
};
