console.log('Loading...');

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
import Discord from 'discord.js';
import fs from 'fs';
import helpCommand from './help.js';
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.Guilds] });

//Create client.commands Collection
client.commands = new Discord.Collection();
//Read ./commands and filter all nonJs files
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles) {
    //Require all commandFiles
    const { default: command } = await import(`./commands/${file}`);
    //Set all commandFiles in ./commands in client.commands collection
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}\nBot on ${client.guilds.cache.size} server.`);
    client.user.setActivity({ name: 'to /help', type: Discord.ActivityType.Listening });
});

client.on('guildCreate', guild => {
    console.log(`Joined a new guild: ${guild.name}: ${guild.memberCount} members.\nBot is now on ${client.guilds.cache.size} server!`);
});

client.on('guildDelete', guild => {
    console.log(`Left a guild: ${guild.name}\nBot is now on ${client.guilds.cache.size} server!`);
});


client.on('interactionCreate', async interaction => {
    if(interaction.isCommand()) {
        console.log(`${interaction.user.tag} executed /${interaction.commandName} ${getArgs(interaction)}`);

        //Help command
        if(interaction.commandName === 'help') helpCommand.execute(interaction);
        else {
            //Other Commands
            const command = client.commands.get(interaction.commandName);
            if(!command) return;

            if(command.defer) await interaction.deferReply();
            command?.execute?.(interaction);
        }
    }
    else if(interaction.isAutocomplete()) {
        if(interaction.commandName === 'help') helpCommand.autocomplete(interaction);
        else {
            const command = client.commands.get(interaction.commandName);
            if(!command) return;

            command?.autocomplete?.(interaction);
        }
    }
});

//Gets a string of passed arguments from a command interaction
function getArgs(interaction) {
    const args = [];

    function addArgs(option) {
        if(option.type === Discord.ApplicationCommandOptionType.SubcommandGroup || option.type === Discord.ApplicationCommandOptionType.Subcommand) {
            args.push(option.name);
            option.options.forEach(opt => addArgs(opt));
        }
        else args.push(option.channel?.name ?? option.user?.tag ?? option.role?.name ?? option.attachment?.name ?? option.value);
    }

    interaction.options.data.forEach(option => addArgs(option));

    return args.join(' ');
}

client.login(data.token);
