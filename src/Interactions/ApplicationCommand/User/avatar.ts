import Message from '@modules/message.js';
import { APIUserApplicationCommandInteraction } from 'discord-api-types/v10';

export default {
  name: 'avatar',
  async respond(interaction: APIUserApplicationCommandInteraction) {
    const user = interaction.data.resolved.users[Object.keys(interaction.data.resolved.users)[0]];

    const userIcon = !user.avatar
      ? `https://cdn.discordapp.com/embed/avatars/${+user.discriminator % 5}.png`
      : `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${
          user.avatar.startsWith('a_') ? 'gif' : 'png'
        }`;

    return new Message({
      title: `${user.username}'s avatar`,
      image: `${userIcon}?size=4096`,
    }).toResponse();
  },
};
