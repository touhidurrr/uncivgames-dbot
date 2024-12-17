import Message from '../../modules/message.js';
import MongoDB from '../../modules/mongodb.js';

export default {
  name: 'notifications',
  async respond(interaction, initiatorId, toggle, timestamp) {
    const user = interaction.user || interaction.member.user;

    if (initiatorId !== user.id) {
      return new Response('{"type":6}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let { message } = interaction;

    var profile = await MongoDB.findOne('PlayerProfiles', user.id, { _id: 0, notifications: 1 });

    if (toggle === profile.notifications) {
      const timeLeft = 300 - (Date.now() - timestamp) / 1000;

      message.embeds[0].footer.text = message.embeds[0].footer.text =
        timeLeft < 0.001
          ? 'This Interaction will be Closed anytime soon'
          : `You have around ${timeLeft.toFixed(2)} seconds or more to react to this Message.`;

      return new Response(
        JSON.stringify({
          type: Message.Types.UPDATE_MESSAGE,
          data: message,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    await MongoDB.updateOne('PlayerProfiles', user.id, { $set: { notifications: toggle } });

    const timeLeft = 300 - (Date.now() - timestamp) / 1000;

    message.embeds[0].description = `Your Notifications are currently **${
      toggle.at(0).toUpperCase() + toggle.slice(1)
    }**.\nUse the buttons below to change this setting.`;
    message.embeds[0].footer.text =
      timeLeft < 0.001
        ? 'This Interaction will be Closed anytime soon'
        : `You have around ${timeLeft.toFixed(2)} seconds or more to react to this Message.`;
    message.components[0].components[0].disabled = toggle === 'enabled';
    message.components[0].components[1].disabled = toggle === 'disabled';

    return new Response(
      JSON.stringify({
        type: Message.Types.UPDATE_MESSAGE,
        data: message,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
