const Discord = require('discord.js');
const fs = require('fs');

function autocomplete(interaction) {
    const focused = interaction.options.getFocused().toLowerCase();

    //Get all commands
    const commands = interaction.client.commands.map(command => command.name);

    //Delete the following lines if you don't want categories included in the autocomplete respond
    const commandFolders = fs.readdirSync('./commands/');
    for (const folder of commandFolders) {
        commands.push(folder);
    }

    const matchingCommands = commands.filter(command => command.toLowerCase().includes(focused));
    if(matchingCommands.length >= 25) matchingCommands.length = 25;

    interaction.respond(matchingCommands.map(command => {
        return {
            name: command?.name ?? command,
            value: command?.name ?? command,
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
        const commandFolders = fs.readdirSync('./commands/');
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
            const formattedCommands = commandFiles.map(file => `/${file.replace('.js', '')}`);

            helpEmbed.addFields({ name: folder, value: formattedCommands.join(', ') });
        }
    } else {
        let command = interaction.client.commands.get(commandName);
        if(!command) {
            //Check for category
            fs.readdir(`./commands/${commandName}`, (err, commands) => {
                if(err) {
                    interaction.editReply(`:warning: The command/category: **${commandName}** doesn't exist.`);
                    return;
                }

                commands.filter(file => file.endsWith('.js')).forEach(commandFile => {
                    commandFile = commandFile.split('.').shift();
                    command = require(`./commands/${commandName}/${commandFile}`);
                    helpEmbed.addFields({ name: command.name.toUpperCase(), value: command.description });
                });
            });
        } else {
            helpEmbed.addFields({ name: command.name.toUpperCase(), value: command.description });
            if(command.usage) helpEmbed.addFields({ name: 'Usage', value: command.usage });
            if(command.example) helpEmbed.addFields({ name: 'Example', value: command.example });
        }
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