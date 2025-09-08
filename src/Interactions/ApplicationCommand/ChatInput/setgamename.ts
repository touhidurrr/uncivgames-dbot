import { getResponseInfoEmbed } from '@models';
import { api, APIProfile } from '@modules/api.js';
import Message from '@modules/message.js';
import { getGame } from '@modules/onlineMultiplayer.js';
import { MAX_GAME_NAME_LENGTH, UUID_REGEX } from '@src/constants.js';
import {
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
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
      type: 3,
      required: true,
      autocomplete: true,
    },
  ] satisfies APIApplicationCommandOption[],
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    // @ts-ignore
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

    const res = await api.getProfile(userId);
    if (!res.ok) return getResponseInfoEmbed(res);
    const { uncivUserIds } = (await res.json()) as APIProfile;

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

    //@ts-ignore
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

    const res2 = await api.setGameName(gameId, name);

    return !res2.ok
      ? getResponseInfoEmbed(res2)
      : new Message({
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
