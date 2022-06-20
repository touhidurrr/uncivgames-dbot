const Message = require('../../../modules/message');
const scramble = async arr => {
  if (arr.length === 1) return arr;
  const randomIndexes = await fetch('https://api.random.org/json-rpc/4/invoke', {
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
        n: arr.length,
        min: 0,
        max: arr.length - 1,
        replacement: false,
        base: 10,
        pregeneratedRandomization: null,
      },
      id: Date.now(),
    }),
  })
    .then(res => res.json())
    .then(json => json.result.random.data);
  let scrambledArr = [];
  for (let i = 0, l = arr.length; i < l; ++i) {
    scrambledArr[i] = arr[randomIndexes[i]];
  }
  return scrambledArr;
};

module.exports = {
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
  ],
  async respond(interaction) {
    const variables = interaction.data.options[0].value.trim().split(/\s*,\s*/);

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
