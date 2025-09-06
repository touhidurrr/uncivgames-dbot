import { api, APIGame } from '@modules/api.js';
import Message from '@modules/message.js';
import { getResponseInfoEmbed } from '@models';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';

export default {
  name: 'myturn',
  description: 'Check the Games where it is your Turn !',
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    const userId = !interaction.user
      ? interaction.member.user.id
      : interaction.user.id;

    const res = await api.getGamesByProfile(userId, {
      playing: true,
      limit: 5,
    });

    if (res.status in [204, 404]) {
      return new Message(
        {
          title: 'MyTurn Prompt',
          description:
            "**Opps!** You don't have any Unciv user Ids listed !" +
            '\nUse `/addid` so that the bot can ***Recongnise*** you ...',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    if (!res.ok) return getResponseInfoEmbed(res);
    const games = (await res.json()) as APIGame[];

    if (games.length < 1) {
      return new Message(
        {
          title: 'MyTurn Prompt',
          description: 'I could not find any Game where it is your Turn !',
        },
        Message.Flags.Ephemeral
      ).toResponse();
    }

    const Screen = new Message().addFlag(Message.Flags.Ephemeral);

    games.forEach(game =>
      Screen.addEmbed({
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
            name: 'Your Civ',
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

    return Screen.toResponse();
  },
};
