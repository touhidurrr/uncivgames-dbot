const { gzipSync, gunzipSync } = require('zlib');
const jsonParser = require('./ijson-parser.js');

module.exports.getGame = async function (gameId) {
  let res = await fetch(`https://uncivserver.xyz/files/${gameId}_Preview`);

  // if Preview is not found try to fetch the full game
  if (!res.ok) res = await fetch(`https://uncivserver.xyz/files/${gameId}`);

  // if that is not found also return null as error signal
  if (!res.ok) return null;

  let gzipData = await res.text();
  let jsonText = gunzipSync(Buffer.from(gzipData, 'base64')).toString();

  return jsonParser(jsonText);
};

module.exports.getFullGame = async function (gameId) {
  const res = await fetch(`https://uncivserver.xyz/files/${gameId}`);

  // if that is not found also return null as error signal
  if (!res.ok) return null;

  let gzipData = await res.text();
  let jsonText = gunzipSync(Buffer.from(gzipData, 'base64')).toString();

  return jsonParser(jsonText);
};

module.exports.postGame = async function (gameId, gameData) {
  const json = JSON.stringify(gameData);
  const base64 = Buffer.from(json).toString('base64');
  const gzip = gzipSync(base64);
  const res = await fetch(`https://uncivserver.xyz/files/${gameId}`, {
    method: 'POST',
    headers: {
      'User-Agent': 'UncivDBot/0.0.0',
    },
    body: gzip
  });
};
