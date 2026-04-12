import { getResponseInfoEmbed } from '@lib';
import { JsonResponse } from '@models';
import { api, APIProfile } from '@modules/api';
import { getRandomColor } from '@modules/materialColors';
import Message from '@modules/message';
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
    const userId = interaction.member?.user?.id || interaction.user?.id;

    if (initiatorId !== userId) {
      return new JsonResponse({
        type: InteractionResponseType.DeferredMessageUpdate,
      });
    }

    const profRes = await api.getProfile(userId);
    if (!profRes.ok) return getResponseInfoEmbed(profRes);

    const { notifications } = (await profRes.json()) as APIProfile;

    const {
      message,
      message: {
        embeds: [embed],
      },
    } = interaction;

    // update color
    embed.color = getRandomColor();

    function updateEmbedFooter() {
      const timeLeft = 300 - (Date.now() - parseInt(timestamp)) / 1000;
      embed.footer = {
        text:
          timeLeft < 0.001
            ? 'This Interaction will be Closed anytime soon'
            : `You have around ${timeLeft.toFixed(2)} seconds or more to react to this Message.`,
      };
    }

    if (toggle === notifications) {
      updateEmbedFooter();

      return new JsonResponse({
        type: Message.Types.UPDATE_MESSAGE,
        data: message,
      });
    }

    const setRes = await api.setNotificationStatus(userId, toggle);
    if (!setRes.ok) return getResponseInfoEmbed(setRes);

    embed.description = `Your Notifications are currently **${
      toggle.at(0)?.toUpperCase() + toggle.slice(1)
    }**.\nUse the buttons below to change this setting.`;

    updateEmbedFooter();

    const actionRow = message
      ?.components?.[0] as APIActionRowComponent<APIButtonComponent>;

    actionRow.components[0].disabled = toggle === 'enabled';
    actionRow.components[1].disabled = toggle === 'disabled';

    return new JsonResponse({
      type: Message.Types.UPDATE_MESSAGE,
      data: message,
    });
  },
};
