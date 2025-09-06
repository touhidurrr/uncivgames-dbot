const { stringify } = require('yaml');
import { api, APIProfile } from '@modules/api.js';
import Message from '@modules/message.js';
import { getResponseInfoEmbed } from '@models';
import {
  APIChatInputApplicationCommandInteraction,
  InteractionContextType,
} from 'discord-api-types/v10';

export default {
  name: 'profile',
  description: 'Shows a Players Profile',
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    const user = interaction.user || interaction.member.user;

    const res = await api.getProfile(user.id);
    if (!res.ok) return getResponseInfoEmbed(res);

    const profile = (await res.json()) as APIProfile;

    delete profile['dmChannel'];

    if (interaction.context !== InteractionContextType.BotDM)
      profile.uncivUserIds = [
        `Count: ${profile.uncivUserIds.length}. You can only see your ids when dm the bot this command!`,
      ];

    return new Message({
      title: 'Profile Prompt',
      description: `\`\`\`yml\n# ${user.username}'s Profile\n${stringify(profile)}\n\`\`\``,
      footer: `Last Updated: <t:${Math.floor(new Date(profile.updatedAt).getTime() / 1000)}:R>`,
    }).toResponse();
  },
};
