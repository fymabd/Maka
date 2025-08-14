
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'delete-shop',
    description: 'حذف متجر',
    async execute(interaction, db, config, client) {
        await interaction.deferReply();
        const shop = interaction.options.getChannel('shop');
        const reason = interaction.options.getString('reason');

        const data = await db.get(`shop_${shop.id}`);
        if (!data) {
            return interaction.editReply('**هـذا الـروم لـيـس مـتـجـر**');
        }

        const hohoho = await interaction.guild.channels.fetch(shop.id);
        if (!hohoho) {
            return interaction.editReply('**لا أسـتـطـيـع الـعـثـور عـلـي هـذا الـروم **');
        }

        const userrr = await client.users.fetch(data.owner);
        const dmChannel = await userrr.createDM();

        const emm = new EmbedBuilder()
            .setTitle(`تـم حـذف مـتـجـرك`)
            .setDescription(`تـم حـذف مـتـجـرك ${hohoho.name}`)
            .addFields(
                { name: 'أسـم الـمـتـجـر', value: `${hohoho.name}`, inline: true },
                { name: 'الـمـسـؤول', value: `<@${interaction.user.id}>`, inline: true },
                { name: 'الـسـبـب', value: reason, inline: true }
            )
            .setThumbnail(interaction.guild.iconURL())
            .setImage(config.line)
            .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await dmChannel.send({ embeds: [emm] });
        await hohoho.delete();
        await db.delete(`shop_${shop.id}`);
        await interaction.editReply('**تـم حـذف الـروم بـنـجـاح**');
    }
};
