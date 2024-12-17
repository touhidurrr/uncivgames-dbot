import Discord from '../../../modules/discord.js';
import Message from '../../../modules/message.js';

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
  ],
  async respond(interaction) {
    if (!interaction.data.options) {
      return new Message(
        {
          title: 'Send Prompt',
          description: 'At least one option is Necessary !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const title = interaction.data.options.find(o => o.name === 'title').value;
    const description = interaction.data.options.find(o => o.name === 'description').value;

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

    const content = interaction.data.options.find(o => o.name === 'content').value;

    await Discord('POST', `/channels/${interaction.channel_id}/messages`, {
      content: !content ? undefined : content,
      embeds: !description
        ? undefined
        : [
            {
              description,
              title: !title ? undefined : title,
            },
          ],
    });

    return new Message(
      {
        title: 'Send Prompt',
        description: 'Message Sent !',
      },
      Message.Flags.EPHEMERAL
    ).toResponse();
  },
};
