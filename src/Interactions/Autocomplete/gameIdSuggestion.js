import MongoDB from '../../modules/mongodb.js';

export default {
  priority: 0,
  logic: i => i.data.options.some(o => o.focused && o.name === 'game-id'),
  async respond(interaction) {
    const userId = interaction.user ? interaction.user.id : interaction.member.user.id;
    const profile = await MongoDB.findOne('PlayerProfiles', userId, { _id: 0, uncivUserIds: 1 });

    if (!profile) {
      return new Response('{"type":8,"data":{"choices":[]}}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // just send recent games for for now
    const gamesFound =
      (await MongoDB.find('UncivServer', {
        filter: { players: { $in: profile.uncivUserIds } },
        projection: { _id: 1, name: 1 },
        sort: { updatedAt: -1 },
        limit: 25,
      })) || [];

    return new Response(
      JSON.stringify({
        type: 8,
        data: {
          choices: gamesFound.map(g => {
            const value = g._id.endsWith('_Preview') ? g._id.slice(0, -8) : g._id;
            const name = (g.name || value).slice(0, 100);
            return { name, value };
          }),
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  },
};
