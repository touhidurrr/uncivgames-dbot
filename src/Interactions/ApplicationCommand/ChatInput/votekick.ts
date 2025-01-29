import Message from '@modules/message.js';
import { getFullGame } from '@modules/onlineMultiplayer.js';
import prisma from '@modules/prisma.js';
import { UUID_REGEX } from '@src/constants.js';
import {
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
} from 'discord-api-types/v10';

export default {
  name: 'votekick',
  description: 'Kick a player by Unanimous Agreement!',
  usage: '/votekick game-id: <Unciv Multiplayer game ID>',
  example: '/votekick game-id: 12345678-abcd-bcde-cdef-abc123456def',
  options: [
    {
      name: 'game-id',
      description: 'Unciv Multiplayer game ID',
      type: 3,
      required: true,
      autocomplete: true,
    },
    {
      name: 'civ',
      description: 'Civilization to VoteKick!',
      type: 3,
      required: true,
    },
  ] satisfies APIApplicationCommandOption[],
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    //@ts-ignore
    const gameId: string = interaction.data.options[0].value.trim();
    //@ts-ignore
    const civName: string = interaction.data.options[1].value.trim().toLowerCase();

    if (!gameId || !UUID_REGEX.test(gameId)) {
      return new Message(
        {
          title: 'VoteKick Prompt',
          description: 'Invalid game ID !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const game = await getFullGame(gameId);

    if (game === null) {
      return new Message(
        {
          title: 'VoteKick Prompt',
          description: "Game doesn't exist !",
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const uniquePlayers = new Set(
      (game.civilizations as { playerId?: string }[]).filter(c => c.playerId).map(c => c.playerId)
    );
    const playerCount = uniquePlayers.size;

    if (playerCount < 3) {
      return new Message(
        {
          title: 'VoteKick Prompt',
          description: 'VoteKick is only applicable to games with 3 or more Human players !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const playerToKick = game.civilizations.find(
      c => c.playerId && civName === c.civName.toLowerCase()
    )?.playerId;

    if (!playerToKick) {
      return new Message(
        {
          title: 'VoteKick Prompt',
          description: 'Civilization not found !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    uniquePlayers.delete(playerToKick);

    const registeredPlayerIds = await prisma.profile
      .findMany({
        where: { users: { some: { userId: { in: [...uniquePlayers] } } } },
        select: { users: { select: { userId: true } } },
      })
      .then(p => p.map(u => u.users.map(u => u.userId)).flat());

    if (registeredPlayerIds.length < playerCount - 1) {
      return new Message(
        {
          title: 'VoteKick Prompt',
          description:
            'VoteKick can only be initiated when all players except the player to kick is registered via `/addid`!',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    return new Message({
      title: 'VoteKick Prompt',
      description: 'Test Success!',
    }).toResponse();
  },
};
