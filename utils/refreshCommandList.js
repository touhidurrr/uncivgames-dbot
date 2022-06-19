const { parsed } = require('dotenv').config();
Object.keys(parsed).forEach(key => {
  global[key] = parsed[key];
});

const isEqual = require('lodash.isequal');
const { ApplicationCommandResponses } = require('../src/responsesList.js');

var globalCommands = [];
var guildCommands = {};
Object.keys(ApplicationCommandResponses).forEach(type => {
  ApplicationCommandResponses[type].forEach(entry => {
    if (!entry.guildId) globalCommands.push(parseCommand(entry, type));
    else {
      if (!guildCommands.hasOwnProperty(entry.guildId)) {
        guildCommands[entry.guildId] = [];
      }
      guildCommands[entry.guildId].push(parseCommand(entry, type));
    }
  });
});

const discordApiEndpoint = 'https://discord.com/api/v10';

const discord = require('axios').create({
  baseURL: discordApiEndpoint,
  headers: {
    authorization: `Bot ${DISCORD_TOKEN}`,
  },
});

function logAxiosError(err) {
  if (err.response) {
    const { status, headers, data } = err.response;
    console.dir({ status, headers, data }, { depth: null });
  }
  process.exit(0);
}

function parseCommand(cmd, type) {
  let command = {
    name: cmd.name,
    type: ~~(cmd.type || type),
  };
  if (cmd.options) {
    command.options = cmd.options.map(o => {
      o.required = !o.required ? false : true;
      return o;
    });
  }
  if (!cmd.description) {
    if (command.type === 1) command.description = '';
  } else command.description = cmd.description;
  if (cmd.default_permission === false) command.permissions = false;
  if (cmd.dm_permission) command.dm_permission = cmd.dm_permission;
  if (cmd.default_member_permissions)
    command.default_member_permissions = cmd.default_member_permissions;
  return command;
}

async function updateCommands(config) {
  const { path, indentifier, commandsList } = config;
  console.dir(`fetching ${indentifier} ...`);
  const commands = (await discord.get(path).catch(logAxiosError)).data.map(cmd => {
    console.log('  ', { id: cmd.id, name: cmd.name, type: cmd.type });
    return parseCommand(cmd);
  });
  console.dir(`found ${commands.length} commands.`);
  if (commands.length !== commandsList.length) {
    console.dir('mismatch found !');
    await discord.put(path, commandsList).catch(logAxiosError);
    console.dir('commands information updated !');
    return;
  }
  for (const ac of commandsList) {
    c = commands.find(cmd => ac.name === cmd.name && ac.type === cmd.type);
    if (!isEqual(c, ac)) {
      console.dir('mismatch found !', c, ac);
      await discord.put(path, commandsList).catch(logAxiosError);
      console.dir('commands information updated !');
      break;
    }
  }
}

(async () => {
  await updateCommands({
    path: `/applications/${APPLICATION_ID}/commands`,
    indentifier: 'global commands',
    commandsList: globalCommands,
  });
  for (const guildId of Object.keys(guildCommands)) {
    const name = await discord
      .get(`/guilds/${guildId}`)
      .then(res => res.data.name)
      .catch(logAxiosError);
    await updateCommands({
      path: `/applications/${APPLICATION_ID}/guilds/${guildId}/commands`,
      indentifier: `guild commands for ${name}`,
      commandsList: guildCommands[guildId],
    });
  }
})();
