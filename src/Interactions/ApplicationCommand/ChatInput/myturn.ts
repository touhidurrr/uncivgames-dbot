import Message from '@modules/message.js';
import { getPrisma } from '@modules/prisma.js';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';

export default {
  name: 'myturn',
  description: 'Check the Games where it is your Turn !',
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    const userId = !interaction.user
      ? interaction.member.user.id
      : interaction.user.id;

    const prisma = await getPrisma();
    const profile = await prisma.profile.findFirst({
      where: { discordId: +userId },
      select: { users: { select: { userId: true } } },
    });

    if (!profile || !profile.users.length) {
      return new Message(
        {
          title: 'MyTurn Prompt',
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
          title: 'MyTurn Prompt',
          description: 'I could not find any Game where it is your Turn !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const Screen = new Message().addFlag(Message.Flags.Ephemeral);

    gamesFound.forEach(game =>
      Screen.addEmbed({
        fields: [
          {
            name: 'Game ID',
            value: `\`\`\`${game.id.slice(0, -8)}\`\`\``,
          },
          !game.name
            ? undefined
            : {
                name: 'Name',
                value: `\`\`\`${game.name}\`\`\``,
              },
          {
            name: 'Your Civ',
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

    return Screen.toResponse();
  },
};
