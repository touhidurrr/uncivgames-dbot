const { stringify } = require('yaml');
import prisma from '@src/modules/prisma.js';
import {
  APIChatInputApplicationCommandInteraction,
  InteractionContextType,
} from 'discord-api-types/v10';
import Message from '@modules/message.js';

export default {
  name: 'profile',
  description: 'Shows a Players Profile',
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    const user = interaction.user || interaction.member.user;

    let profile = await prisma.profile.findFirst({
      where: { discordId: +user.id },
      select: {
        rating: true,
        updatedAt: true,
        notifications: true,
        users: { select: { userId: true } },
      },
    });

    if (profile === null) {
      profile = await prisma.profile.create({
        data: { discordId: +user.id },
        select: {
          rating: true,
          updatedAt: true,
          notifications: true,
          users: { select: { userId: true } },
        },
      });
    }

    const shownProfile = {
      rating: profile.rating,
      notifications: profile.notifications,
      uncivUserIds: profile.users.map(({ userId }) => userId),
    };

    if (interaction.context !== InteractionContextType.BotDM)
      shownProfile.uncivUserIds = [
        `Count: ${shownProfile.uncivUserIds.length}. You can only see your ids when dm the bot this command!`,
      ];

    return new Message({
      title: 'Profile Prompt',
      description: `\`\`\`yml\n# ${user.username}'s Profile\n${stringify(profile)}\n\`\`\``,
      footer: `Last Updated: <t:${profile.updatedAt / 1000n}:R>$`,
    }).toResponse();
  },
};
