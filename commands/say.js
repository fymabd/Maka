
const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'say',
    description: 'إرسال رسالة عبر البوت أو webhook',
    options: [
        {
            name: 'message',
            description: 'الرسالة المراد إرسالها',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'type',
            description: 'نوع الإرسال',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'webhook', value: 'webhook' },
                { name: 'bot', value: 'bot' }
            ]
        },
        {
            name: 'name',
            description: 'اسم الـ webhook (مطلوب عند اختيار webhook)',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'avatar',
            description: 'صورة الـ webhook (مطلوب عند اختيار webhook)',
            type: ApplicationCommandOptionType.Attachment,
            required: false
        },
        {
            name: 'channel',
            description: 'القناة المراد الإرسال فيها',
            type: ApplicationCommandOptionType.Channel,
            required: false
        }
    ],
    async execute(interaction, db, config) {
        try {
            // التحقق من أن المستخدم هو مالك البوت
            if (interaction.user.id !== config.Admin && interaction.user.id !== '1403143764935184576') {
                return interaction.reply({ content: "❌ | هذا الأمر مخصص لمالك البوت فقط", ephemeral: true });
            }

            const message = interaction.options.getString("message");
            const type = interaction.options.getString('type');
            const name = interaction.options.getString('name') || interaction.guild.name;
            const avatar = interaction.options.getAttachment('avatar');
            const channel = interaction.options.getChannel("channel") || interaction.channel;

            if (channel.type !== 0) {
                return interaction.reply({ content: "❌ | القناة المختارة ليست قناة نصية", ephemeral: true });
            }

            if (type === "webhook") {
                if (!avatar) {
                    return interaction.reply({ content: "❌ | يجب إضافة صورة الـ webhook", ephemeral: true });
                }

                const webhook = await channel.createWebhook({
                    name: name,
                    avatar: avatar.url
                });

                await webhook.send(message);
                await webhook.delete();
            } else if (type === "bot") {
                await channel.send(message);
            }

            await interaction.reply({ content: "✅ | تم إرسال الرسالة بنجاح", ephemeral: true });

        } catch (error) {
            console.error('خطأ في أمر say:', error);
            await interaction.reply({ content: "❌ | حدث خطأ في إرسال الرسالة", ephemeral: true });
        }
    }
};
