import { getResponseInfoEmbed } from '@lib';
import { api } from '@modules/api';
import Discord from '@modules/discord';
import Message from '@modules/message';
import { UUID_REGEX } from '@src/constants';
import {
  APIApplicationCommandInteractionDataStringOption,
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
  RESTGetAPIUserResult,
  Routes,
} from 'discord-api-types/v10';

export default {
  name: 'removeid',
  description: 'Removes an Unciv user ID from your profile.',
  usage: '/removeid unciv-user-id: <Unciv user ID>',
  example: '/removeid unciv-user-id: 12345678-abcd-bcde-cdef-abc123456def',
  options: [
    {
      name: 'unciv-user-id',
      description: 'your Unciv user ID',
      type: 3,
      required: true,
    },
  ] satisfies APIApplicationCommandOption[],
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    const userId = !interaction.user
      ? interaction.member.user.id
      : interaction.user.id;

    const uncivUserId: string = (
      interaction.data
        .options[0] as APIApplicationCommandInteractionDataStringOption
    ).value.trim();

    if (!uncivUserId || !UUID_REGEX.test(uncivUserId)) {
      return new Message(
        {
          title: 'RemoveID Prompt',
          description: 'Invalid user ID !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    // query response gets the discordId of the profile containing the uncivUserId
    const res = await api.getUserProfileId(uncivUserId);

    if (res.status === 404) {
      return new Message({
        title: 'RemoveID Prompt',
        description: 'Nobody owns this user ID !',
      }).toResponse();
    }

    if (!res.ok) return getResponseInfoEmbed(res);
    const discordId = await res.text();

    if (discordId === userId) {
      const res = await api.removeUserIdToProfile(userId, uncivUserId);
      if (!res.ok) return getResponseInfoEmbed(res);

      return new Message({
        title: 'RemoveID Prompt',
        description: 'I have tried to remove this user ID from your Profile !',
      }).toResponse();
    }

    const { username, discriminator } = await Discord<
      any,
      RESTGetAPIUserResult
    >('GET', Routes.user(discordId));

    const uniqueName =
      discriminator !== '0' ? `${username}#${discriminator}` : `@${username}`;

    return new Message({
      title: 'RemoveID Prompt',
      description: `This ID is owned by **${uniqueName}**, not You !`,
    }).toResponse();
  },
};
