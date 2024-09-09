const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const supportServerInvite = 'https://discord.gg/YhkyGV4Qd7';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Provides help information and support server link'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x00FFFF)
            .setTitle('Support')
            .setDescription('Join the support server and open a support ticket.');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Join Support Server')
                    .setStyle(ButtonStyle.Link)
                    .setURL(supportServerInvite)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};
