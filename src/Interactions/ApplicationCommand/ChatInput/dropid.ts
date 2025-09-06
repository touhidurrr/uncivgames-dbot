import { api, APIProfile } from '@modules/api.js';
import Message from '@modules/message.js';
import { getResponseInfoEmbed } from '@src/models.js';
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
    const userId = interaction.user
      ? interaction.user.id
      : interaction.member.user.id;

    const position: number =
      interaction.data.options && interaction.data.options.length > 0
        ? (
            interaction.data
              .options[0] as APIApplicationCommandInteractionDataIntegerOption<InteractionType.ApplicationCommand>
          ).value
        : 1;

    const res = await api.getProfile(userId);
    if (!res.ok) return getResponseInfoEmbed(res);

    const { uncivUserIds } = (await res.json()) as APIProfile;

    if (uncivUserIds.length < 1) {
      return new Message('You have no user Ids available!').toResponse();
    }

    if (position > uncivUserIds.length) {
      return new Message("Position doesn't exist !").toResponse();
    }

    return new Message(uncivUserIds[position - 1]).toResponse();
  },
};
