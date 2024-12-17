import { gunzipSync, gzipSync } from 'zlib';

export function unpackGame(gameData: string) {
  return gunzipSync(Buffer.from(gameData, 'base64')).toString('utf8');
}

export async function getGame(gameId: string) {
  let res = await fetch(`https://uncivserver.xyz/files/${gameId}_Preview`);

  // if Preview is not found try to fetch the full game
  if (!res.ok) res = await fetch(`https://uncivserver.xyz/files/${gameId}`);

  // if that is not found also return null as error signal
  if (!res.ok) return null;

  const jsonText = unpackGame(await res.text());
  return JSON.parse(jsonText);
}

export async function getFullGame(gameId: string) {
  const res = await fetch(`https://uncivserver.xyz/files/${gameId}`);

  // if game is not found
  if (!res.ok) return null;

  const jsonText = unpackGame(await res.text());
  return JSON.parse(jsonText);
}

export function postGame(gameId: string, gameData: string) {
  const json = JSON.stringify(gameData);
  const base64 = gzipSync(json).toString('base64');
  return fetch(`https://uncivserver.xyz/files/${gameId}`, {
    method: 'POST',
    headers: {
      'User-Agent': 'UncivDBot/0.0.0',
    },
    body: base64,
  });
}
