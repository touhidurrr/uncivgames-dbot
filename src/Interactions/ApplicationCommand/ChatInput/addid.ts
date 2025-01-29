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
    //@ts-ignore
    const uncivUserId: string = interaction.data.options[0].value.trim();
    const userId = !interaction.user ? interaction.member.user.id : interaction.user.id;

    if (!uncivUserId || !UUID_REGEX.test(uncivUserId)) {
      return new Message(
        {
          title: 'AddID Prompt',
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

    // if nobody owns this id yet
    if (!queryResponse) {
      // we try to fetch the profile of the user
      let playerProfile = await prisma.profile.findFirst({
        where: { discordId: parseInt(userId) },
        select: { id: true, users: { select: { userId: true } } },
      });

      if (!playerProfile) {
        // if the user doesn't have a profile, we create one
        // also adding the uncivUserId to the profile
        playerProfile = await prisma.profile.create({
          data: {
            discordId: parseInt(userId),
            users: {
              connectOrCreate: {
                where: { userId: uncivUserId },
                create: { userId: uncivUserId },
              },
            },
          },
          select: { id: true, users: { select: { userId: true } } },
        });
      } else if (playerProfile.users.length >= 10) {
        // profile already exists, but has 10 or more userId's
        return new Message({
          title: 'AddID Prompt',
          description:
            `You already have ${playerProfile.users.length} userId's in your Profile !` +
            '\nRemove some to add another one.',
        }).toResponse();
      } else {
        // profile already exists, but has less than 10 userId's
        await prisma.profile.update({
          where: { id: playerProfile.id },
          data: {
            updatedAt: Date.now(),
            users: {
              connectOrCreate: {
                where: { userId: uncivUserId },
                create: { userId: uncivUserId },
              },
            },
          },
        });
      }

      // return success message
      // one of above blocks already added the id
      return new Message({
        title: 'AddID Prompt',
        description: 'user ID added to your profile !',
      }).toResponse();
    } else if (queryResponse.discordId.toString() === userId) {
      // profile already contains the id
      return new Message({
        title: 'AddID Prompt',
        description: 'Already in your Profile !',
      }).toResponse();
    }

    // if the id is already owned by someone else
    // we fetch the username and discriminator of the owner
    // and return a message with the owner's name
    const { username, discriminator } = await Discord<any, RESTGetAPIUserResult>(
      'GET',
      Routes.user(queryResponse.discordId.toString())
    );
    const uniqueName = discriminator !== '0' ? `${username}#${discriminator}` : `@${username}`;

    return new Message({
      title: 'AddID Prompt',
      description: `This ID is Already owned by **${uniqueName}** !`,
    }).toResponse();
  },
};
