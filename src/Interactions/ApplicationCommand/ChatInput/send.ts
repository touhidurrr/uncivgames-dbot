import Discord from '@modules/discord';
import Message from '@modules/message';
import { AUTHOR_ID } from '@src/constants';
import {
  APIApplicationCommandInteractionDataStringOption,
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
        Message.Flags.Ephemeral
      ).toResponse();
    }

    if (!interaction.data.options) {
      return new Message(
        {
          title: 'Send Prompt',
          description: 'At least one option is Necessary !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const options = interaction.data
      .options as APIApplicationCommandInteractionDataStringOption[];

    const title = options.find(o => o.name === 'title')?.value;
    const description = options.find(o => o.name === 'description')?.value;

    if (title && !description) {
      return new Message(
        {
          title: 'Send Prompt',
          description:
            'Description is required if Title is provided.' +
            '\nHowever Title is not required if Description is provided !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const content = options.find(o => o.name === 'content')?.value;

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
      Message.Flags.Ephemeral
    ).toResponse();
  },
};
