// Import statements for ApplicationCommandResponses
import add from './Interactions/ApplicationCommand/ChatInput/add.js';
import addbrgame from './Interactions/ApplicationCommand/ChatInput/addbrgame.js';
import addid from './Interactions/ApplicationCommand/ChatInput/addid.js';
import archive from './Interactions/ApplicationCommand/ChatInput/archive.js';
import avatar from './Interactions/ApplicationCommand/ChatInput/avatar.js';
import choose from './Interactions/ApplicationCommand/ChatInput/choose.js';
import cleargamename from './Interactions/ApplicationCommand/ChatInput/cleargamename.js';
import credits from './Interactions/ApplicationCommand/ChatInput/credits.js';
import dropid from './Interactions/ApplicationCommand/ChatInput/dropid.js';
import gameinfo from './Interactions/ApplicationCommand/ChatInput/gameinfo.js';
import leave from './Interactions/ApplicationCommand/ChatInput/leave.js';
import myturn from './Interactions/ApplicationCommand/ChatInput/myturn.js';
import newgame from './Interactions/ApplicationCommand/ChatInput/newgame.js';
import notifications from './Interactions/ApplicationCommand/ChatInput/notifications.js';
import pin from './Interactions/ApplicationCommand/ChatInput/pin.js';
import ping from './Interactions/ApplicationCommand/ChatInput/ping.js';
import poll from './Interactions/ApplicationCommand/ChatInput/poll.js';
import profile from './Interactions/ApplicationCommand/ChatInput/profile.js';
import recentgames from './Interactions/ApplicationCommand/ChatInput/recentgames.js';
import remove from './Interactions/ApplicationCommand/ChatInput/remove.js';
import removeid from './Interactions/ApplicationCommand/ChatInput/removeid.js';
import scramble from './Interactions/ApplicationCommand/ChatInput/scramble.js';
import send from './Interactions/ApplicationCommand/ChatInput/send.js';
import setgamename from './Interactions/ApplicationCommand/ChatInput/setgamename.js';
import unpin from './Interactions/ApplicationCommand/ChatInput/unpin.js';
import votekick from './Interactions/ApplicationCommand/ChatInput/votekick.js';
import messagePin from './Interactions/ApplicationCommand/Message/pin.js';
import messageUnpin from './Interactions/ApplicationCommand/Message/unpin.js';
import userAvatar from './Interactions/ApplicationCommand/User/avatar.js';

// Import statements for InteractionResponses
import gameIdSuggestion from './Interactions/Autocomplete/gameIdSuggestion.js';
import join from './Interactions/MessageComponent/join.js';
import notificationsComponent from './Interactions/MessageComponent/notifications.js';
import votepoll from './Interactions/MessageComponent/votepoll.js';
import pollModalSubmit from './Interactions/ModalSubmit/poll.js';

// Exporting ApplicationCommandResponses
export const ApplicationCommandResponses = {
  1: [
    add,
    addid,
    archive,
    avatar,
    choose,
    credits,
    gameinfo,
    leave,
    newgame,
    notifications,
    pin,
    ping,
    poll,
    profile,
    remove,
    removeid,
    scramble,
    send,
    unpin,
    setgamename,
    cleargamename,
    myturn,
    recentgames,
    dropid,
    addbrgame,
    votekick,
  ],
  2: [userAvatar],
  3: [messagePin, messageUnpin],
};

// Exporting InteractionResponses
export const InteractionResponses = {
  3: [join, notificationsComponent, votepoll],
  4: [gameIdSuggestion],
  5: [pollModalSubmit],
};
