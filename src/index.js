const buffer = require('buffer/').Buffer;
const { verify } = require('tweetnacl').sign.detached;

const Channels = require('./channels.json');
const Message = require('./modules/message.js');
const Discord = require('./modules/discordApi.js');
const MongoDB = require('./modules/mongodbApi.js');
const { handleScheduled } = require('./scheduled.js');
const { ApplicationCommandResponses, InteractionResponses } = require('./responsesList.js');

BigInt.prototype.toJSON = function () {
  return this.toString();
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

addEventListener('scheduled', event => {
  console.dir(event, { depth: null });
  event.waitUntil(handleScheduled(event));
});

async function handleRequest(req) {
  // Check if the Request is Verified
  const signature = String(req.headers.get('X-Signature-Ed25519'));
  const timestamp = String(req.headers.get('X-Signature-Timestamp'));
  const rawBody = await req.text();

  const verified = await verify(
    buffer.from(timestamp + rawBody),
    buffer.from(signature, 'hex'),
    buffer.from(PUBLIC_KEY, 'hex') // from env
  );

  if (!verified) {
    return new Response({ status: 401, statusText: 'invalid request signature' });
  }

  // Parse Request
  const interaction = JSON.parse(rawBody);

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

  // Respond to other Interactions
  if (InteractionResponses.hasOwnProperty(interaction.type)) {
    let args = interaction.data.custom_id.split('-');
    const cName = args.shift();

    return await InteractionResponses[interaction.type]
      .find(i => i.name === cName)
      .respond(interaction, ...args);
  }
}
