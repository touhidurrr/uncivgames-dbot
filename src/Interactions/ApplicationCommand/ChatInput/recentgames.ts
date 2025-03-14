import Message from '@modules/message.js';
import prisma from '@modules/prisma.js';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';

export default {
  name: 'recentgames',
  description: 'Check your Recently Active Games !',
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    const userId = !interaction.user
      ? interaction.member.user.id
      : interaction.user.id;

    const profile = await prisma.profile.findFirst({
      where: { discordId: +userId },
      select: { users: { select: { userId: true } } },
    });

    if (!profile || !profile.users.length) {
      return new Message(
        {
          title: 'RecentGames Prompt',
          description:
            "**Opps!** You don't have any Unciv user Ids listed !" +
            '\nUse `/addid` so that the bot can ***Recongnise*** you ...',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const gamesFound = await prisma.usersInGame
      .findMany({
        where: { userId: { in: profile.users.map(u => u.userId) } },
        select: {
          game: {
            select: {
              id: true,
              name: true,
              turns: true,
              currentPlayer: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { game: { updatedAt: 'desc' } },
        take: 5,
      })
      .then(uig => uig.map(g => g.game));

    if (!gamesFound.length) {
      return new Message(
        {
          title: 'RecentGames Prompt',
          description:
            'Could not find any Game for you which was active Recently !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const msg = new Message().addFlag(Message.Flags.Ephemeral);

    gamesFound.forEach(game =>
      msg.addEmbed({
        fields: [
          {
            name: 'Game ID',
            value: `\`\`\`${game.id}\`\`\``,
          },
          !game.name
            ? undefined
            : {
                name: 'Name',
                value: `\`\`\`${game.name}\`\`\``,
              },
          {
            name: 'Current Civ',
            value: `\`\`\`${game.currentPlayer}\`\`\``,
            inline: true,
          },
          !game.turns
            ? undefined
            : {
                name: 'Turns',
                value: `\`\`\`${game.turns}\`\`\``,
                inline: true,
              },
          {
            name: 'Last Activitity',
            value: `<t:${game.updatedAt / 1000n}:R>`,
          },
        ],
      })
    );

    return msg.toResponse();
  },
};
