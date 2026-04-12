import { ApplicationCommandType, InteractionType } from 'discord-api-types/v10';

// Import statements for ApplicationCommandResponses
import addid from './Interactions/ApplicationCommand/ChatInput/addid';
import avatar from './Interactions/ApplicationCommand/ChatInput/avatar';
import choose from './Interactions/ApplicationCommand/ChatInput/choose';
import cleargamename from './Interactions/ApplicationCommand/ChatInput/cleargamename';
import credits from './Interactions/ApplicationCommand/ChatInput/credits';
import dropid from './Interactions/ApplicationCommand/ChatInput/dropid';
import gameinfo from './Interactions/ApplicationCommand/ChatInput/gameinfo';
import gamejson from './Interactions/ApplicationCommand/ChatInput/gamejson';
import myturn from './Interactions/ApplicationCommand/ChatInput/myturn';
import newgame from './Interactions/ApplicationCommand/ChatInput/newgame';
import notifications from './Interactions/ApplicationCommand/ChatInput/notifications';
import ping from './Interactions/ApplicationCommand/ChatInput/ping';
import poll from './Interactions/ApplicationCommand/ChatInput/poll';
import profile from './Interactions/ApplicationCommand/ChatInput/profile';
import recentgames from './Interactions/ApplicationCommand/ChatInput/recentgames';
import removeid from './Interactions/ApplicationCommand/ChatInput/removeid';
import scramble from './Interactions/ApplicationCommand/ChatInput/scramble';
import send from './Interactions/ApplicationCommand/ChatInput/send';
import setgamename from './Interactions/ApplicationCommand/ChatInput/setgamename';
import votekick from './Interactions/ApplicationCommand/ChatInput/votekick';
import userAvatar from './Interactions/ApplicationCommand/User/avatar';

// Import statements for InteractionResponses
import gameIdSuggestion from './Interactions/Autocomplete/gameIdSuggestion';
import notificationsComponent from './Interactions/MessageComponent/notifications';
import votepoll from './Interactions/MessageComponent/votepoll';
import pollModalSubmit from './Interactions/ModalSubmit/poll';

// Exporting ApplicationCommandResponses
export const ApplicationCommandResponses = {
  [ApplicationCommandType.ChatInput]: [
    addid,
    avatar,
    choose,
    credits,
    gameinfo,
    gamejson,
    newgame,
    notifications,
    ping,
    poll,
    profile,
    removeid,
    scramble,
    send,
    setgamename,
    cleargamename,
    myturn,
    recentgames,
    dropid,
    votekick,
  ],
  [ApplicationCommandType.User]: [userAvatar],
  [ApplicationCommandType.Message]: [],
};

// Exporting InteractionResponses
export const InteractionResponses = {
  [InteractionType.MessageComponent]: [notificationsComponent, votepoll],
  [InteractionType.ApplicationCommandAutocomplete]: [gameIdSuggestion],
  [InteractionType.ModalSubmit]: [pollModalSubmit],
};
