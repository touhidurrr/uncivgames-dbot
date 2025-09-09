import Message from '@modules/message';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';

export default {
  name: 'ping',
  description: 'Pings Democracy Bot to check if he is Available',
  async respond(_: APIChatInputApplicationCommandInteraction) {
    return new Message({
      title: 'Ping Response',
      description: 'Democracy Bot is Here !',
    }).toResponse();
  },
};
