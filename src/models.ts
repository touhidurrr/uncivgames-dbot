import Message, { enCode } from '@modules/message.js';
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
        value: enCode(`${isJSON ? stringify(body) : body}`, 'yml'),
      },
    ],
  }).toResponse();
}
