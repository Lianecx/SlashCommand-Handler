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
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILDS] });

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
    console.log('Bot logged in as ' + client.user.tag + '\nBot on ' + client.guilds.cache.size + ' server.');
    client.user.setActivity('over this guild.', {type: "WATCHING"});
});

client.on("guildCreate", guild => {
    console.log("Joined a new guild: " + guild.name + ': ' + guild.memberCount + ' members.\nBot is now on ' + client.guilds.cache.size + ' server!');
});

client.on("guildDelete", guild => {
    console.log("Left a guild: " + guild.name + '\nBot is now on ' + client.guilds.cache.size + ' server!');
});

client.on('messageCreate', message => {

});


client.on('interactionCreate', async interaction => {
    if(!interaction.isCommand()) return;

    //Add args array for easier use
    //args are like args from messageCreate (They include the group and subcommand if one set)
    const args = [];
    if(interaction.options._group) args.push(interaction.options._group);
    if(interaction.options._subcommand) args.push(interaction.options._subcommand);
    interaction.options._hoistedOptions.forEach(option => {
        if(option.value) args.push(option.value);
    });

    //interaction.reply = interaction.editReply
    interaction.reply = function (content) {
        return interaction.editReply(content);
    };
    interaction.channel.send = function (content) {
        if (typeof content !== 'string') interaction.editReply(content);
        else interaction.editReply({ content: content, allowedMentions: { repliedUser: false } });
    };

    //Help command
    if (interaction.commandName === 'help') {
        await interaction.deferReply();

        if(!args[0]) {
            console.log(interaction.user.tag + ' executed /help in ' + interaction.guild.name);

            const helpEmbed = new Discord.MessageEmbed()
                .setTitle('Help Menu')
                .setAuthor(client.user.username, client.user.displayAvatarURL({ format: 'png', dynamic: false }))
                .setColor('DARK_BUT_NOT_BLACK');

                client.commands.forEach(command => helpEmbed.addField(command.name.toUpperCase(), command.description, true));

            interaction.reply({ embeds: [helpEmbed], allowedMentions: { repliedUser: false } });
        } else {
            console.log(`${interaction.user.tag} executed /help ${args[0]} in ${interaction.guild.name}`);

            const helpCommand = client.commands.get(args[0]);
            if(!helpCommand) {
                interaction.reply(`:warning: That command [**${args[0]}**] doesnt exist.`);
                return;
            }

            const helpEmbed = new Discord.MessageEmbed()
                .setTitle('Help Menu')
                .setAuthor(client.user.username, client.user.displayAvatarURL({ format: 'png', dynamic: false }))
                .setColor('DARK_BUT_NOT_BLACK')
                .addField(helpCommand.name.toUpperCase(), helpCommand.description);
            if(helpCommand.usage) helpEmbed.addField('\n**USAGE**', helpCommand.usage);
            if(helpCommand.example) helpEmbed.addField('\n**EXAMPLE**', helpCommand.example);

            interaction.reply({ embeds: [helpEmbed], allowedMentions: { repliedUser: false } });
        }
    } else {

        //Other Commands
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        await interaction.deferReply();

        command.execute(interaction, args);
    }
});

client.login(token);