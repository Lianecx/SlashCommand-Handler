const Discord = require('discord.js');

/*module.exports = {
    autocomplete(client, interaction) {
        const focused = interaction.options.getFocused().toLowerCase();

        const commands = [];
        const respondArray = [];

        const commandFolders = fs.readdirSync('./commands/');
        for (const folder of commandFolders) {
            //TODO Delete the following line if you dont want the categories included in the autocomplete respond
            commands.push(folder);

            const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const command = require(`./commands/${folder}/${file}`);
                commands.push(command.name);
            }
        }

        const matchingCommands = commands.filter(command => command.toLowerCase().includes(focused));
        if(matchingCommands.length >= 25) matchingCommands.length = 25;

        matchingCommands.forEach(command => {
            respondArray.push({
                name: command,
                value: command,
            });
        });

        interaction.respond(respondArray);
    },
    execute(client, interaction, args) {
        const helpEmbed = new Discord.MessageEmbed()
            .setTitle('Help Menu')
            .setAuthor(client.user.username, client.user.displayAvatarURL({ format: 'png' }))
            .setColor('DARK_BUT_NOT_BLACK');

        if(!args[0]) {
            //TODO Please adjust the fields for each category manually to your likings
            helpEmbed.addField("Main", "Main Commands")
            //.addField("Moderation", "Moderation Commands")
            //...

            interaction.editReply({ embeds: [helpEmbed], allowedMentions: { repliedUser: false } });
        } else {
            let command = client.commands.get(args[0]) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));
            if (command) {
                //client.commands.forEach(command => helpEmbed.addField(command.name.toUpperCase(), command.description, true));

                const helpEmbed = new Discord.MessageEmbed()
                    .setTitle('Help Menu')
                    .setAuthor(client.user.username, client.user.displayAvatarURL({ format: 'png', dynamic: false }))
                    .setColor('DARK_BUT_NOT_BLACK')
                    .addField(command.name.toUpperCase(), command.description);

                if(command.usage) helpEmbed.addField('\n**USAGE**', command.usage);
                if(command.example) helpEmbed.addField('\n**EXAMPLE**', command.example);

                interaction.editReply({ embeds: [helpEmbed], allowedMentions: { repliedUser: false } });
            } else {
                fs.readdir(`./commands/${args[0]}`, (err, commands) => {
                    if(err) {
                        console.log(`${interaction.member.user.tag} executed non-existent help command/category ${args[0]} in ${interaction.guild.id}`);
                        interaction.editReply(`:warning: That command/category [**${args[0]}**] doesnt exist.`);
                        return;
                    }

                    commands = commands.filter(file => file.endsWith('.js'));
                    commands.forEach(commandFile => {
                        commandFile = commandFile.split('.').shift();
                        command = require(`./commands/${args[0]}/${commandFile}`);
                        helpEmbed.addField(command.name.toUpperCase(), command.description);
                    });
                    interaction.editReply({ embeds: [helpEmbed] });
                });
            }
        }
    }
}*/

function autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();

    const matchingCommands = interaction.client.commands.filter(command => command.name.toLowerCase().includes(focused));
    if(matchingCommands.length >= 25) matchingCommands.length = 25;

    interaction.respond(matchingCommands.map(command => {
        return {
            name: command.name,
            value: command.name,
        }
    }));
}

function execute(interaction) {
    const commandName = interaction.options.getString('command');

    const helpEmbed = new Discord.EmbedBuilder()
        .setTitle('Help Menu')
        .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', forceStatic: true }) })
        .setColor(Discord.Colors.DarkButNotBlack);

    if(!commandName) {
        //Add field for every command
        interaction.client.commands.forEach(command => helpEmbed.addFields({ name: command.name.toUpperCase(), value: command.description, inline: true }));
    } else {
        const command = interaction.client.commands.get(commandName);
        if(!command) {
            interaction.reply(`:warning: The command: **${commandName}** doesnt exist.`);
            return;
        }

        helpEmbed.addFields({ name: command.name.toUpperCase(), value: command.description });
        if(command.usage) helpEmbed.addFields({ name: 'Usage', value: command.usage });
        if(command.example) helpEmbed.addFields({ name: 'Example', value: command.example });
    }

    interaction.reply({ embeds: [helpEmbed] });
}

module.exports = {
    name: 'help',
    usage: 'help [command]',
    example: 'help ping',
    description: 'Detailed description of every command.',
    data: new Discord.SlashCommandBuilder()
        .setName('help')
        .setDescription('Detailed description of every command.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command you want to get help for.')
                .setRequired(false)
                .setAutocomplete(true)
        ),
    execute,
    autocomplete,
};