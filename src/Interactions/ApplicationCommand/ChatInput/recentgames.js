import Message from '../../../modules/message.js';
import MongoDB from '../../../modules/mongodb.js';

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
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const gamesFound = await MongoDB.find('UncivServer', {
      filter: { players: { $in: profile.uncivUserIds } },
      projection: { currentPlayer: 1, name: 1, updatedAt: 1, turns: 1 },
      sort: { updatedAt: -1 },
      limit: 5,
    });

    if (!gamesFound.length) {
      return new Message(
        {
          title: 'RecentGames Prompt',
          description: 'Could not find any Game for you which was active Recently !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const msg = new Message().addFlag(Message.Flags.Ephemeral);

    gamesFound.forEach(game =>
      msg.addEmbed({
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
            value: `<t:${Math.floor(game.updatedAt / 1000)}:R>`,
          },
        ],
      })
    );

    return msg.toResponse();
  },
};
