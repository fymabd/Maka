
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function randomColor() {
    return Math.floor(Math.random() * 0xFFFFFF);
}

module.exports = {
    name: 'warns',
    description: 'عرض تحذيرات متجر',
    async execute(interaction, db, config) {
        const shopData = await db.get(`shop_${interaction.channel.id}`);

        if (!shopData) {
            return interaction.reply({
                content: `**هذا الشات ليس متجراً مسجلاً في قاعدة البيانات**\n\n**لإصلاح هذه المشكلة:**\n1. استخدم الأمر \`/data\` لإضافة بيانات المتجر يدوياً\n2. أو استخدم \`/fix-bot\` لإصلاح مشاكل البوت عموماً`,
                ephemeral: true
            });
        }

        const currentWarns = shopData.warns || 0;
        const shopPartners = shopData.partners || [];
        const isOwner = interaction.user.id === shopData.owner;
        const isHelper = shopPartners.includes(interaction.user.id);
        const isAdmin = interaction.member.roles.cache.has(config.Admin);

        // تحديد مستوى الخطر
        let dangerLevel = '';
        let dangerColor = '';
        let dangerEmoji = '';

        if (currentWarns >= 7) {
            dangerLevel = 'خطر شديد - سيتم الحذف';
            dangerColor = '#8B0000';
            dangerEmoji = '💀';
        } else if (currentWarns >= 5) {
            dangerLevel = 'خطر عالي - المتجر معطل';
            dangerColor = '#FF0000';
            dangerEmoji = '🚨';
        } else if (currentWarns >= 3) {
            dangerLevel = 'تحذير متوسط';
            dangerColor = '#FFA500';
            dangerEmoji = '⚠️';
        } else if (currentWarns >= 1) {
            dangerLevel = 'تحذير بسيط';
            dangerColor = '#FFFF00';
            dangerEmoji = '📢';
        } else {
            dangerLevel = 'لا توجد تحذيرات';
            dangerColor = '#00FF00';
            dangerEmoji = '✅';
        }

        // حساب التكلفة لإزالة جميع التحذيرات
        const totalRemovalCost = currentWarns * (config.removeWarningPrice || 2);
        const totalRemovalTax = Math.floor(totalRemovalCost * 20 / 19 + 1);

        const embed = new EmbedBuilder()
            .setTitle(`${dangerEmoji} تحذيرات المتجر - ${dangerLevel}`)
            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setDescription(`**معلومات مفصلة عن تحذيرات المتجر:**`)
            .addFields(
                { name: 'عدد التحذيرات الحالية:', value: `${currentWarns}/7`, inline: true },
                { name: 'صاحب المتجر:', value: `<@${shopData.owner}>`, inline: true },
                { name: 'حالة المتجر:', value: shopData.status === "1" ? "مفعل ✅" : "معطل ❌", inline: true },
                { name: 'مستوى الخطر:', value: `${dangerEmoji} ${dangerLevel}`, inline: true },
                { name: 'تاريخ الإنشاء:', value: shopData.date || 'غير محدد', inline: true },
                { name: 'نوع المتجر:', value: `<@&${shopData.type}>`, inline: true }
            )
            .setColor(dangerColor)
            .setThumbnail(interaction.guild.iconURL())
            .setImage(config.line)
            .setFooter(
                {
                    text: `Dev By: ibro & yzn | سعر إزالة التحذير: ${config.removeWarningPrice || 2} كرديت لكل تحذير`,
                    iconURL: interaction.guild.iconURL()
                }
            )
            .setTimestamp();

        // إضافة معلومات التكلفة إذا كان هناك تحذيرات
        if (currentWarns > 0) {
            embed.addFields({
                name: '💰 تكلفة إزالة التحذيرات:',
                value: `• تحذير واحد: ${config.removeWarningPrice || 2} كرديت\n` +
                       `• جميع التحذيرات (${currentWarns}): ${totalRemovalCost} كرديت\n` +
                       `• المبلغ مع الضريبة: ${totalRemovalTax} كرديت`,
                inline: false
            });
        }

        // إضافة تفاصيل عن عواقب التحذيرات
        if (currentWarns >= 5) {
            embed.addFields({
                name: '🚨 تحذير مهم:',
                value: `• المتجر معطل حالياً بسبب وصول التحذيرات إلى ${currentWarns}\n` +
                       `• عند وصول التحذيرات إلى 7 سيتم حذف المتجر نهائياً\n` +
                       `• يمكن إعادة تفعيل المتجر بإزالة التحذيرات إلى أقل من 5`,
                inline: false
            });
        } else if (currentWarns >= 3) {
            embed.addFields({
                name: '⚠️ تنبيه:',
                value: `• المتجر قريب من التعطيل (يحتاج ${5 - currentWarns} تحذيرات إضافية)\n` +
                       `• عند وصول التحذيرات إلى 5 سيتم تعطيل المتجر\n` +
                       `• عند وصول التحذيرات إلى 7 سيتم حذف المتجر نهائياً`,
                inline: false
            });
        } else if (currentWarns > 0) {
            embed.addFields({
                name: '📋 معلومات إضافية:',
                value: `• المتجر في حالة جيدة حالياً\n` +
                       `• تبقى ${5 - currentWarns} تحذيرات قبل التعطيل\n` +
                       `• يُنصح بالالتزام بالقوانين لتجنب المزيد من التحذيرات`,
                inline: false
            });
        } else {
            embed.addFields({
                name: '✅ المتجر في حالة ممتازة!',
                value: `• لا توجد أي تحذيرات\n• المتجر يعمل بكامل طاقته\n• استمر في الالتزام بالقوانين`,
                inline: false
            });
        }

        // إضافة تفاصيل المساعدين إذا وجدوا
        if (shopPartners.length > 0) {
            embed.addFields({
                name: '👥 مساعدي المتجر:',
                value: shopPartners.map(id => `<@${id}>`).join(', ') || 'لا يوجد مساعدين',
                inline: false
            });
        }

        const components = [];

        // زر إزالة التحذير (للمالك والمساعدين فقط)
        if ((isOwner || isHelper) && currentWarns > 0) {
            const removeWarningButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('remove_warning_modal')
                        .setLabel(`ازالة التحذيرات`)
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('💰')
                );
            components.push(removeWarningButton);
        }

        await interaction.reply({
            embeds: [embed],
            components: components,
            ephemeral: !isAdmin // الإدارة يمكنها رؤية الرسالة علناً
        });
    }
};
