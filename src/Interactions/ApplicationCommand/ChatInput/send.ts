import Discord from '@modules/discord.js';
import Message from '@modules/message.js';
import { AUTHOR_ID } from '@src/constants.js';
import {
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
  RESTPostAPIChannelMessageJSONBody,
  Routes,
} from 'discord-api-types/v10';

export default {
  name: 'send',
  description: 'Sends a Message from Democracy Bot',
  options: [
    {
      name: 'content',
      description: 'Message Content',
      type: 3,
      required: false,
    },
    {
      name: 'title',
      description: 'Embed Title',
      type: 3,
      required: false,
    },
    {
      name: 'description',
      description: 'Embed Description',
      type: 3,
      required: false,
    },
  ] satisfies APIApplicationCommandOption[],
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    const userId = interaction.user?.id ?? interaction.member?.user?.id;

    if (userId !== AUTHOR_ID) {
      return new Message(
        {
          title: 'Send Prompt',
          description: 'Command reserved for Bot Author !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    if (!interaction.data.options) {
      return new Message(
        {
          title: 'Send Prompt',
          description: 'At least one option is Necessary !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    //@ts-ignore
    const title = interaction.data.options.find(o => o.name === 'title')?.value;

    //@ts-ignore
    const description = interaction.data.options.find(o => o.name === 'description')?.value;

    if (title && !description) {
      return new Message(
        {
          title: 'Send Prompt',
          description:
            'Description is required if Title is provided.' +
            '\nHowever Title is not required if Description is provided !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    //@ts-ignore
    const content = interaction.data.options.find(o => o.name === 'content')?.value;

    await Discord('POST', Routes.channelMessages(interaction.channel.id), {
      content,
      embeds: !description
        ? undefined
        : [
            {
              description,
              title: !title ? undefined : title,
            },
          ],
    } satisfies RESTPostAPIChannelMessageJSONBody);

    return new Message(
      {
        title: 'Send Prompt',
        description: 'Message Sent !',
      },
      Message.Flags.EPHEMERAL
    ).toResponse();
  },
};
