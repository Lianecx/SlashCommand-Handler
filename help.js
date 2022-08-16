const Discord = require('discord.js');

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
    //Will deferReply the interaction
    defer: true,
    //Will get role ids from config.json.
    data: new Discord.SlashCommandBuilder()
        .setName('help')
        .setDescription('Detailed description of every command.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('The command you want to get help for.')
                .setRequired(false)
        ),
    execute,
};