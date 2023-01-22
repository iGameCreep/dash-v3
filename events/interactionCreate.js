const { MessageEmbed } = require('discord.js');
const config = require('../config/config.json');

module.exports = (client, inter) => {
    if (inter.isCommand()) {
        const command = client.commands.get(inter.commandName);

        const guild = inter.guild

        const errEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setDescription('❌ | Error! Please contact Developers!')

        const permEmbed = new MessageEmbed()
        .setColor('#ff0000')
        .setDescription(`❌ | You need do not have the proper permissions to execute this command`)
    
        if (!command) return inter.reply({ embeds: [ errEmbed ], ephemeral: true, }), client.commands.delete(inter.commandName)
    
        if (command.permissions && !inter.member.permissions.has(command.permissions)) return inter.reply({ embeds: [ permEmbed ], ephemeral: true, })
    
        if (command.dev && !config.Admin.includes(inter.member.id)) return inter.reply({ embeds: [ permEmbed ], ephemeral: true, })
    
        command.execute({ inter, client });
    }
};