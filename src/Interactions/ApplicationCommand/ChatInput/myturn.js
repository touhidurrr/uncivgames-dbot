import Message from '../../../modules/message.js';
import MongoDB from '../../../modules/mongodb.js';

export default {
  name: 'myturn',
  description: 'Check the Games where it is your Turn !',
  async respond(interaction) {
    const userId = !interaction.user ? interaction.member.user.id : interaction.user.id;

    const profile = await MongoDB.findOne('PlayerProfiles', userId, { _id: 0, uncivUserIds: 1 });

    if (!profile || !profile.uncivUserIds.length) {
      return new Message(
        {
          title: 'MyTurn Prompt',
          description:
            "**Opps!** You don't have any Unciv user Ids listed !" +
            '\nUse `/addid` so that the bot can ***Recongnise*** you ...',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const gamesFound = await MongoDB.find('UncivServer', {
      filter: { playerId: { $in: profile.uncivUserIds } },
      projection: { currentPlayer: 1, name: 1, updatedAt: 1, turns: 1 },
      sort: { updatedAt: -1 },
      limit: 5,
    });

    if (!gamesFound.length) {
      return new Message(
        {
          title: 'MyTurn Prompt',
          description: 'I could not find any Game where it is your Turn !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    let Screen = new Message();
    Screen.addFlag(Message.Flags.Ephemeral);

    gamesFound.forEach(game =>
      Screen.addEmbed({
        fields: [
          {
            name: 'Game ID',
            value: `\`\`\`${game._id.slice(0, -8)}\`\`\``,
          },
          !game.name
            ? undefined
            : {
                name: 'Name',
                value: `\`\`\`${game.name}\`\`\``,
              },
          {
            name: 'Your Civ',
            value: `\`\`\`${game.currentPlayer}\`\`\``,
            inline: true,
          },
          !game.turns
            ? undefined
            : {
                name: 'Turns',
                value: `\`\`\`${game.turns}\`\`\``,
                inline: true,
              },
          {
            name: 'Last Activitity',
            value: `<t:${Math.floor(game.updatedAt / 1000)}:R>`,
          },
        ],
      })
    );

    return Screen.toResponse();
  },
};
