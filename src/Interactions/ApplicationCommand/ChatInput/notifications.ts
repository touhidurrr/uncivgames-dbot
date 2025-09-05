import Message from '@modules/message.js';
import { getPrisma } from '@modules/prisma.js';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';

export default {
  name: 'notifications',
  description: 'Enable or Disable Notifications',
  usage: '/notifications',
  example: '/notifications',
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    const userId = !interaction.user
      ? interaction.member.user.id
      : interaction.user.id;

    const prisma = await getPrisma();
    let profile = await prisma.profile.findFirst({
      where: { discordId: +userId },
      select: { notifications: true },
    });

    if (profile === null) {
      profile = await prisma.profile.create({
        data: { discordId: +userId },
        select: { notifications: true },
      });
    }

    const { notifications } = profile;
    const timestamp = Date.now();

    return new Message({
      title: 'Notifications Prompt',
      description: `Your Notifications are currently **${
        notifications.at(0).toUpperCase() + notifications.slice(1)
      }**.\nUse the buttons below to change this setting.`,
      footer: 'You have arround 300 seconds or more to react to this Message.',
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 3,
              label: 'Enable',
              custom_id: `notifications-${userId}-enabled-${timestamp}`,
              disabled: notifications === 'enabled',
            },
            {
              type: 2,
              style: 4,
              label: 'Disable',
              custom_id: `notifications-${userId}-disabled-${timestamp}`,
              disabled: notifications === 'disabled',
            },
          ],
        },
      ],
    }).toResponse();
  },
};
