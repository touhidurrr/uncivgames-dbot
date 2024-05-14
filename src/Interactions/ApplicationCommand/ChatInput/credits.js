const Message = require('../../../modules/message');

module.exports = {
  name: 'credits',
  description: 'See Bot Credits',
  async respond() {
    return new Message({
      title: 'Democracy Bot Credits',
      fields: [
        {
          name: 'Author',
          value:
            '@touhidurrr • [Github](https://github.com/touhidurrr) • [Email](https://tinyurl.com/dbotmail)',
        },
        {
          name: 'Bot Avatar',
          value:
            'Logo by @caballeroarepa' +
            '\nBase Image: Unciv icon v5' +
            ' • [Source](https://github.com/yairm210/Unciv/blob/345114ed935c72f3e1548b4497c7f42bf9f1258d/extraImages/Unciv%20icon%20v5.png)' +
            ' • [LICENSE](https://github.com/yairm210/Unciv/blob/master/LICENSE)' +
            '\nMultiplayer by Roy Charles from NounProject.com • [Source](https://thenounproject.com/icon/multiplayer-1215652/)',
        },
      ],
    }).toResponse();
  },
};
