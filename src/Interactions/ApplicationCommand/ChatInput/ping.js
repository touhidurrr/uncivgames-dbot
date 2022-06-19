const Message = require('../../../modules/message.js');

module.exports = {
  name: 'ping',
  description: 'Pings Democracy Bot to check if he is Available',
  async respond(interaction) {
    return new Message({
      title: 'Ping Response',
      description: 'Democracy Bot is Here !',
    }).toResponse();
  },
};
