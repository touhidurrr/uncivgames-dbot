import Message from '@modules/message';
import { stringify } from 'yaml';

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
        value: enCode(`${isJSON ? stringify(body) : body}`, 'yml'),
      },
    ],
  }).toResponse();
}
