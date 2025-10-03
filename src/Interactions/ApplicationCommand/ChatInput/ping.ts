import Message from '@modules/message';

export default {
  name: 'ping',
  description: 'Pings Democracy Bot to check if he is Available',
  respond: () =>
    new Message({
      title: 'Ping Response',
      description: 'Democracy Bot is Here !',
    }).toResponse(),
};
