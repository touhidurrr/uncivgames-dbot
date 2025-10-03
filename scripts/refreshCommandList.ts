import { REST } from '@discordjs/rest';
import { ApplicationCommandResponses } from '@src/responsesList';
import {
  APIApplicationCommand,
  ApplicationCommandType,
  ApplicationIntegrationType,
  InteractionContextType,
  Routes,
} from 'discord-api-types/v10';

const discord = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

const defaultContexts = Object.values(InteractionContextType).filter(
  v => typeof v !== 'string'
);

const defaultIntegrationTypes = Object.values(
  ApplicationIntegrationType
).filter(v => typeof v !== 'string');

const parseCommand = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cmd: any,
  type: ApplicationCommandType = ApplicationCommandType.ChatInput
) => {
  const command: Partial<APIApplicationCommand> = {
    name: cmd.name,
    type: ~~(cmd.type || type),
    contexts: defaultContexts,
    integration_types: defaultIntegrationTypes,
  };
  if (cmd.description) command.description = cmd.description;
  if (cmd.options) command.options = cmd.options;
  return command;
};

const allCommands: Partial<APIApplicationCommand>[] = Object.entries(
  ApplicationCommandResponses
).reduce((acc, [type, entries]) => {
  const cType: ApplicationCommandType = parseInt(type);
  entries.forEach(entry => {
    acc.push(parseCommand(entry, cType));
  });
  return acc;
}, []);

const updateCommands = () => {
  return discord
    .put(Routes.applicationCommands(process.env.APPLICATION_ID), {
      body: allCommands,
    })
    .then(res => Bun.write('.response.yml', Bun.YAML.stringify(res)));
};

(async () => {
  await updateCommands();
})();
