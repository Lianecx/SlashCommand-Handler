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
    console.log('Bot logged in as ' + client.user.tag + '\nBot on ' + client.guilds.cache.size + ' server.');
    client.user.setActivity('over this guild.', {type: "WATCHING"});
})

client.on("guildCreate", guild => {
    console.log("Joined a new guild: " + guild.name + ': ' + guild.memberCount + ' members.\nBot is now on ' + client.guilds.cache.size + ' server!');
})

client.on("guildDelete", guild => {
    console.log("Left a guild: " + guild.name + '\nBot is now on ' + client.guilds.cache.size + ' server!');
})

client.on('messageCreate', message => {

})


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

    //Help command
    if (interaction.commandName === 'help') {
        await interaction.deferReply();

        const helpEmbed = new Discord.MessageEmbed()
        .setTitle('Help Menu')
        .setAuthor(client.user.username, client.user.displayAvatarURL({ format: 'png', dynamic: false }))
        .setColor('DARK_BUT_NOT_BLACK');
        if(!args[0]) {
            //You can adjust the fields for the categorys manually to your likings
            helpEmbed.addField("Main", "Main Commands")
            .addField("Moderation", "Moderation Commands")
            //...
            interaction.editReply({ embeds: [helpEmbed], allowedMentions: { repliedUser: false } });

            //Or use the built-in embed (lame)
            /*fs.readdir('./commands/', (err, cmds) => {
                cmds = cmds.filter(cmd => cmd.endsWith('js'));
                cmds.forEach(cmd => helpEmbed.addField(cmd, cmd + ' commands'));
                interaction.editReply({ embeds: [helpEmbed], allowedMentions: { repliedUser: false } });
            });*/
        } else {
            let command = client.commands.get(args[0]) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));
            if (!command) {
                fs.readdir(`./commands/${args[0]}`, (err, commands) => {
                    if(err) {
                        console.log(interaction.member.user.tag + ' executed non-existent help command/category ' + args[0] + ' in ' + interaction.guild.id);
                        interaction.editReply(':warning: That command/category [**' + args[0] + '**] doesnt exist.');
                        return;
                    }

                    commands.forEach(commandFile => {
                        commandFile = commandFile.split('.').shift();
                        command = client.commands.get(commandFile.split('.').shift());
                        helpEmbed.addField(command.name.toUpperCase(), command.description);
                    });
                    interaction.editReply({ embeds: [helpEmbed] });
                });
            } else {
                //client.commands.forEach(command => helpEmbed.addField(command.name.toUpperCase(), command.description, true));

                const helpEmbed = new Discord.MessageEmbed()
                    .setTitle('Help Menu')
                    .setAuthor(client.user.username, client.user.displayAvatarURL({ format: 'png', dynamic: false }))
                    .setColor('DARK_BUT_NOT_BLACK')
                    .addField(command.name.toUpperCase(), command.description);
                if(command.usage) helpEmbed.addField('\n**USAGE**', command.usage);
                if(command.example) helpEmbed.addField('\n**EXAMPLE**', command.example);

                interaction.editReply({ embeds: [helpEmbed], allowedMentions: { repliedUser: false } });
            }
        }
    } else {

        //Other Commands
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        command.execute(interaction, args);
    }
})

client.login(token);