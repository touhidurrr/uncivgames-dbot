import { getResponseInfoEmbed } from '@models';
import { api, APIGame } from '@modules/api.js';
import Message from '@modules/message.js';
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

    games.forEach(
      ({ _id, name, turns = 0, currentPlayer, createdAt, updatedAt }) =>
        Screen.addEmbed({
          fields: [
            {
              name: 'Game ID',
              value: `\`\`\`${_id}\`\`\``,
            },
            !name
              ? undefined
              : {
                  name: 'Name',
                  value: `\`\`\`${name}\`\`\``,
                },
            {
              name: 'Your Civ',
              value: `\`\`\`${currentPlayer}\`\`\``,
              inline: true,
            },
            {
              name: 'Turns',
              value: `\`\`\`${turns}\`\`\``,
              inline: true,
            },
            {
              name: 'Started - Last Activity',
              value: `<t:${Math.floor(Date.parse(createdAt) / 1000)}:R> - <t:${Math.floor(Date.parse(updatedAt) / 1000)}:R>`,
            },
          ],
        })
    );

    return Screen.toResponse();
  },
};
