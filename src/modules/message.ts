import {
  APIAttachment,
  APIEmbed,
  APIInteractionResponse,
  APIInteractionResponseCallbackData,
  InteractionResponseType,
  MessageFlags,
} from 'discord-api-types/v10';
import { getRandomColor } from './materialColors.js';

export type MessageFile = Partial<APIAttachment> & {
  id?: number;
  filename: string;
  data: ((ArrayBuffer | ArrayBufferView) | string | Blob)[];
};

export default class Message {
  static Flags = MessageFlags;
  static Types = {
    PONG: 1,
    CHANNEL_MESSAGE_WITH_SOURCE: 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
    DEFERRED_UPDATE_MESSAGE: 6,
    UPDATE_MESSAGE: 7,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
    MODAL: 9,
  };
  #files: MessageFile[] = [];
  body: Partial<APIInteractionResponse> & {
    type: InteractionResponseType;
    data: APIInteractionResponseCallbackData;
  } = {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: { embeds: [] },
  };
  constructor(config, flags?: MessageFlags | MessageFlags[]) {
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

    return this;
  }
  addFlag(flag: MessageFlags) {
    if (!this.body.data.flags) this.body.data.flags = flag;
    else this.body.data.flags |= flag;
    return this;
  }
  addFlags(flags: MessageFlags[]) {
    //@ts-ignore
    if (!this.body.data.flags) this.body.data.flags = 0;
    for (const flag of flags) this.body.data.flags |= flag;
    return this;
  }
  addEmbed(config: Partial<APIEmbed> & { image?: string; footer?: string }) {
    const embed: APIEmbed = {
      color: config.color || getRandomColor(),
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
    return this;
  }
  addComponents(components) {
    this.body.data.components = components;
    return this;
  }
  addFile(file: MessageFile) {
    //@ts-ignore
    file.id = this.#files.length;
    this.#files.push(file);
    return this;
  }
  toJSON(type?: InteractionResponseType) {
    //@ts-ignore
    if (type) this.body.type = type;
    return JSON.stringify(this.body);
  }
  toResponse(type?: InteractionResponseType) {
    if (this.#files.length) {
      const fd = new FormData();
      fd.append('payload_json', this.toJSON(type));
      this.#files.forEach(({ id, filename, data }) => {
        fd.append(`files[${id}]`, new File(data, filename), filename);
      });
      return new Response(fd);
    }

    return new Response(this.toJSON(type), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  getData() {
    return this.body.data;
  }
  getBody() {
    return this.body;
  }
}
