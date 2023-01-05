module.exports = class Permissions {
  static CREATE_INSTANT_INVITE = 1n << 0n;
  static KICK_MEMBERS = 1n << 1n;
  static BAN_MEMBERS = 1n << 2n;
  static ADMINISTRATOR = 1n << 3n;
  static MANAGE_CHANNELS = 1n << 4n;
  static MANAGE_GUILD = 1n << 5n;
  static ADD_REACTIONS = 1n << 6n;
  static VIEW_AUDIT_LOG = 1n << 7n;
  static PRIORITY_SPEAKER = 1n << 8n;
  static STREAM = 1n << 9n;
  static VIEW_CHANNEL = 1n << 10n;
  static SEND_MESSAGES = 1n << 11n;
  static SEND_TTS_MESSAGES = 1n << 12n;
  static MANAGE_MESSAGES = 1n << 13n;
  static EMBED_LINKS = 1n << 14n;
  static ATTACH_FILES = 1n << 15n;
  static READ_MESSAGE_HISTORY = 1n << 16n;
  static MENTION_EVERYONE = 1n << 17n;
  static USE_EXTERNAL_EMOJIS = 1n << 18n;
  static VIEW_GUILD_INSIGHTS = 1n << 19n;
  static CONNECT = 1n << 20n;
  static SPEAK = 1n << 21n;
  static MUTE_MEMBERS = 1n << 22n;
  static DEAFEN_MEMBERS = 1n << 23n;
  static MOVE_MEMBERS = 1n << 24n;
  static USE_VAD = 1n << 25n;
  static CHANGE_NICKNAME = 1n << 26n;
  static MANAGE_NICKNAMES = 1n << 27n;
  static MANAGE_ROLES = 1n << 28n;
  static MANAGE_WEBHOOKS = 1n << 29n;
  static MANAGE_EMOJIS_AND_STICKERS = 1n << 30n;
  static USE_APPLICATION_COMMANDS = 1n << 31n;
  static REQUEST_TO_SPEAK = 1n << 32n;
  static MANAGE_EVENTS = 1n << 33n;
  static MANAGE_THREADS = 1n << 34n;
  static CREATE_PUBLIC_THREADS = 1n << 35n;
  static CREATE_PRIVATE_THREADS = 1n << 36n;
  static USE_EXTERNAL_STICKERS = 1n << 37n;
  static SEND_MESSAGES_IN_THREADS = 1n << 38n;
  static USE_EMBEDDED_ACTIVITIES = 1n << 39n;
  static MODERATE_MEMBERS = 1n << 40n;
  constructor(...permissions) {
    this.permissions = 0n;
    for (const p of permissions) this.permissions |= BigInt(p);
  }
  add(...permissions) {
    for (const p of permissions) this.permissions |= BigInt(p);
  }
  remove(...permissions) {
    for (const p of permissions) this.permissions &= ~BigInt(p);
  }
  has(...permissions) {
    for (const p of permissions) {
      if (!(this.permissions & BigInt(p))) return false;
    }
    return true;
  }
};
