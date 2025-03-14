import Message from '@modules/message.js';
import { scramble } from '@modules/randomOrg.js';
import {
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
} from 'discord-api-types/v10';

export default {
  name: 'scramble',
  description: 'Ask the Bot to Scramble some Variables',
  usage: '/scramble <variable 1> | <variable 2> | <variable 3> ...',
  example: '/scramble variables: Something Sweet, Something Spicy',
  options: [
    {
      name: 'variables',
      description: 'A List of Variables separated by Comma',
      type: 3,
      required: true,
    },
  ] satisfies APIApplicationCommandOption[],
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    // @ts-ignore
    const variables: string[] = interaction.data.options[0].value
      .trim()
      .split(/\s*,\s*/);

    if (variables.length < 2)
      return new Message({
        title: 'Scramble Prompt',
        description: 'Give me at least 2 Variables to Scramble !',
      }).toResponse();

    return new Message({
      title: 'Scramble Prompt',
      description:
        `**Variables:** ${variables.join(', ')}` +
        `\n**Result:** **${(await scramble(variables)).join(', ')}**`,
      footer: 'using random numbers generated from random.org',
    }).toResponse();
  },
};
