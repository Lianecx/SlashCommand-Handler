const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

function execute(interaction) {
    interaction.reply('Pong!');
}

//If exported, will be called for autocompletion of options
function autocomplete(interaction) {
    interaction.respond([{
        name: 'Choice 1',
        value: 'choice1',
    }]);
}

module.exports = {
    name: 'ping',
    usage: 'ping',
    example: 'ping',
    description: 'Ping! Pong!',
    //Will get role ids from config.json.
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping! Pong!')
        //Set command permissions
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers),
    execute,
    //autocomplete,
};