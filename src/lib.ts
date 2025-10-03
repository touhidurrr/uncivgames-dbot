import Message from '@modules/message';
import secrets from '@secrets';
import { APIInteraction } from 'discord-api-types/v10';

export const enCode = (input: string, ext: string = 'js'): string => {
  return `${'```'}${ext}\n${input}${'\n```'}`;
};

export async function getResponseInfoEmbed(res: Response): Promise<Response> {
  const ct = res.headers.get('content-type');
  const isJSON = ct !== undefined && ct.includes('json');
  const body = await (isJSON ? res.json() : res.text());
  return new Message({
    title: 'Response Info',
    description: 'The detailed server response.',
    fields: [
      {
        name: 'status',
        value: enCode(res.status.toString()),
        inline: true,
      },
      {
        name: 'statusText',
        value: enCode(res.statusText),
        inline: true,
      },
      {
        name: 'body',
        value: enCode(`${isJSON ? JSON.stringify(body, null, 2) : body}`),
      },
    ],
  }).toResponse();
}

const enc = new TextEncoder('utf-8');
let publicKey: CryptoKey | null = null;

export const validateDiscordInteractionRequest = async (
  req: Parameters<ExportedHandler<Env>['fetch']>[0]
): Promise<
  | { success: true; interaction: APIInteraction }
  | { success: false; interaction: null }
> => {
  const signature = req.headers.get('X-Signature-Ed25519');
  const timestamp = req.headers.get('X-Signature-Timestamp');
  const payload = await req.text();

  if (!(signature && timestamp && payload)) {
    return { success: false, interaction: null };
  }

  // cache public key
  if (!publicKey) {
    publicKey = await crypto.subtle.importKey(
      'raw',
      Uint8Array.fromHex(secrets.env.PUBLIC_KEY),
      'Ed25519',
      false,
      ['verify']
    );
  }

  const verified = await crypto.subtle.verify(
    'Ed25519',
    publicKey,
    Uint8Array.fromHex(signature),
    enc.encode(timestamp + payload)
  );

  return {
    success: verified,
    interaction: verified ? JSON.parse(payload) : null,
  };
};
