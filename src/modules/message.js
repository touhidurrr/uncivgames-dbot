const materialColors = require('./materialColors.js');

module.exports = class Message {
  static Flags = {
    EPHEMERAL: 1 << 6,
    SUPPRESS_EMBEDS: 1 << 2,
  };
  static Types = {
    PONG: 1,
    CHANNEL_MESSAGE_WITH_SOURCE: 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
    DEFERRED_UPDATE_MESSAGE: 6,
    UPDATE_MESSAGE: 7,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
    MODAL: 9,
  };
  body = { data: { embeds: [] } };
  constructor(config, flags) {
    if (config === undefined) return;
    if (typeof config === 'number') this.body.data.content = String(config);
    else if (typeof config === 'string') this.body.data.content = config;
    else if (typeof config === 'object') {
      if (config.components) {
        this.addComponents(config.components);
        delete config.components;
      }
      this.addEmbed(config);
    } else throw 'Unknow Type of Data passed into Message constructor!';

    if (flags) {
      if (typeof flags === 'number') this.addFlag(flags);
      else this.addFlags(flags);
    }
  }
  addFlag(flag) {
    if (!this.body.data.flags) this.body.data.flags = flag;
    else this.body.data.flags |= flag;
  }
  addFlags(flags) {
    if (!this.body.data.flags) this.body.data.flags = 0;
    for (flag of flags) this.body.data.flags |= flag;
  }
  addEmbed(config) {
    let embed = {
      color: config.color || materialColors.getRandomColor(),
      description: config.description,
    };

    if (config.title) {
      embed.author = {
        name: config.title,
        icon_url: 'https://i.imgur.com/nf2lNl0.png',
      };
    }

    if (config.fields) embed.fields = config.fields.filter(f => f);
    if (config.image) embed.image = { url: config.image };
    if (config.footer) embed.footer = { text: config.footer };

    this.body.data.embeds.push(embed);
  }
  addComponents(components) {
    this.body.data.components = components;
  }
  toResponse(type = 4) {
    this.body.type = type;
    // console.dir(this.body, { depth: null });
    return new Response(JSON.stringify(this.body), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
