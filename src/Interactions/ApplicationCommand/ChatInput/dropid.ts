import Message from '@modules/message.js';
import prisma from '@modules/prisma.js';
import {
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
} from 'discord-api-types/v10';

export default {
  name: 'dropid',
  description: 'Drops one of your Unciv user Ids',
  options: [
    {
      name: 'position',
      description: 'Position of your user Id (default 1)',
      type: 4,
      min_value: 1,
    },
  ] satisfies APIApplicationCommandOption[],
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    // @ts-ignore
    const position: number = interaction.data.options
      ? interaction.data.options[0].value
      : 1;
    const userId = interaction.user
      ? interaction.user.id
      : interaction.member.user.id;

    const profile = await prisma.profile.findFirst({
      where: { discordId: parseInt(userId) },
      select: { discordId: true, users: { select: { userId: true } } },
    });

    if (!profile || profile.users.length < 1) {
      return new Message('You have no user Ids available!').toResponse();
    }

    if (position > profile.users.length) {
      return new Message("Position doesn't exist !").toResponse();
    }

    return new Message(profile.users[position - 1]).toResponse();
  },
};
