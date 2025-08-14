
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function randomColor() {
    return Math.floor(Math.random() * 0xFFFFFF);
}

module.exports = {
    name: 'mentions',
    description: 'عرض منشنات المتجر',
    async execute(interaction, db, config) {
        const shopData = await db.get(`shop_${interaction.channel.id}`);

        if (!shopData) {
            return interaction.reply({ content: 'هذا الشات ليس متجراً!', ephemeral: true });
        }

        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('buy_mentions')
                    .setLabel('شراء منشنات')
                    .setStyle(ButtonStyle.Primary)
            );

        const embed = new EmbedBuilder()
            .setTitle('📊 المنشنات المتبقية')
            .setDescription(`**المنشنات المتبقية:**\n• everyone: ${shopData.every || 0}\n• here: ${shopData.here || 0}\n• shop: ${shopData.shop || 0}`)
            .setColor(randomColor())
            .setThumbnail(interaction.guild.iconURL())
            .setImage(config.line)
            .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            components: [button]
        });
    }
};
