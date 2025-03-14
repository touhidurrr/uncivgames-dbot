import Discord from '@modules/discord.js';
import Message from '@modules/message.js';
import prisma from '@modules/prisma.js';
import { UUID_REGEX } from '@src/constants.js';
import {
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
    //@ts-ignore
    const uncivUserId = interaction.data.options[0].value.trim();
    const userId = !interaction.user
      ? interaction.member.user.id
      : interaction.user.id;

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
    const queryResponse = await prisma.profile.findFirst({
      where: { users: { some: { userId: uncivUserId } } },
      select: { discordId: true },
    });

    if (queryResponse === null) {
      // we try to fetch the profile of the user
      let playerProfile = await prisma.profile.findFirst({
        where: { discordId: parseInt(userId) },
        select: { id: true, users: { select: { userId: true } } },
      });

      if (playerProfile === null) {
        playerProfile = await prisma.profile.create({
          data: { discordId: parseInt(userId) },
          select: { id: true, users: { select: { userId: true } } },
        });
      }

      return new Message({
        title: 'RemoveID Prompt',
        description: 'Nobody owns this user ID !',
      }).toResponse();
    } else if (queryResponse.discordId.toString() === userId) {
      await prisma.usersInProfile.delete({ where: { userId: uncivUserId } });

      return new Message({
        title: 'RemoveID Prompt',
        description: 'I have tried to remove this user ID from your Profile !',
      }).toResponse();
    }

    const { username, discriminator } = await Discord<
      any,
      RESTGetAPIUserResult
    >('GET', Routes.user(queryResponse.discordId.toString()));
    const uniqueName =
      discriminator !== '0' ? `${username}#${discriminator}` : `@${username}`;

    return new Message({
      title: 'RemoveID Prompt',
      description: `This ID is owned by **${uniqueName}**, not You !`,
    }).toResponse();
  },
};
