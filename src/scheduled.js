const Channels = require('./channels.json');
const Message = require('./modules/message.js');
const Discord = require('./modules/discordApi.js');
const MongoDB = require('./modules/mongodbApi.js');

BigInt.prototype.toJSON = function () {
  return this.toString();
};

module.exports.handleScheduled = async e => {
  await sendUncivUpdateNotification();
};

var subRequestCount = 0;

async function sendUncivUpdateNotification() {
  const githubApi = 'https://api.github.com/repos/yairm210/Unciv/releases/latest';

  const releaseId = (await MongoDB.findOne('Variables', 'Unciv Release Id', { _id: 0 })).value;

  let { id, tag_name, html_url, assets } = await fetch(githubApi, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'UncivGames Democracy Bot',
    },
  }).then(res => res.json());

  ++subRequestCount;

  if (!(id > releaseId)) return;
  if (assets.length < 6) return;

  id = id.toString();

  await Promise.all([
    Discord(
      'POST',
      `/channels/${Channels.uncivUpdates}/messages`,
      new Message('<@&1110904546642886679>')
        .addEmbed({
          fields: [
            {
              name: 'Release Id',
              value: id,
              inline: true,
            },
            {
              name: 'Version',
              value: `[${tag_name}](${html_url})`,
              inline: true,
            },
            !assets
              ? undefined
              : {
                  name: 'Attachments',
                  value: assets.map(a => `[${a.name}](${a.browser_download_url})`).join('\n'),
                },
          ],
        })
        .getData()
    ).then(({ id }) =>
      Discord('POST', `/channels/${Channels.uncivUpdates}/messages/${id}/crosspost`)
    ),
    MongoDB.updateOne('Variables', 'Unciv Release Id', { $set: { value: { $numberLong: id } } }),
  ]);

  subRequestCount += 2;
}
