const { ungzip } = require('pako');
const buffer = require('buffer/').Buffer;
const jsonParser = require('./ijson-parser.js');

module.exports.getGame = async function (gameId) {
  let res = await fetch(`https://uncivserver.xyz/files/${gameId}_Preview`);

  // if Preview is not found try to fetch the full game
  if (res.status !== 200) res = await fetch(`https://uncivserver.xyz/files/${gameId}`);

  // if that is not found also return null as error signal
  if (res.status !== 200) return null;

  let gzipData = await res.text();
  let jsonText = await ungzip(buffer.from(gzipData, 'base64'), { to: 'string' });

  return jsonParser(jsonText);
};
