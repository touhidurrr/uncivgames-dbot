import Message from '@modules/message.js';
import { getGame } from '@modules/onlineMultiplayer.js';
import prisma from '@modules/prisma.js';
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

    await prisma.game.update({
      where: { id: gameId },
      data: { name, updatedAt: Date.now() },
    });

    return new Message({
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
