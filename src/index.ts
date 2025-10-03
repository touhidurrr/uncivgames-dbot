import { validateDiscordInteractionRequest } from '@lib';
import { JsonResponse } from '@models';
import secrets from '@secrets';
import { InteractionResponseType } from 'discord-api-types/v10';
import {
  ApplicationCommandResponses,
  InteractionResponses,
} from './responsesList';
import { scheduled } from './scheduled';

//@ts-expect-error needed to parse BigInt in JSON
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default {
  scheduled,
  async fetch(req, env) {
    secrets.setEnv(env);

    const { success, interaction } =
      await validateDiscordInteractionRequest(req);

    if (!success) {
      return new Response('invalid request signature', {
        status: 401,
        statusText: 'Unauthorized',
      });
    }

    // Log Interaction
    //console.dir(interaction, { depth: null });

    switch (interaction.type) {
      case 1: {
        // Respond to Ping
        return new JsonResponse({ type: InteractionResponseType.Pong });
      }
      case 2: {
        // Respond to Application Commands
        const command = ApplicationCommandResponses[interaction.data.type].find(
          i => i.name === interaction.data.name
        );
        if (!command) new Response('Not Found', { status: 404 });
        return command.respond(interaction);
      }
      case 4: {
        // Autocomplete
        return InteractionResponses[4]
          .filter(r => r.logic(interaction))
          .sort((a, b) => b.priority - a.priority)[0]
          .respond(interaction);
      }
      default: {
        // Respond to other Interactions
        if (!InteractionResponses[interaction.type]) {
          const cid = interaction.data['custom_id'];
          const args = (typeof cid === 'string' ? cid : '').split('-');
          const cName = args.shift();

          return InteractionResponses[interaction.type]
            .find(i => i.name === cName)
            .respond(interaction, ...args);
        }
      }
    }
  },
} satisfies ExportedHandler<Env>;
