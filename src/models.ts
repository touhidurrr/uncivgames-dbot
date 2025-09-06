import Message from '@modules/message.js';
import { stringify } from 'yaml';

export class JsonResponse extends Response {
  constructor(body: any, init?: ResponseInit) {
    const json = JSON.stringify(body);
    init = {
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
      },
      ...init,
    };
    super(json, init);
  }
}

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
        value: `${'```ts\n'}${res.status.toString()}${'\n```'}`,
        inline: true,
      },
      {
        name: 'statusText',
        value: `${'```ts\n'}${res.statusText}${'\n```'}`,
        inline: true,
      },
      {
        name: 'body',
        value: `${'```yml\n'}${isJSON ? stringify(body) : body}${'\n```'}`,
      },
    ],
  }).toResponse();
}
