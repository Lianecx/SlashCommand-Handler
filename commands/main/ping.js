const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'ping',
    usage: 'ping',
    example: 'ping',
    description: 'Ping! Pong!',
    //Will get role ids from config.json. 
    permissions: ['Moderator', 'Admin'],
    //SlashCommandBuilder => https://discordjs.guide/interactions/registering-slash-commands.html#options
    data: new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Ping! Pong!')
            .setDefaultPermission(false),
    execute(interaction, args) {
        //interaction properties equal to message properties except message.mentions and message.attachments dont exist.
        //interaction.reply to answer commands.
        //This to reply without ping => interaction.reply({ content: 'some message', allowedMentions: { repliedUser: false } });
        interaction.reply('Pong!');
    }
}