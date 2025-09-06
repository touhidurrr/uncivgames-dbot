import { api, APIGame } from '@modules/api.js';
import { getResponseInfoEmbed, JsonResponse } from '@models';
import {
  APIApplicationCommandAutocompleteInteraction,
  APIApplicationCommandAutocompleteResponse,
  InteractionResponseType,
} from 'discord-api-types/v10';

export default {
  priority: 0,
  logic: (i: APIApplicationCommandAutocompleteInteraction) =>
    //@ts-ignore
    i.data.options.some(o => o.focused && o.name === 'game-id'),
  async respond(interaction: APIApplicationCommandAutocompleteInteraction) {
    const userId = interaction.user
      ? interaction.user.id
      : interaction.member.user.id;

    const res = await api.getGamesByProfile(userId);

    const choices = !res.ok
      ? []
      : ((await res.json()) as APIGame[]).map(({ _id, name }) => ({
          name: name ?? _id,
          value: _id,
        }));

    return new JsonResponse({
      type: InteractionResponseType.ApplicationCommandAutocompleteResult,
      data: { choices },
    } satisfies APIApplicationCommandAutocompleteResponse);
  },
};
