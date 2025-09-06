import Message from '@modules/message.js';
import { getPrisma } from '@modules/prisma.js';
import {
  APIApplicationCommandInteractionDataIntegerOption,
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
  InteractionType,
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
    const position: number =
      interaction.data.options && interaction.data.options.length > 0
        ? (
            interaction.data
              .options[0] as APIApplicationCommandInteractionDataIntegerOption<InteractionType.ApplicationCommand>
          ).value
        : 1;
    const userId = interaction.user
      ? interaction.user.id
      : interaction.member.user.id;

    const prisma = await getPrisma();
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
