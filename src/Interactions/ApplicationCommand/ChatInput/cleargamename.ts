import Message from '@modules/message.js';
import { getGame } from '@modules/onlineMultiplayer.js';
import prisma from '@modules/prisma.js';
import { UUID_REGEX } from '@src/constants.js';
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

    const userId = !interaction.user
      ? interaction.member.user.id
      : interaction.user.id;
    const profile = await prisma.profile.findFirst({
      where: { discordId: parseInt(userId) },
      select: { users: { select: { userId: true } } },
    });

    if (
      !profile ||
      !(game.civilizations as { playerId?: string }[]).find(
        c => c.playerId && profile.users.some(u => u.userId === c.playerId)
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

    await prisma.game.update({
      where: { id: gameId },
      data: { name: null, updatedAt: Date.now() },
    });

    return new Message({
      title: 'ClearGameName Prompt',
      description: 'Name Cleared !',
    }).toResponse();
  },
};
