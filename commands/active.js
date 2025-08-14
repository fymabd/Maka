
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'active',
    description: 'تفعيل متجر',
    async execute(interaction, db, config) {
        await interaction.deferReply({ ephemeral: false });

        const shopi = interaction.options.getChannel('shop') || interaction.channel;
        const shppp = await db.get(`shop_${shopi.id}`);

        if (!shppp) {
            return interaction.editReply('**هـذا الـروم لـيـس مـتـجـر**');
        }

        if (shppp.status === "1") {
            return interaction.editReply('المـتـجـر مـفـعـل بـالـفـعـل');
        }

        await shopi.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            ViewChannel: true,
        });

        await db.set(`shop_${shopi.id}.status`, "1");

        const embedlog = new EmbedBuilder()
            .setTitle(`تـم تـفـعـيـل الـمـتـجـر`)
            .setDescription(`يـرجـي قـرائـه الـقـوانـيـن و الإلـتـزام بـهـا\n\n**المنشنات المتبقية:**\n• everyone: ${shppp.every || 0}\n• here: ${shppp.here || 0}\n• shop: ${shppp.shop || 0}`)
            .setThumbnail(interaction.guild.iconURL())
            .setImage(config.line)
            .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await shopi.send({ embeds: [embedlog], content: `<@${shppp.owner}>` });
        await interaction.editReply('**تـم تـفـعـيـل الـمـتـجـر بـنـجـاح**');
    }
};
