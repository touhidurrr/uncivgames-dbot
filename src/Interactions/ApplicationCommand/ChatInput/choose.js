const Message = require('../../../modules/message');

const choose = async arr => {
  if (arr.length === 1) return arr[0];
  return arr[
    await fetch('https://api.random.org/json-rpc/4/invoke', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'generateIntegers',
        params: {
          apiKey: RANDOM_ORG_TOKEN,
          n: 1,
          min: 0,
          max: arr.length - 1,
          replacement: true,
          base: 10,
          pregeneratedRandomization: null,
        },
        id: Date.now(),
      }),
    })
      .then(res => res.json())
      .then(json => json.result.random.data[0])
  ];
};

module.exports = {
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
  ],
  async respond(interaction) {
    let variables = interaction.data.options[0].value.trim().split(/\s*,\s*/);

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
