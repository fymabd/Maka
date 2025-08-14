
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'disable',
    description: 'تعطيل متجر',
    async execute(interaction, db, config) {
        await interaction.deferReply({ ephemeral: true });
        const shop = interaction.options.getChannel('shop');
        const reason = interaction.options.getString('reason');

        const datap = await db.get(`shop_${shop.id}`);
        if (!datap) {
            return interaction.editReply('**هـذا الـروم لـيـس مـتـجـر**');
        }

        if (datap.status === "0") {
            return interaction.editReply('**هـذا الـروم مـعـطـل بـالـفـعـل**');
        }

        await shop.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            ViewChannel: false,
        });

        await db.set(`shop_${shop.id}.status`, "0");

        const embedlog = new EmbedBuilder()
            .setTitle(`تـم تـعـطـيـل الـمـتـجـر`)
            .setDescription(`الـمـسـؤول : <@${interaction.user.id}>`)
            .addFields({ name: 'الـسـبـب', value: reason, inline: true })
            .setThumbnail(interaction.guild.iconURL())
            .setImage(config.line)
            .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await shop.send({ content: `<@${datap.owner}>`, embeds: [embedlog] });
        await interaction.editReply('**تـم تـعـطـيـل الـمـتـجـر بـنـجـاح**');
    }
};
