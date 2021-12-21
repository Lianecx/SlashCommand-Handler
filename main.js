console.log('Loading...');

//config.json format: 
//{
//    "token":"BOT-TOKEN",
//    "clientId": "BOT-CLIENT-ID",
//	  "guildId": "GUILD ID",
//    "roleIds": {
//        "ROLENAME": ROLEID,
//        "2ndROLENAME", 2ndROLEID
//        etc...
//    },
//}
//Must be in same folder as main.js
const { token } = require('./config.json');
const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILDS] });
const helpCommand = require('./help');

//Create client.commands Collection
client.commands = new Discord.Collection();
//Read ./commands and filter all nonJs files
const commandFolders = fs.readdirSync('./commands');
for(const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        //Require all commandFiles
        const command = require(`./commands/${folder}/${file}`);
        //Set all commandFiles in ./commands in client.commands collection
        client.commands.set(command.name, command);
    }
}


client.once('ready', () => {
    console.log(`Bot logged in as ${client.user.tag}\nBot on ${client.guilds.cache.size} servers.`);
    client.user.setActivity('over this guild.', { type: "WATCHING" });
});

client.on("guildCreate", guild => {
    console.log(`Joined a new guild: ${guild.name}: ${guild.memberCount} members.\nBot is now on ${client.guilds.cache.size} servers!`);
});

client.on("guildDelete", guild => {
    console.log(`Left a guild: ${guild.name}\nBot is now on ${client.guilds.cache.size} servers!`);
});

client.on('messageCreate', message => {

});


client.on('interactionCreate', async interaction => {
    console.log(interaction)

    if(interaction.isAutocomplete() && interaction.commandName === 'help') helpCommand.autocomplete(client, interaction);

    if(!interaction.isCommand()) return;

    //args array for easier command use
    //args are like args from messageCreate (They include the group and subcommand if one set)
    const args = [];
    if(interaction.options._group) args.push(interaction.options._group);
    if(interaction.options._subcommand) args.push(interaction.options._subcommand);
    interaction.options._hoistedOptions.forEach(option => {
        if(option.value) args.push(option.value);
    });

    //Help command
    if (interaction.commandName === 'help') {
        await interaction.deferReply();

        helpCommand.execute(client, interaction, args);
    } else {
        //Other Commands
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        command.execute(interaction, args);
    }
})

client.login(token);