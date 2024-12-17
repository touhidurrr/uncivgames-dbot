import Message from '../../modules/message.js';
import MongoDB from '../../modules/mongodb.js';

const numberEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export default {
  name: 'votepoll',
  async respond(interaction, pollId) {
    const userId = interaction.user ? interaction.user.id : interaction.member.user.id;

    let { entries } = await MongoDB.findOne('Polls', pollId, { _id: 0 });
    let actions = { $addToSet: {}, $pull: {} };

    interaction.data.values.forEach(v => {
      const i = entries[~~v].voters.indexOf(userId);
      if (i > -1) {
        actions.$pull[`entries.${v}.voters`] = userId;
        entries[~~v].voters.splice(i, 1);
      } else {
        actions.$addToSet[`entries.${v}.voters`] = userId;
        entries[~~v].voters.push(userId);
      }
    });

    await MongoDB.updateOne('Polls', pollId, actions);

    entries = entries.sort((a, b) => {
      if (b.voters.length === a.voters.length) {
        return a.value - b.value;
      }
      return b.voters.length - a.voters.length;
    });

    var c = 0;
    let description = interaction.message.embeds[0].description.match(/[^\n]+/)[0];
    entries.forEach(e => {
      description += `\n**${++c}.** ${e.label}${
        e.voters.length ? ` (${e.voters.length} votes)` : ''
      }`;
    });
    interaction.message.embeds[0].description = description;

    c = 0;
    interaction.message.components[0].components[0].options = entries.map(e => {
      delete e.voters;
      e.emoji = { name: numberEmojis[++c] };
      return e;
    });

    return new Response(
      JSON.stringify({
        type: Message.Types.UPDATE_MESSAGE,
        data: interaction.message,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
