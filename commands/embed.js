
const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'embed',
    description: 'إرسال embed عبر البوت أو webhook',
    options: [
        {
            name: 'title',
            description: 'عنوان الـ embed',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'description',
            description: 'وصف الـ embed',
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
            description: 'اسم الـ webhook',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'avatar',
            description: 'صورة الـ webhook',
            type: ApplicationCommandOptionType.Attachment,
            required: false
        },
        {
            name: 'footer',
            description: 'تذييل الـ embed',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'author',
            description: 'كاتب الـ embed',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'thumbnail',
            description: 'رابط الصورة المصغرة',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'image',
            description: 'صورة الـ embed',
            type: ApplicationCommandOptionType.Attachment,
            required: false
        },
        {
            name: 'color',
            description: 'لون الـ embed (hex code)',
            type: ApplicationCommandOptionType.String,
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

            const title = interaction.options.getString('title');
            const description = interaction.options.getString('description');
            const type = interaction.options.getString('type');
            const name = interaction.options.getString('name') || interaction.guild.name;
            const avatar = interaction.options.getAttachment('avatar');
            const footer = interaction.options.getString('footer') || '';
            const author = interaction.options.getString('author') || interaction.guild.name;
            const thumbnail = interaction.options.getString('thumbnail') || interaction.guild.iconURL({ dynamic: true });
            const image = interaction.options.getAttachment('image');
            const color = interaction.options.getString('color') || '#0099FF';
            const channel = interaction.options.getChannel('channel') || interaction.channel;

            if (channel.type !== 0) {
                return interaction.reply({ content: "❌ | القناة المختارة ليست قناة نصية", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(color)
                .setFooter({ text: footer, iconURL: interaction.guild.iconURL() })
                .setAuthor({ name: author, iconURL: interaction.guild.iconURL({ dynamic: true }) })
                .setTimestamp();

            if (thumbnail) embed.setThumbnail(thumbnail);
            if (image) embed.setImage(image.url);

            if (type === "webhook") {
                if (!avatar) {
                    return interaction.reply({ content: "❌ | يجب إضافة صورة الـ webhook", ephemeral: true });
                }

                const webhook = await channel.createWebhook({
                    name: name,
                    avatar: avatar.url
                });

                await webhook.send({ embeds: [embed] });
                await webhook.delete();
            } else if (type === "bot") {
                await channel.send({ embeds: [embed] });
            }

            await interaction.reply({ content: "✅ | تم إرسال الـ embed بنجاح", ephemeral: true });

        } catch (error) {
            console.error('خطأ في أمر embed:', error);
            await interaction.reply({ content: "❌ | حدث خطأ في إرسال الـ embed", ephemeral: true });
        }
    }
};
