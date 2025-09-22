import { enCode, getResponseInfoEmbed } from '@lib';
import { api, APIProfile } from '@modules/api';
import Message from '@modules/message';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  APIChatInputApplicationCommandInteraction,
  InteractionContextType,
} from 'discord-api-types/v10';

dayjs.extend(relativeTime);

export default {
  name: 'profile',
  description: 'Shows a Players Profile',
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    const user = interaction.user || interaction.member.user;

    const res = await api.getProfile(user.id);
    if (!res.ok) return getResponseInfoEmbed(res);

    const profile = (await res.json()) as APIProfile;

    delete profile._id;
    delete profile.dmChannel;
    delete profile.rating.mu;
    delete profile.rating.sigma;

    profile.createdAt = new Date(profile.createdAt).toUTCString();
    profile.updatedAt = new Date(profile.updatedAt).toUTCString();

    if (interaction.context !== InteractionContextType.BotDM)
      profile.uncivUserIds = [
        `Count: ${profile.uncivUserIds.length}. You can only see your ids when dm the bot this command!`,
      ];

    return new Message({
      title: 'Profile Prompt',
      description: `# ${user.username}'s Profile\n${enCode(
        JSON.stringify(profile, null, 2)
      )}`,
      footer: `Last updated ${dayjs(profile.updatedAt).fromNow()}`,
    }).toResponse();
  },
};
