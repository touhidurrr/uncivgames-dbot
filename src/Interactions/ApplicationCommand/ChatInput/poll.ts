import { JsonResponse } from '@models';
import {
  APIChatInputApplicationCommandInteraction,
  APIModalInteractionResponse,
  ComponentType,
  InteractionResponseType,
  TextInputStyle,
} from 'discord-api-types/v10';

export default {
  name: 'poll',
  description: 'Open a Cool Poll',
  async respond(_: APIChatInputApplicationCommandInteraction) {
    return new JsonResponse({
      type: InteractionResponseType.Modal,
      data: {
        title: 'Democracy Bot Poll Maker',
        custom_id: 'poll',
        components: [
          {
            type: ComponentType.Label,
            label: 'Title',
            component: {
              type: ComponentType.TextInput,
              style: TextInputStyle.Short,
              placeholder: 'Poll Title',
              custom_id: 'title',
              min_length: 1,
              max_length: 100,
              required: true,
            },
          },
          {
            type: ComponentType.Label,
            label: 'Entries',
            description:
              'The voting options in the poll. Put each entry in a separate line',
            component: {
              type: ComponentType.TextInput,
              style: TextInputStyle.Paragraph,
              placeholder: 'My Cool Entry 1\nMy another cool entry 2 !',
              custom_id: 'entries',
              min_length: 3,
              max_length: 1100,
              required: true,
            },
          },
        ],
      },
    } satisfies APIModalInteractionResponse);
  },
};
