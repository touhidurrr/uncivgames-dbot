import { gunzipSync } from 'zlib';

export function unpackGame(gameData) {
  return gunzipSync(Buffer.from(gameData, 'base64')).toString('utf8');
}

export async function getGame(gameId) {
  let res = await fetch(`https://uncivserver.xyz/files/${gameId}_Preview`);

  // if Preview is not found try to fetch the full game
  if (!res.ok) res = await fetch(`https://uncivserver.xyz/files/${gameId}`);

  // if that is not found also return null as error signal
  if (!res.ok) return null;

  const jsonText = unpackGame(await res.text());
  return JSON.parse(jsonText);
}

export async function getFullGame(gameId) {
  const res = await fetch(`https://uncivserver.xyz/files/${gameId}`);

  // if game is not found
  if (!res.ok) return null;

  const jsonText = unpackGame(await res.text());
  return JSON.parse(jsonText);
}

export function postGame(gameId, gameData) {
  const json = JSON.stringify(gameData);
  const gzip = Buffer.from(gzip(json)).toString('utf8');
  const base64 = Buffer.from(gzip).toString('base64');
  return fetch(`https://uncivserver.xyz/files/${gameId}`, {
    method: 'POST',
    headers: {
      'User-Agent': 'UncivDBot/0.0.0',
    },
    body: base64,
  });
}
