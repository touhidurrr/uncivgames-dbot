import Message from '../../../modules/message.js';

export default {
  name: 'ping',
  description: 'Pings Democracy Bot to check if he is Available',
  async respond(interaction) {
    return new Message({
      title: 'Ping Response',
      description: 'Democracy Bot is Here !',
    }).toResponse();
  },
};
