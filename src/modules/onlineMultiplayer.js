const { Buffer } = require('buffer');
const { ungzip, gzip } = require('pako');
const jsonParser = require('./ijson-parser.js');

module.exports.getGame = async function (gameId) {
  let res = await fetch(`https://uncivserver.xyz/files/${gameId}_Preview`);

  // if Preview is not found try to fetch the full game
  if (!res.ok) res = await fetch(`https://uncivserver.xyz/files/${gameId}`);

  // if that is not found also return null as error signal
  if (!res.ok) return null;

  const gzipData = await res.text();
  const jsonText = ungzip(Buffer.from(gzipData, 'base64'), { to: 'string' });

  return jsonParser(jsonText);
};

module.exports.getFullGame = async function (gameId) {
  const res = await fetch(`https://uncivserver.xyz/files/${gameId}`);

  // if game is not found
  if (!res.ok) return null;

  const gzipData = await res.text();
  const jsonText = ungzip(Buffer.from(gzipData, 'base64'), { to: 'string' })

  return jsonParser(jsonText);
};

module.exports.postGame = function (gameId, gameData) {
  const json = JSON.stringify(gameData);
  const gzip = Buffer.from(gzip(json)).toString('utf8');
  const base64 = Buffer.from(gzip).toString('base64');
  return fetch(`https://uncivserver.xyz/files/${gameId}`, {
    method: 'POST',
    headers: {
      'User-Agent': 'UncivDBot/0.0.0',
    },
    body: base64
  });
};
