// Folder Structure
exports.ApplicationCommandResponses = {
  // CHAT_INPUT
  1: [
    require('./Interactions/ApplicationCommand/ChatInput/add.js'),
    require('./Interactions/ApplicationCommand/ChatInput/addid.js'),
    require('./Interactions/ApplicationCommand/ChatInput/archive.js'),
    require('./Interactions/ApplicationCommand/ChatInput/avatar.js'),
    require('./Interactions/ApplicationCommand/ChatInput/choose.js'),
    require('./Interactions/ApplicationCommand/ChatInput/credits.js'),
    require('./Interactions/ApplicationCommand/ChatInput/gameinfo.js'),
    require('./Interactions/ApplicationCommand/ChatInput/leave.js'),
    require('./Interactions/ApplicationCommand/ChatInput/newgame.js'),
    require('./Interactions/ApplicationCommand/ChatInput/notifications.js'),
    require('./Interactions/ApplicationCommand/ChatInput/pin.js'),
    require('./Interactions/ApplicationCommand/ChatInput/ping.js'),
    require('./Interactions/ApplicationCommand/ChatInput/poll.js'),
    require('./Interactions/ApplicationCommand/ChatInput/profile.js'),
    require('./Interactions/ApplicationCommand/ChatInput/remove.js'),
    require('./Interactions/ApplicationCommand/ChatInput/removeid.js'),
    require('./Interactions/ApplicationCommand/ChatInput/scramble.js'),
    require('./Interactions/ApplicationCommand/ChatInput/send.js'),
    require('./Interactions/ApplicationCommand/ChatInput/unpin.js'),
    require('./Interactions/ApplicationCommand/ChatInput/setgamename.js'),
    require('./Interactions/ApplicationCommand/ChatInput/cleargamename.js'),
    require('./Interactions/ApplicationCommand/ChatInput/myturn.js'),
    require('./Interactions/ApplicationCommand/ChatInput/recentgames.js'),
    require('./Interactions/ApplicationCommand/ChatInput/dropid.js'),
    require('./Interactions/ApplicationCommand/ChatInput/addbrgame.js'),
  ],
  // USER
  2: [require('./Interactions/ApplicationCommand/User/avatar.js')],
  // MESSAGE
  3: [
    require('./Interactions/ApplicationCommand/Message/pin.js'),
    require('./Interactions/ApplicationCommand/Message/unpin.js'),
  ],
};

// Other Interactions List
exports.InteractionResponses = {
  // MESSAGE_COMPONENT
  3: [
    require('./Interactions/MessageComponent/join.js'),
    require('./Interactions/MessageComponent/notifications.js'),
    require('./Interactions/MessageComponent/votepoll.js'),
  ],
  // APPLICATION_COMMAND_AUTOCOMPLETE
  4: [require('./Interactions/Autocomplete/gameIdSuggestion.js')],
  // MODAL_SUBMIT
  5: [require('./Interactions/ModalSubmit/poll.js')],
};

module.exports = exports;
