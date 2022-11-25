const Message = require('../../../modules/message.js');
const Channels = require('../../../channels.json');
const Discord = require('../../../modules/discordApi.js');
const MongoDB = require('../../../modules/mongodbApi.js');
const Permissions = require('../../../modules/permissionsManager.js');

const homeGuildId = '866650187211210762';

module.exports = {
  name: 'newgame',
  description: 'Creates a new Game Channel',
  async respond(interaction) {
    if (!interaction.guild_id) {
      return new Message(
        {
          title: 'NewGame Prompt',
          description: `Not Available in DMs !`,
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    if (interaction.guild_id !== homeGuildId) {
      // Get Game Number
      const gameNo = (await MongoDB.findOne('Variables', 'Games Created', { _id: 0 })).value;

      // Create Message
      const { id, channel_id } = await Discord(
        'POST',
        `/channels/${interaction.channel_id}/messages`,
        new Message({
          title: `Game ${gameNo} Prompt`,
          description:
            'A new Game Chat has been Opened !**' +
            `\nOpened By\t:\t<@${interaction.member.user.id}>` +
            `\nTime\t\t\t:\t<t:${~~(Date.now() / 1000)}:R>**`,
        }).getData()
      );

      if (!id) {
        // Notify failure
        return new Message(
          {
            title: 'NewGame Prompt',
            description: `Failed !`,
          },
          Message.Flags.EPHEMERAL
        ).toResponse();
      }

      // Open Thread & Increment Game number
      await Promise.all([
        Discord('POST', `/channels/${channel_id}/messages/${id}/threads`, {
          name: `Game ${gameNo}`,
        }),
        MongoDB.updateOne('Variables', 'Games Created', { $inc: { value: 1 } }),
      ]);

      // Respond
      return new Message(
        {
          title: 'NewGame Prompt',
          description: `Success !`,
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    if (interaction.channel_id !== Channels.gameBot) {
      return new Message(
        {
          title: 'NewGame Prompt',
          description: `Only usable in <#${Channels.gameBot}> !`,
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    const gameNo = (await MongoDB.findOne('Variables', 'Games Created', { _id: 0 })).value;

    const { id, username, discriminator } = interaction.member.user;

    const channelId = await Discord('POST', `/guilds/${homeGuildId}/channels`, {
      name: `game-${gameNo}`,
      type: 0, // GUILD_TEXT
      topic: `A **G**ame made by ${username}#${discriminator}`,
      nsfw: false,
      parent_id: Channels.Games,
      permission_overwrites: [
        {
          id: homeGuildId,
          type: 0,
          deny: String(Permissions.VIEW_CHANNEL),
        },
        {
          id,
          type: 1,
          allow: String(Permissions.VIEW_CHANNEL | Permissions.MANAGE_ROLES),
        },
      ],
    }).then(ch => ch.id);

    await Promise.all([
      Discord('POST', `/channels/${channelId}/messages`, {
        content: `<@${id}> joined the chat`,
      }),
      MongoDB.updateOne('Variables', 'Games Created', { $inc: { value: 1 } }),
    ]);

    return new Message({
      title: `Game ${gameNo} Prompt`,
      description:
        'A new game channel has been opened!**' +
        `\nOwner\t\t:\t<@${id}>` +
        `\nChannel\t:\t<#${channelId}>` +
        `\nOpened\t:\t<t:${~~(Date.now() / 1000)}:R>**` +
        `\n*This Interaction is supposed to be closed <t:${~~(Date.now() / 1000) + 300}:R>*`,
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 3,
              label: 'Join',
              custom_id: `join-${gameNo}-${channelId}-${Date.now()}`,
            },
          ],
        },
      ],
    }).toResponse();
  },
};
