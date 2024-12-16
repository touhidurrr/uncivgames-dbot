const discordApiEndpoint = 'https://discord.com/api/v10';

export default async (method, path, data) => {
  config = {
    method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bot ${env.DISCORD_TOKEN}`,
    },
  };
  if (data) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(data);
  }
  let res = await fetch(discordApiEndpoint + path, config);
  if (res.status < 200 && res.status > 299) await console.log(res.status, res.body);
  if ((await res.headers.get('Content-Type')).includes('application/json')) {
    let json = await res.json();
    //await console.dir(json, { depth: null });
    return json;
  }
};
