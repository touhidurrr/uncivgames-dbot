import Message from '@modules/message.js';
import prisma from '@modules/prisma.js';
import {
  APIActionRowComponent,
  APIButtonComponent,
  APIMessageComponentButtonInteraction,
} from 'discord-api-types/v10';

export default {
  name: 'notifications',
  async respond(
    interaction: APIMessageComponentButtonInteraction,
    initiatorId: string,
    toggle: string,
    timestamp: string
  ) {
    const user = interaction.user || interaction.member.user;

    if (initiatorId !== user.id) {
      return new Response('{"type":6}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let { message } = interaction;

    const { id, notifications } = await prisma.profile.findFirstOrThrow({
      where: { discordId: +user.id },
      select: { id: true, notifications: true },
    });

    if (toggle === notifications) {
      const timeLeft = 300 - (Date.now() - parseInt(timestamp)) / 1000;

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

    await prisma.profile.update({
      where: { id },
      data: {
        notifications: toggle,
        updatedAt: Date.now(),
      },
    });

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
