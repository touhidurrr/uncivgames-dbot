const Message = require('../../../modules/message.js');
const Permissions = require('../../../modules/permissionsManager.js');
const Discord = require('../../../modules/discordApi.js');
const Channels = require('../../../channels.json');

module.exports = {
  name: 'archive',
  guildId: '866650187211210762',
  description: 'archives a Game Channel',
  options: [
    {
      name: 'number',
      description: 'Number of a Game Channel, Moderator(s) only',
      type: 4,
      required: false,
    },
  ],
  async respond(interaction) {
    if (interaction.channel_id in [Channels.gameDiscussion, Channels.gameBot, Channels.botTest]) {
      return new Message(
        {
          title: 'Archive Prompt',
          description: 'Only usable in **G**ame **C**hannels !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    let Channel = false;
    let channelId = interaction.channel_id;
    const isMod =
      interaction.member.user.id === AUTHOR_ID || interaction.member.roles.includes(MOD_ROLE_ID);

    // Get Channels List
    const GuildChannels = await Discord('GET', `/guilds/${this.guildId}/channels`);

    if (interaction.data.options) {
      if (!isMod) {
        return new Message(
          {
            title: 'Archive Prompt',
            description: 'Option exclusive to Moderator(s) !',
          },
          Message.Flags.EPHEMERAL
        ).toResponse();
      }

      const channelNumber = interaction.data.options[0].value;

      Channel = GuildChannels.find(
        ch => ch.name === `game-${channelNumber}` && ch.parent_id === Channels.Games
      );

      if (!Channel) {
        return new Message(
          {
            title: 'Archive Prompt',
            description: 'Channel not Found !',
          },
          Message.Flags.EPHEMERAL
        ).toResponse();
      }

      channelId = Channel.id;
    }

    if (!isMod && !new Permissions(interaction.member.permissions).has(Permissions.MANAGE_ROLES)) {
      return new Message(
        {
          title: 'Archive Prompt',
          description: 'Only available for the **G**ame **C**hannel **O**wner or Moderators !',
        },
        Message.Flags.EPHEMERAL
      ).toResponse();
    }

    if (!Channel) Channel = GuildChannels.find(ch => ch.id === channelId);

    if (Channel.parent_id !== Channels.Games || !RegExp('^game-\\d+$').test(Channel.name)) {
      return new Message(
        {
          title: 'Archive Prompt',
          description: 'Only Game Channels can be archived !',
        },
        Message.Flags.EPHEMERAL
      );
    }

    if (Channel.parent_id === Channels.GameArchives) {
      return new Message(
        {
          title: 'Archive Prompt',
          description: 'Already Archived !',
        },
        Message.Flags.EPHEMERAL
      );
    }

    // I will put this aside for now

    /*const { position } = GuildChannels.filter(ch => ch.parent_id === Channels.GameArchives).reduce(
      (max, current) => {
        if (max.position > current.position) return max;
        return current;
      },
      { position: -Infinity }
    );*/

    delete Channel.permission_overwrites[this.guildId];

    const permission_overwrites = Channel.permission_overwrites.map(perm => {
      perm.allow = String(Permissions.VIEW_CHANNEL);
      perm.deny = String(Permissions.SEND_MESSAGES);
      return perm;
    });

    permission_overwrites.push({
      id: this.guildId,
      type: 0,
      deny: String(Permissions.VIEW_CHANNEL),
    });

    await Discord('PATCH', `/channels/${channelId}`, {
      parent_id: Channels.GameArchives,
      permission_overwrites,
      //position,
    });

    return new Message({
      title: 'Archive Prompt',
      description: 'This Channel is now Archived !',
    }).toResponse();
  },
};
