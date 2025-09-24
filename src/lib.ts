import Message from '@modules/message';
import secrets from '@secrets';

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

export const verifySignature = async (
  signature: string,
  timestamp: string,
  body: string
): Promise<boolean> => {
  if (!publicKey) {
    publicKey = await crypto.subtle.importKey(
      'raw',
      Buffer.from(secrets.env.PUBLIC_KEY, 'hex'),
      'Ed25519',
      false,
      ['verify']
    );
  }
  const data = enc.encode(timestamp + body);
  const sigBuffer = Buffer.from(signature, 'hex');
  return crypto.subtle.verify('Ed25519', publicKey, sigBuffer, data);
};
