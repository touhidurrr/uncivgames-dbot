const { verify } = require('tweetnacl').sign.detached;
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
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex') // from env
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

  // Autocomplete
  if (interaction.type === 4) {
    return await InteractionResponses[4]
      .filter(r => r.logic(interaction))
      .sort((a, b) => b.priority - a.priority)[0]
      .respond(interaction);
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
