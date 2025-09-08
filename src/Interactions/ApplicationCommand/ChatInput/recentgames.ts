import { getResponseInfoEmbed } from '@models';
import { api, APIGame } from '@modules/api.js';
import Message from '@modules/message.js';
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

    games.forEach(game =>
      msg.addEmbed({
        fields: [
          {
            name: 'Game ID',
            value: `\`\`\`${game._id.endsWith('_Preview') ? game._id.slice(0, -8) : game._id}\`\`\``,
          },
          !game.name
            ? undefined
            : {
                name: 'Name',
                value: `\`\`\`${game.name}\`\`\``,
              },
          {
            name: 'Current Civ',
            value: `\`\`\`${game.currentPlayer}\`\`\``,
            inline: true,
          },
          !game.turns
            ? undefined
            : {
                name: 'Turns',
                value: `\`\`\`${game.turns}\`\`\``,
                inline: true,
              },
          {
            name: 'Started',
            value: `<t:${Math.floor(new Date(game.createdAt).getTime() / 1000)}:R>`,
            inline: true,
          },
          {
            name: 'Last Activitity',
            value: `<t:${Math.floor(new Date(game.updatedAt).getTime() / 1000)}:R>`,
            inline: true,
          },
        ],
      })
    );

    return msg.toResponse();
  },
};
