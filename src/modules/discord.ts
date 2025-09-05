import { RequestMethod } from '@discordjs/rest';

const discordApiEndpoint = 'https://discord.com/api/v10';

export default async function Discord<BodyType = any, ResponseType = unknown>(
  method: `${RequestMethod}`,
  path: string,
  data?: BodyType
): Promise<ResponseType> {
  const config: RequestInit = {
    method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bot ${env.DISCORD_TOKEN}`,
    },
  };

  if (data) {
    if (data instanceof FormData) {
      config.body = data;
    } else {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(data);
    }
  }

  return fetch(discordApiEndpoint + path, config).then(async res => {
    if (!res.ok) {
      console.error(res.status, await res.json());
      throw new Error('Discord API Error');
    }

    const isJSON = res.headers.get('Content-Type').includes('json');
    if (isJSON) return res.json();
  }) as Promise<ResponseType>;
}
