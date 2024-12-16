import Message from '../../../modules/message.js';
import MongoDB from '../../../modules/mongodbApi.js';

export default {
  name: 'recentgames',
  description: 'Check your Recently Active Games !',
  async respond(interaction) {
    const userId = !interaction.user ? interaction.member.user.id : interaction.user.id;

    const profile = await MongoDB.findOne('PlayerProfiles', userId, { _id: 0, uncivUserIds: 1 });

    if (!profile || !profile.uncivUserIds.length) {
      return new Message(
        {
          title: 'RecentGames Prompt',
          description:
            "**Opps!** You don't have any Unciv user Ids listed !" +
            '\nUse `/addid` so that the bot can ***Recongnise*** you ...',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const gamesFound = await MongoDB.find('UncivServer', {
      filter: { players: { $in: profile.uncivUserIds } },
      projection: { currentPlayer: 1, name: 1, timestamp: 1, turns: 1 },
      sort: { timestamp: -1 },
      limit: 5,
    });

    if (!gamesFound.length) {
      return new Message(
        {
          title: 'RecentGames Prompt',
          description: 'Could not find any Game for you which was active Recently !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    let Screen = new Message();
    Screen.addFlag(Message.Flags.EPHEMERAL);

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
            name: 'Current Civ',
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
            value: `<t:${~~(game.timestamp / 1000)}:R>`,
          },
        ],
      })
    );

    return Screen.toResponse();
  },
};
