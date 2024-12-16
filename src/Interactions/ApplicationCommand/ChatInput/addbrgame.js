import Message from '../../../modules/message';

const gameIdRegex = /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/;

export default {
  name: 'addbrgame',
  description: 'Add a Battle Royale Game for Testing',
  options: [
    {
      name: 'game-id',
      description: 'UncivServer.xyz game ID!',
      type: 3,
      required: true,
      autocomplete: true,
    },
  ],
  async respond(interaction) {
    const gameId = interaction.data.options[0].value.trim();

    if (!gameId || !gameIdRegex.test(gameId)) {
      return new Message(
        {
          title: 'AddBRGame Prompt',
          description: 'Invalid game ID !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const res = await fetch(`https://uncivserver.xyz/addbrgame/${gameId}`, {
      method: 'POST',
      body: env.BR_AUTH,
    });

    return new Message({
      title: 'AddBRGame Prompt',
      description: `\`\`\`js\n${res.status} ${await res.text()}\n\`\`\``,
    }).toResponse();
  },
};
