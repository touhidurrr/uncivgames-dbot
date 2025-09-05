import { APIInteraction } from 'discord-api-types/v10';
import { sign } from 'tweetnacl';
import {
  ApplicationCommandResponses,
  InteractionResponses,
} from './responsesList.js';
import { scheduled } from './scheduled.js';
import secrets from './secrets.js';

//@ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export default {
  scheduled,
  async fetch(req, env, ctx) {
    secrets.setEnv(env);

    // Check if the Request is Verified
    const signature = String(req.headers.get('X-Signature-Ed25519'));
    const timestamp = String(req.headers.get('X-Signature-Timestamp'));
    const rawBody = await req.text();

    const verified = await sign.detached.verify(
      Buffer.from(timestamp + rawBody),
      Buffer.from(signature, 'hex'),
      Buffer.from(secrets.env.PUBLIC_KEY, 'hex') // from env
    );

    if (!verified) {
      return new Response('invalid request signature', { status: 401 });
    }

    // Parse Request
    const interaction = JSON.parse(rawBody) as APIInteraction;

    // Log Interaction
    //console.dir(interaction, { depth: null });

    // Respond to Ping
    if (interaction.type === 1) {
      return new Response('{"type":1}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Respond to Application Commands
    if (interaction.type === 2) {
      const command = ApplicationCommandResponses[interaction.data.type].find(
        i => i.name === interaction.data.name
      );
      if (!command) new Response('Not Found', { status: 404 });
      return await command.respond(interaction);
    }

    // Autocomplete
    if (interaction.type === 4) {
      return await InteractionResponses[4]
        .filter(r => r.logic(interaction))
        .sort((a, b) => b.priority - a.priority)[0]
        .respond(interaction);
    }

    // Respond to other Interactions
    if (InteractionResponses.hasOwnProperty(interaction.type)) {
      const args = interaction.data.custom_id.split('-');
      const cName = args.shift();

      return await InteractionResponses[interaction.type]
        .find(i => i.name === cName)
        //@ts-ignore
        .respond(interaction, ...args);
    }
  },
} satisfies ExportedHandler<Env>;
