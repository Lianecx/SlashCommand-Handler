import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

function execute(interaction) {
    interaction.editReply('Pong!');
}

//If exported, will be called for autocompletion of options
function autocomplete(interaction) {
    interaction.respond([{
        name: 'Choice 1',
        value: 'choice1',
    }]);
}

export default {
    name: 'ping',
    usage: 'ping',
    example: 'ping',
    description: 'Ping! Pong!',
    //Will deferReply the interaction
    defer: true,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Ping! Pong!')
        //Set command permissions
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers),
    execute,
    //autocomplete,
};