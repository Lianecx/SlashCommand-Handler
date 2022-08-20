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
const { token, clientId, guildId } = require('./config.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const rest = new REST({ version: '10' }).setToken(token);

let deployGuild = false;
let deployGlobal = false;
let deleteGuild = false;
let deleteGlobal = false;

const argv = yargs(hideBin(process.argv))
    .command(['deploy [location]', 'dep'], 'Deploys the slash commands in the specified location.')
    .command(['delete [location]', 'del'], 'Deletes the slash commands from the specified location.')
    .option('location', {
        description: 'The location to deploy the commands to. Valid locations are: guild, global, all. If no location is specified, the commands will be deployed globally.',
        type: 'string',
        choices: ['guild', 'global', 'all'],
        default: 'global',
        global: true,
        alias: ['loc', 'l'],
    })
    .strict()
    .demandCommand(1)
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
commands.push(require('./help.js').data.toJSON());

//Push all other SlashCommandBuilders (in JSON) to commands array
for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    console.log(`Loaded ${command.name}`);
    commands.push(command?.data.toJSON());
}

(async () => {
    try {
        if(deployGuild) {
            console.log('Started deploying application guild (/) commands.');
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands },
            );
        }
        if(deployGlobal) {
            console.log('Started deploying application global (/) commands.');
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );
        }

        if(deleteGuild) {
            console.log('Started deleting application guild (/) commands.');
            const resp = await rest.get(Routes.applicationGuildCommands(clientId, guildId));

            for(const command of resp) {
                await rest.delete(Routes.applicationGuildCommand(clientId, guildId, command.id));
            }
        }
        if(deleteGlobal) {
            console.log('Started deleting application global (/) commands.');
            const resp = await rest.get(Routes.applicationCommands(clientId));

            for(const command of resp) {
                await rest.delete(Routes.applicationCommand(clientId, command.id));
            }
        }

        console.log('Successfully refreshed application (/) commands.');
    }
    catch(err) {
        console.log('Could not refresh application (/) commands.', err);
    }
})();