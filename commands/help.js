
const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

async function sendHelpMessage(channel, config, client) {
    const guild = client.guilds.cache.first();
    const helpMainEmbed = new EmbedBuilder()
        .setTitle('📚 دليل أوامر البوت')
        .setDescription('**مرحباً بك في نظام المساعدة المطور!**\n\nاستخدم القائمة أدناه لاستكشاف أوامر البوت حسب الفئة:')
        .addFields(
            { name: '🛒 أوامر الشراء والتسوق', value: 'أوامر إنشاء وإدارة المتاجر والطلبات', inline: true },
            { name: '⚙️ أوامر الإعدادات والإدارة', value: 'أوامر إدارة البوت والمتاجر المتقدمة', inline: true },
            { name: '👥 أوامر الأعضاء العامة', value: 'الأوامر المتاحة لجميع المستخدمين', inline: true },
            { name: '💰 أسعار الخدمات', value: 'عرض جميع أسعار الخدمات والمنشنات', inline: true }
        )
        .setColor('#0099FF')
        .setImage(config.info)
        .setThumbnail(guild?.iconURL())
        .setFooter({ text: '_d3q', iconURL: guild?.iconURL() })
        .setTimestamp();

    const helpMenu = new StringSelectMenuBuilder()
        .setCustomId('help_select_menu')
        .setPlaceholder('اختر فئة الأوامر التي تريد استكشافها')
        .addOptions([
            {
                label: '🛒 أوامر الشراء والتسوق',
                description: 'أوامر المتاجر، الطلبات، والمزادات',
                value: 'shopping_commands',
                emoji: '🛒'
            },
            {
                label: '⚙️ أوامر الإعدادات والإدارة',
                description: 'أوامر الإدارة والتحكم المتقدم',
                value: 'admin_commands',
                emoji: '⚙️'
            },
            {
                label: '👥 أوامر الأعضاء العامة',
                description: 'الأوامر المتاحة لجميع المستخدمين',
                value: 'public_commands',
                emoji: '👥'
            },
            {
                label: '💰 أسعار الخدمات',
                description: 'عرض جميع أسعار الخدمات والمنشنات',
                value: 'prices_info',
                emoji: '💰'
            }
        ]);

    const row = new ActionRowBuilder().addComponents(helpMenu);

    await channel.send({
        embeds: [helpMainEmbed],
        components: [row]
    });
}

module.exports = {
    name: 'help',
    description: 'عرض جميع أوامر البوت',
    async execute(interaction, db, config, client) {
        await sendHelpMessage(interaction.channel, config, client);
        await interaction.reply({ content: 'تم إرسال دليل الأوامر!', ephemeral: true });
    }
};
