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
          value: 'PikaPika#2315 • [Github](https://github.com/touhidurrr)',
        },
        {
          name: 'Bot Avatar',
          value:
            '[Unciv](https://github.com/yairm210/Unciv)' +
            ' • [Image Link](https://github.com/yairm210/Unciv/blob/master/extraImages/Unciv%20icon%20v3.png)' +
            ' • [LICENSE](https://github.com/yairm210/Unciv/blob/master/LICENSE)',
        },
      ],
    }).toResponse();
  },
};
