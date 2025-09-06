import { api, APIProfile } from '@modules/api.js';
import Message from '@modules/message.js';
import { getGame } from '@modules/onlineMultiplayer.js';
import { getPrisma } from '@modules/prisma.js';
import { UUID_REGEX } from '@src/constants.js';
import { getResponseInfoEmbed } from '@models';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';

export default {
  name: 'cleargamename',
  description:
    'Name a Multiplayer Game to appear on UncivServer.xyz Turn Notifications',
  options: [
    {
      name: 'game-id',
      description: 'UncivServer.xyz game ID!',
      type: 3,
      required: true,
      autocomplete: true,
    },
  ],
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    //@ts-ignore
    const gameId = interaction.data.options[0].value.trim();

    if (!gameId || !UUID_REGEX.test(gameId)) {
      return new Message(
        {
          title: 'ClearGameName Prompt',
          description: 'Invalid game ID !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const game = await getGame(gameId);

    if (game === null) {
      return new Message(
        {
          title: 'ClearGameName Prompt',
          description: "Game doesn't exist !",
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const prisma = await getPrisma();
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
          title: 'ClearGameName Prompt',
          description: 'You are not a Player of this Game !',
          footer:
            'Note: Use `/addid` command to add your Unciv user ID to your Profile',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const res2 = await api.clearGameName(gameId);

    return !res2.ok
      ? getResponseInfoEmbed(res2)
      : new Message({
          title: 'ClearGameName Prompt',
          description: 'Name Cleared !',
        }).toResponse();
  },
};
