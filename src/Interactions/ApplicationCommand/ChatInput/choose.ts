import Message from '@modules/message';
import { choose } from '@modules/randomOrg';
import {
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
} from 'discord-api-types/v10';

export default {
  name: 'choose',
  description: 'Ask the Bot to Choose from a number of Variables',
  usage: '/choose variables: <variable 1> | <variable 2> | <variable 3> ...',
  example: '/choose variables: Something Sweet, Something Spicy',
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
        title: 'Choose Prompt',
        description: 'Give me at least 2 variables to choose from !',
      }).toResponse();

    return new Message({
      title: 'Choose Prompt',
      description:
        `**Variables:** ${variables.join(', ')}` +
        `\nI choose **${(await choose(variables)).trim()}** !`,
      footer: 'using random numbers generated from random.org',
    }).toResponse();
  },
};
