import { getResponseInfoEmbed } from '@models';
import { api, APIGame } from '@modules/api.js';
import Message, { enCode } from '@modules/message.js';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';

export default {
  name: 'recentgames',
  description: 'Check your Recently Active Games !',
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    const userId = !interaction.user
      ? interaction.member.user.id
      : interaction.user.id;

    const res = await api.getGamesByProfile(userId, { limit: 5 });

    if (res.status in [204, 404]) {
      return new Message(
        {
          title: 'RecentGames Prompt',
          description:
            "**Opps!** You don't have any Unciv user Ids listed !" +
            '\nUse `/addid` so that the bot can ***Recongnise*** you ...',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    if (!res.ok) return getResponseInfoEmbed(res);
    const games = (await res.json()) as APIGame[];

    if (!games.length) {
      return new Message(
        {
          title: 'RecentGames Prompt',
          description:
            'Could not find any Game for you which was active Recently !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const msg = new Message().addFlag(Message.Flags.Ephemeral);

    games.forEach(
      ({ _id, name, turns = 0, currentPlayer, createdAt, updatedAt }) =>
        msg.addEmbed({
          fields: [
            {
              name: 'Game ID',
              value: enCode(_id),
            },
            !name
              ? undefined
              : {
                  name: 'Name',
                  value: enCode(name),
                },
            {
              name: 'Current Civ',
              value: enCode(currentPlayer),
              inline: true,
            },
            {
              name: 'Turns',
              value: enCode(turns),
              inline: true,
            },
            {
              name: 'Started - Last Activity',
              value: `<t:${Math.floor(Date.parse(createdAt) / 1000)}:R> - <t:${Math.floor(Date.parse(updatedAt) / 1000)}:R>`,
            },
          ],
        })
    );

    return msg.toResponse();
  },
};
