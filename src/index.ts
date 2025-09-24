import { verifySignature } from '@lib';
import { JsonResponse } from '@models';
import secrets from '@secrets';
import { APIInteraction, InteractionResponseType } from 'discord-api-types/v10';
import {
  ApplicationCommandResponses,
  InteractionResponses,
} from './responsesList';
import { scheduled } from './scheduled';

//@ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default {
  scheduled,
  async fetch(req, env, ctx) {
    secrets.setEnv(env);

    // Check if the Request is Verified
    const signature = req.headers.get('X-Signature-Ed25519');
    const timestamp = req.headers.get('X-Signature-Timestamp');
    const rawBody = await req.text();

    const verified = await verifySignature(signature!, timestamp!, rawBody);
    if (!verified) {
      return new Response('invalid request signature', { status: 401 });
    }

    // Parse Request
    const interaction = JSON.parse(rawBody) as APIInteraction;

    // Log Interaction
    //console.dir(interaction, { depth: null });

    switch (interaction.type) {
      case 1: // Respond to Ping
        return new JsonResponse({ type: InteractionResponseType.Pong });

      case 2: // Respond to Application Commands
        const command = ApplicationCommandResponses[interaction.data.type].find(
          i => i.name === interaction.data.name
        );
        if (!command) new Response('Not Found', { status: 404 });
        return command.respond(interaction);

      case 4: // Autocomplete
        return InteractionResponses[4]
          .filter(r => r.logic(interaction))
          .sort((a, b) => b.priority - a.priority)[0]
          .respond(interaction);

      default: // Respond to other Interactions
        if (InteractionResponses.hasOwnProperty(interaction.type)) {
          //@ts-ignore ignore
          const args = interaction.data.custom_id.split('-');
          const cName = args.shift();

          return InteractionResponses[interaction.type]
            .find(i => i.name === cName)
            .respond(interaction, ...args);
        }
    }
  },
} satisfies ExportedHandler<Env>;
