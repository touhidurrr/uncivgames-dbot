const Message = require('../../modules/message.js');
const Discord = require('../../modules/discordApi.js');
const Permissions = require('../../modules/permissionsManager.js');

module.exports = {
  name: 'join',
  async respond(interaction, gameNo, channelId, timestamp) {
    const userId = interaction.member.user.id;
    const { permission_overwrites } = await Discord('GET', `/channels/${channelId}`);

    const hasJoined = permission_overwrites.some(
      p => p.id === userId && BigInt(p.allow) & Permissions.VIEW_CHANNEL
    );

    if (hasJoined) {
      return new Message(
        {
          title: `Game ${gameNo} Join Prompt`,
          description: `You have already joined **Game ${gameNo}** !`,
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    await Promise.all([
      Discord('PUT', `/channels/${channelId}/permissions/${userId}`, {
        type: 1,
        allow: String(Permissions.VIEW_CHANNEL),
      }),
      Discord('POST', `/channels/${channelId}/messages`, {
        content: `<@${userId}> joined the chat`,
      }),
    ]);

    return new Message(
      {
        title: `Game ${gameNo} Join Prompt`,
        description: `You have joined **Game ${gameNo}** !`,
      },
      Message.Flags.EPHEMERAL
    ).toResponse();
  },
};
