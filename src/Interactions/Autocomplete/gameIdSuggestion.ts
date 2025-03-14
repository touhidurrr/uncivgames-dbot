import prisma from '@modules/prisma.js';
import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  InteractionResponseType,
} from 'discord-api-types/v10';

export default {
  priority: 0,
  logic: (i: APIApplicationCommandAutocompleteInteraction) =>
    //@ts-ignore
    i.data.options.some(o => o.focused && o.name === 'game-id'),
  async respond(interaction: APIApplicationCommandAutocompleteInteraction) {
    const userId = interaction.user
      ? interaction.user.id
      : interaction.member.user.id;

    const profile = await prisma.profile.findFirst({
      where: { discordId: parseInt(userId) },
      select: { users: { select: { userId: true } } },
    });

    if (!profile) {
      return new Response('{"type":8,"data":{"choices":[]}}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const gamesFound = await prisma.usersInGame
      .findMany({
        where: { userId: { in: profile.users.map(u => u.userId) } },
        select: { game: { select: { id: true, name: true } } },
        orderBy: { game: { updatedAt: 'desc' } },
        take: 25,
      })
      .then(uig => uig.map(g => g.game));

    return new Response(
      JSON.stringify({
        type: InteractionResponseType.ApplicationCommandAutocompleteResult,
        data: {
          choices: gamesFound.map(({ id, name }) => ({ name, value: id })),
        },
      } satisfies APIApplicationCommandAutocompleteResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  },
};
