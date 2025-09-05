import Message from '@modules/message.js';
import { getPrisma } from '@modules/prisma.js';
import { NUMBER_EMOJIS } from '@src/constants.js';
import { APISelectMenuOption } from 'discord-api-types/v10';

export default {
  name: 'poll',
  async respond(interaction) {
    const title = interaction.data.components[0].components[0].value.replace(
      /[\s\n]+/g,
      ' '
    );
    const entries = [
      ...new Set(
        (interaction.data.components[1].components[0].value as string)
          .trim()
          .split(/\s*\n+\s*/)
      ),
    ];

    if (entries.length < 2) {
      return new Message(
        {
          title: 'Poll Prompt',
          description: 'Polls should have at least 2 entries !',
          footer: 'Tip: Identical entries are removed by default',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    if (entries.length > 10) {
      return new Message(
        {
          title: 'Poll Prompt',
          description: 'Polls cannot have more than 10 entries !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    if (entries.some(e => e.length > 100)) {
      return new Message(
        {
          title: 'Poll Prompt',
          description: 'Polls entries cannot exceed 100 characters !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const prisma = await getPrisma();
    const userId = interaction.user.id || interaction.member.user.id;
    const poll = await prisma.discordPoll.create({
      data: {
        id: interaction.id,
        authorId: userId,
        entries: {
          createMany: {
            data: entries.map((label, order) => ({ label, order })),
          },
        },
      },
      select: {
        entries: { select: { id: true, label: true } },
      },
    });

    let options: APISelectMenuOption[] = [];
    let description = `**${title}**`;
    poll.entries.forEach(({ label, id }, order) => {
      options.push({
        label,
        value: id.toString(),
        emoji: {
          name: NUMBER_EMOJIS[order + 1],
        },
      });
      description += `\n**${order + 1}.** ${label}`;
    });

    return new Message({
      title: 'Democracy Bot Polls',
      description,
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              options,
              custom_id: `votepoll`,
              placeholder: 'Select your votes for the Poll !',
              min_values: 1,
              max_values: entries.length,
            },
          ],
        },
      ],
    }).toResponse();
  },
};
