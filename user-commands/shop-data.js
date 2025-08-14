
const { EmbedBuilder } = require('discord.js');

function randomColor() {
    return Math.floor(Math.random() * 0xFFFFFF);
}

module.exports = {
    name: 'shop-data',
    description: 'عرض معلومات متجر',
    async execute(interaction, db, config) {
        const shopData = await db.get(`shop_${interaction.channel.id}`);

        if (!shopData) {
            return interaction.reply({ content: `**هذا الشات ليس متجراً**`, ephemeral: true });
        }

        const { every, here, shop, owner, type, date, warns, status } = shopData;
        const statusText = status === "1" ? "مـفـعـل" : "مـعـطـل";

        const embed = new EmbedBuilder()
            .setTitle(`**مـعـلـومـات مـتـجـر : ${interaction.channel.name}**`)
            .setDescription(`**__ - المـنـشـنـات :__\n\`•\` everyone: ${every}\n\`•\` here: ${here}`)
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .addFields(
                { name: 'صـاحب المتـجـر', value: `<@${owner}>`, inline: true },
                { name: 'نـوع المـتـجـر', value: `<@&${type}>`, inline: true },
                { name: 'تـحـذيـرات المـتـجـر', value: `${warns || 0}`, inline: true },
                { name: 'حـالـه الـمـتـجـر', value: statusText, inline: true },
                { name: 'مـوعـد انـشـاء المـتـجـر', value: `${date}`, inline: true }
            )
            .setThumbnail(interaction.guild.iconURL())
            .setImage(config.line)
            .setColor(randomColor())
            .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await interaction.reply({ content: `مـعـلـومـات مـتـجـر : ${interaction.channel}`, embeds: [embed] });
    }
};
