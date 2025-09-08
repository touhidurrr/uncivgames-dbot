import { getResponseInfoEmbed, JsonResponse } from '@models';
import { api, APIProfile } from '@modules/api.js';
import Message from '@modules/message.js';
import {
  APIActionRowComponent,
  APIButtonComponent,
  APIMessageComponentButtonInteraction,
  InteractionResponseType,
} from 'discord-api-types/v10';

export default {
  name: 'notifications',
  async respond(
    interaction: APIMessageComponentButtonInteraction,
    initiatorId: string,
    toggle: 'enabled' | 'disabled',
    timestamp: string
  ) {
    const user = interaction.user || interaction.member.user;

    if (initiatorId !== user.id) {
      return new JsonResponse({
        type: InteractionResponseType.DeferredMessageUpdate,
      });
    }

    const res = await api.getProfile(user.id);
    if (!res.ok) return getResponseInfoEmbed(res);

    const { message } = interaction;
    const { notifications } = (await res.json()) as APIProfile;

    if (toggle === notifications) {
      const timeLeft = 300 - (Date.now() - parseInt(timestamp)) / 1000;

      message.embeds[0].footer.text = message.embeds[0].footer.text =
        timeLeft < 0.001
          ? 'This Interaction will be Closed anytime soon'
          : `You have around ${timeLeft.toFixed(2)} seconds or more to react to this Message.`;

      return new JsonResponse({
        type: Message.Types.UPDATE_MESSAGE,
        data: message,
      });
    }

    const res2 = await api.setNotificationStatus(user.id, toggle);
    if (!res2.ok) return getResponseInfoEmbed(res2);

    const timeLeft = 300 - (Date.now() - parseInt(timestamp)) / 1000;

    message.embeds[0].description = `Your Notifications are currently **${
      toggle.at(0).toUpperCase() + toggle.slice(1)
    }**.\nUse the buttons below to change this setting.`;
    message.embeds[0].footer.text =
      timeLeft < 0.001
        ? 'This Interaction will be Closed anytime soon'
        : `You have around ${timeLeft.toFixed(2)} seconds or more to react to this Message.`;

    const actionRow = message
      .components[0] as APIActionRowComponent<APIButtonComponent>;
    actionRow.components[0].disabled = toggle === 'enabled';
    actionRow.components[1].disabled = toggle === 'disabled';

    return new JsonResponse({
      type: Message.Types.UPDATE_MESSAGE,
      data: message,
    });
  },
};
