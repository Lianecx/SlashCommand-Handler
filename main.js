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
const { token } = require('./config.json');
const Discord = require('discord.js');
const fs = require('fs');
const helpCommand = require('./help');
const client = new Discord.Client({ intents: [Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.Guilds] });

//Create client.commands Collection
client.commands = new Discord.Collection();
//Read ./commands and filter all nonJs files
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    //Require all commandFiles
    const command = require(`./commands/${file}`);
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
        //Help command
        if (interaction.commandName === 'help') helpCommand.execute(interaction);
        else {
            //Other Commands
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            if(command.defer) await interaction.deferReply();
            command?.execute?.(interaction);
        }
    }
    else if(interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        command?.autocomplete?.(interaction);
    }
});

client.login(token);