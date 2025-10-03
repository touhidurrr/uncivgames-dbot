import Message from '@modules/message';
import {
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
  ApplicationCommandOptionType,
} from 'discord-api-types/v10';

export default {
  name: 'avatar',
  description: "Get your or someone else's Avatar!",
  options: [
    {
      name: 'user',
      description: 'Pick an User to see their Avatar!',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ] satisfies APIApplicationCommandOption[],
  async respond(interaction: APIChatInputApplicationCommandInteraction) {
    const user =
      interaction.data.options[0]?.type === ApplicationCommandOptionType.User
        ? interaction.data.resolved.users[interaction.data.options[0].value]
        : (interaction.user ?? interaction.member.user);

    const userIcon = !user.avatar
      ? `https://cdn.discordapp.com/embed/avatars/${~~user.discriminator % 5}.png`
      : `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${
          user.avatar.startsWith('a_') ? 'gif' : 'png'
        }`;

    return new Message({
      title: `${user.username}'s avatar`,
      image: `${userIcon}?size=4096`,
    }).toResponse();
  },
};
