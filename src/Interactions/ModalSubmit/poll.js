const Message = require('../../modules/message.js');
const MongoDB = require('../../modules/mongodbApi.js');

const numberEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {
  name: 'poll',
  async respond(interaction) {
    const title = interaction.data.components[0].components[0].value.replace(/[\s\n]+/g, ' ');
    const entries = [
      ...new Set(interaction.data.components[1].components[0].value.trim().split(/\s*\n+\s*/)),
    ];

    if (entries.length < 2) {
      return new Message(
        {
          title: 'Poll Prompt',
          description: 'Polls should have at least 2 entries !',
          footer: 'Tip: Identical entries are removed by default',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    if (entries.length > 10) {
      return new Message(
        {
          title: 'Poll Prompt',
          description: 'Polls cannot have more than 10 entries !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    if (entries.some(e => e.length > 100)) {
      return new Message(
        {
          title: 'Poll Prompt',
          description: 'Polls entries cannot exceed 100 characters !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    var c = 0;
    await MongoDB.insertOne('Polls', {
      _id: interaction.id,
      entries: entries.map(e => {
        return { value: String(c++), label: e, voters: [] };
      }),
    });

    c = 0;
    let options = [];
    let description = `**${title}**`;
    for (const e of entries) {
      options.push({
        value: String(c++),
        label: e,
        emoji: {
          name: numberEmojis[c],
        },
      });
      description += `\n**${c}.** ${e}`;
    }

    return new Message({
      title: 'Democracy Bot Polls',
      description,
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              options,
              custom_id: `votepoll-${interaction.id}`,
              placeholder: 'Select your votes for the Poll !',
              min_values: 1,
              max_values: entries.length,
            },
          ],
        },
      ],
    }).toResponse();
  },
};
