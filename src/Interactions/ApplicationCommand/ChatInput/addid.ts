import { api, APIProfile } from '@modules/api.js';
import Discord from '@modules/discord.js';
import Message from '@modules/message.js';
import { AUTHOR_ID, UUID_REGEX } from '@src/constants.js';
import { getResponseInfoEmbed } from '@models';
import {
  APIApplicationCommandInteractionDataStringOption,
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
  RESTGetAPIUserResult,
  Routes,
} from 'discord-api-types/v10';

export default {
  name: 'addid',
  description: 'Adds an Unciv user ID to your Profile',
  usage: '/addid unciv-user-id: <Unciv user ID>',
  example: '/addid unciv-user-id: 12345678-abcd-bcde-cdef-abc123456def',
  options: [
    {
      name: 'unciv-user-id',
      description: 'Your Unciv user ID',
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
          title: 'AddID Prompt',
          description: 'Invalid user ID !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const res = await api.getUserProfileId(uncivUserId);

    if (res.status === 404) {
      // we try to fetch the profile of the user
      const res = await api.getProfile(userId);
      if (!res.ok) return getResponseInfoEmbed(res);

      const profile = (await res.json()) as APIProfile;

      if (profile._id !== AUTHOR_ID && profile.uncivUserIds.length >= 10) {
        // profile already exists, but has 10 or more userId's
        return new Message({
          title: 'AddID Prompt',
          description:
            `You already have ${profile.uncivUserIds.length} userId's in your Profile !` +
            '\nRemove some to add another one.',
        }).toResponse();
      }

      // profile already exists, but has less than 10 userId's
      const res2 = await api.addUserIdToProfile(profile._id, uncivUserId);
      if (!res2.ok) return getResponseInfoEmbed(res);

      return new Message({
        title: 'AddID Prompt',
        description: 'user ID added to your profile !',
      }).toResponse();
    }

    if (!res.ok) return getResponseInfoEmbed(res);

    const discordId = await res.text();
    if (discordId === userId) {
      // profile already contains the id
      return new Message({
        title: 'AddID Prompt',
        description: 'Already in your Profile !',
      }).toResponse();
    }

    // if the id is already owned by someone else
    // we fetch the username and discriminator of the owner
    // and return a message with the owner's name
    const { username, discriminator } = await Discord<
      any,
      RESTGetAPIUserResult
    >('GET', Routes.user(discordId));

    const uniqueName =
      discriminator !== '0' ? `${username}#${discriminator}` : `@${username}`;

    return new Message({
      title: 'AddID Prompt',
      description: `This ID is Already owned by **${uniqueName}** !`,
    }).toResponse();
  },
};
