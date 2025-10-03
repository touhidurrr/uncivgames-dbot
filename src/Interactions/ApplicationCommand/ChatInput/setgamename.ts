import { enCode, getResponseInfoEmbed } from '@lib';
import { api, APIProfile } from '@modules/api';
import Message from '@modules/message';
import { getGame } from '@modules/onlineMultiplayer';
import { MAX_GAME_NAME_LENGTH, UUID_REGEX } from '@src/constants';
import {
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
  ApplicationCommandOptionType,
} from 'discord-api-types/v10';

export default {
  name: 'setgamename',
  description:
    'Name a Multiplayer Game to appear on UncivServer.xyz Turn Notifications',
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
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
  ] satisfies APIApplicationCommandOption[],
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    if (
      interaction.data.options[0]?.type !==
        ApplicationCommandOptionType.String ||
      interaction.data.options[1]?.type !== ApplicationCommandOptionType.String
    ) {
      return new Message(
        {
          title: 'SetGameName Prompt Error',
          description: 'Unrecognized option type !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const gameId = interaction.data.options[1].value.trim();

    if (!gameId || !UUID_REGEX.test(gameId)) {
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

    const userId = !interaction.user
      ? interaction.member.user.id
      : interaction.user.id;

    const profRes = await api.getProfile(userId);
    if (!profRes.ok) return getResponseInfoEmbed(profRes);
    const { uncivUserIds } = (await profRes.json()) as APIProfile;

    if (
      !(game.civilizations as { playerId?: string }[]).find(
        c => c.playerId && uncivUserIds.includes(c.playerId)
      )
    ) {
      return new Message(
        {
          title: 'SetGameName Prompt',
          description: 'You are not a Player of this Game !',
          footer:
            'Note: Use `/addid` command to add your Unciv user ID to your Profile',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const name = interaction.data.options[0].value.trim().replace(/\s+/g, ' ');

    if (name.length > MAX_GAME_NAME_LENGTH) {
      return new Message(
        {
          title: 'SetGameName Prompt',
          description: `Error: Name too Big !\nMax ${MAX_GAME_NAME_LENGTH} characters allowed.`,
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const setRes = await api.setGameName(gameId, name);
    return !setRes.ok
      ? getResponseInfoEmbed(setRes)
      : new Message({
          title: 'SetGameName Prompt',
          description: 'Name Set !',
          fields: [
            {
              name: 'game ID',
              value: enCode(gameId),
            },
            {
              name: 'New Name',
              value: enCode(name),
              inline: true,
            },
          ],
        }).toResponse();
  },
};
