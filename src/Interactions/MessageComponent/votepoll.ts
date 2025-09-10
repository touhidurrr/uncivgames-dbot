import { JsonResponse } from '@models';
import { getRandomColor } from '@modules/materialColors';
import Message from '@modules/message';
import { getPrisma } from '@modules/prisma';
import { NUMBER_EMOJIS } from '@src/constants';
import {
  APIActionRowComponent,
  APIMessageComponentSelectMenuInteraction,
  APIStringSelectComponent,
} from 'discord-api-types/v10';

export default {
  name: 'votepoll',
  async respond(
    interaction: APIMessageComponentSelectMenuInteraction,
    pollId?: string
  ) {
    if (!pollId) {
      return new Message(
        {
          title: 'VotePoll Error',
          description:
            'This poll is too old and has become deprecated. Cannot place votes on such polls.',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const userId = interaction.user
      ? interaction.user.id
      : interaction.member.user.id;

    const prisma = await getPrisma();
    const entries = await prisma.discordPollEntry.findMany({
      where: { pollId: BigInt(pollId) },
      select: {
        id: true,
        count: true,
        label: true,
        votes: { where: { discordId: BigInt(userId) } },
      },
    });

    if (entries.length < 1) {
      return new Message(
        {
          title: 'VotePoll Error',
          description: 'Cannot find this polls data. Kindly open a new poll.',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const selectedEntryIds = interaction.data.values.map(Number);

    const updatedEntries = await prisma.$transaction(tx => {
      const transactions = entries.map(entry => {
        // not selected and thus no update necessary
        if (!selectedEntryIds.includes(entry.id)) return entry;

        const vote = entry.votes[0];

        if (!vote) {
          return tx.discordPollEntry.update({
            where: { id: entry.id },
            data: {
              count: { increment: 1 },
              votes: { create: { discordId: BigInt(userId) } },
            },
            select: { id: true, count: true, label: true },
          });
        } else {
          return tx.discordPollEntry.update({
            where: { id: entry.id },
            data: {
              count: { decrement: 1 },
              votes: { delete: { id: vote.id } },
            },
            select: { id: true, count: true, label: true },
          });
        }
      });

      return Promise.all(transactions).then(results =>
        results.sort((a, b) => b.count - a.count)
      );
    });

    const {
      message,
      message: {
        embeds: [embed],
      },
    } = interaction;

    // update color
    embed.color = getRandomColor();

    // add title to embed description
    let description = embed.description.match(/[^\n]+/)[0];

    // add entries to embed description
    updatedEntries.forEach(({ label, count }, idx) => {
      description += `\n**${idx + 1}.** ${label}${count ? ` (${count} votes)` : ''}`;
    });

    // update embed description
    embed.description = description;

    const actionRow = message
      .components[0] as APIActionRowComponent<APIStringSelectComponent>;

    // update select menu options
    (
      actionRow as APIActionRowComponent<APIStringSelectComponent>
    ).components[0].options = updatedEntries.map(({ label, id }, idx) => ({
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
