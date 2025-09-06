import Message from '@modules/message.js';
import { getPrisma } from '@modules/prisma.js';
import { NUMBER_EMOJIS } from '@src/constants.js';
import { JsonResponse } from '@models';
import {
  APIActionRowComponent,
  APIMessageComponentSelectMenuInteraction,
  APIStringSelectComponent,
} from 'discord-api-types/v10';

export default {
  name: 'votepoll',
  async respond(interaction: APIMessageComponentSelectMenuInteraction) {
    const userId = interaction.user
      ? interaction.user.id
      : interaction.member.user.id;

    const prisma = await getPrisma();
    const votes = await prisma.discordPollVote.findMany({
      where: {
        discordId: BigInt(userId),
        entryId: { in: interaction.data.values.map(parseInt) },
      },
      select: { id: true, entryId: true },
    });

    const entries = await Promise.all(
      votes.map(({ id, entryId }) => {
        const exists = interaction.data.values.includes(entryId.toString());

        if (exists) {
          return prisma.discordPollEntry.update({
            where: { id: entryId },
            data: {
              count: { decrement: 1 },
              votes: { delete: { id } },
            },
            select: { id: true, count: true, label: true },
          });
        }

        return prisma.discordPollEntry.update({
          where: { id: entryId },
          data: {
            count: { increment: 1 },
            votes: { create: { discordId: BigInt(userId) } },
          },
          select: { id: true, count: true, label: true },
        });
      })
    ).then(entries => entries.sort((a, b) => b.count - a.count));

    // add title to embed description
    let description =
      interaction.message.embeds[0].description.match(/[^\n]+/)[0];

    // add entries to embed description
    entries.forEach(({ label, count }, idx) => {
      description += `\n**${idx + 1}.** ${label}${count ? ` (${count} votes)` : ''}`;
    });

    // update embed description
    interaction.message.embeds[0].description = description;

    const actionRow = interaction.message
      .components[0] as APIActionRowComponent<APIStringSelectComponent>;

    // update select menu options
    actionRow.components[0].options = entries.map(({ label, id }, idx) => ({
      label,
      value: id.toString(),
      emoji: { name: NUMBER_EMOJIS[idx + 1] },
    }));

    return new JsonResponse({
      type: Message.Types.UPDATE_MESSAGE,
      data: interaction.message,
    });
  },
};
