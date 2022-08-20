//config.json format: 
//{
//    "token":"BOT-TOKEN",
//    "clientId": "BOT-CLIENT-ID",
//	  "guildId": "GUILD ID",
//    "roles": {
//        "ROLENAME": ROLEID,
//        "2ndROLENAME", 2ndROLEID
//        etc...
//    },
//}
//Must be in same folder as main.js
import data from './config.json' assert { type: 'json' };
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import fs from 'fs';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import helpCommand from './help.js';

let deployGuild = false;
let deployGlobal = false;
let deleteGuild = false;
let deleteGlobal = false;

const argv = yargs(hideBin(process.argv))
    .command(['deploy [location]', 'dep'], 'Deploys the slash commands in the specified location.')
    .command(['delete', 'del'], 'Deletes the slash commands from the specified location.')
    .option('location', {
        description: 'The location to deploy the commands to. Valid locations are: guild, global, all. If no location is specified, the commands will be deployed globally.',
        type: 'string',
        choices: ['guild', 'global', 'all'],
        default: 'global',
        global: true,
        alias: ['loc', 'l'],
    })
    .strict()
    .help()
    .argv;

if(argv._.includes('deploy') || argv._.includes('dep')) {
    deployGuild = argv.location.includes('guild') || argv.location.includes('all');
    deployGlobal = argv.location.includes('global') || argv.location.includes('all');
}
if(argv._.includes('delete') || argv._.includes('del')) {
    deleteGuild = argv.location.includes('guild') || argv.location.includes('all');
    deleteGlobal = argv.location.includes('global') || argv.location.includes('all');
}

const commandFiles = fs.readdirSync('./commands/')
    .filter(file => file.endsWith('.js'));

const commands = [];

//Push help command to commands array
commands.push(helpCommand.data.toJSON());

//Push all other SlashCommandBuilders (in JSON) to commands array
for(const file of commandFiles) {
    const { default: command } = await import(`./commands/${file}`);
    commands.push(command?.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(data.token);

try {
    if(deployGuild) {
        console.log('Started deploying application guild (/) commands.');
        await rest.put(
            Routes.applicationGuildCommands(data.clientId, data.guildId),
            { body: commands },
        );
    }
    if(deployGlobal) {
        console.log('Started deploying application global (/) commands.');
        await rest.put(
            Routes.applicationCommands(data.clientId),
            { body: commands },
        );
    }

    if(deleteGuild) {
        console.log('Started deleting application guild (/) commands.');
        const resp = await rest.get(Routes.applicationGuildCommands(data.clientId, data.guildId));

        for(const command of resp) {
            await rest.delete(Routes.applicationGuildCommand(data.clientId, data.guildId, command.id));
        }
    }
    if(deleteGlobal) {
        console.log('Started deleting application global (/) commands.');
        const resp = await rest.get(Routes.applicationCommands(data.clientId));

        for(const command of resp) {
            await rest.delete(Routes.applicationCommand(data.clientId, command.id));
        }
    }

    console.log('Successfully refreshed application (/) commands.');
}
catch(err) {
    console.log('Could not refresh application (/) commands.', err);
}
