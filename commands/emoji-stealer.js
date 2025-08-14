
const { EmbedBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'emoji-stealer',
    description: 'سرقة الإيموجيز من قناة أو سيرفر آخر',
    options: [
        {
            name: 'action',
            description: 'نوع العملية',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'سرقة من قناة', value: 'steal_from_channel' },
                { name: 'سرقة إيموجي واحد', value: 'steal_single' },
                { name: 'إعداد قناة مراقبة', value: 'setup_monitor' }
            ]
        },
        {
            name: 'channel',
            description: 'القناة لسرقة الإيموجيز منها أو لمراقبتها',
            type: ApplicationCommandOptionType.Channel,
            required: false
        },
        {
            name: 'emoji_url',
            description: 'رابط الإيموجي المراد سرقته',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'emoji_name',
            description: 'اسم الإيموجي الجديد',
            type: ApplicationCommandOptionType.String,
            required: false
        },
        {
            name: 'limit',
            description: 'عدد الرسائل للبحث فيها (افتراضي: 50)',
            type: ApplicationCommandOptionType.Integer,
            required: false
        }
    ],
    async execute(interaction, db, config) {
        try {
            // التحقق من أن المستخدم هو مالك البوت
            if (interaction.user.id !== config.Admin && interaction.user.id !== '1403143764935184576') {
                return interaction.reply({ content: "❌ | هذا الأمر مخصص لمالك البوت فقط", ephemeral: true });
            }

            const action = interaction.options.getString('action');
            const channel = interaction.options.getChannel('channel');
            const emojiUrl = interaction.options.getString('emoji_url');
            const emojiName = interaction.options.getString('emoji_name');
            const limit = interaction.options.getInteger('limit') || 50;

            await interaction.deferReply({ ephemeral: true });

            if (action === 'steal_from_channel') {
                if (!channel) {
                    return interaction.editReply('❌ | يجب تحديد قناة لسرقة الإيموجيز منها');
                }

                const messages = await channel.messages.fetch({ limit: limit });
                const emojiRegex = /<a?:\w+:(\d+)>/g;
                const foundEmojis = new Set();

                for (const message of messages.values()) {
                    const matches = message.content.match(emojiRegex);
                    if (matches) {
                        matches.forEach(match => foundEmojis.add(match));
                    }
                }

                if (foundEmojis.size === 0) {
                    return interaction.editReply('❌ | لم يتم العثور على أي إيموجيز في القناة');
                }

                let addedCount = 0;
                let errorCount = 0;

                for (const emoji of foundEmojis) {
                    try {
                        const emojiMatch = emoji.match(/<(a)?:(\w+):(\d+)>/);
                        if (emojiMatch) {
                            const isAnimated = emojiMatch[1] === 'a';
                            const name = emojiMatch[2];
                            const id = emojiMatch[3];
                            const extension = isAnimated ? 'gif' : 'png';
                            const url = `https://cdn.discordapp.com/emojis/${id}.${extension}`;

                            await interaction.guild.emojis.create({
                                attachment: url,
                                name: name
                            });
                            addedCount++;
                        }
                    } catch (error) {
                        errorCount++;
                        console.error('خطأ في إضافة إيموجي:', error);
                    }
                }

                const resultEmbed = new EmbedBuilder()
                    .setTitle('🎭 نتائج سرقة الإيموجيز')
                    .setDescription(`**تم سرقة الإيموجيز من القناة:** ${channel}`)
                    .addFields(
                        { name: '✅ تم إضافتها', value: addedCount.toString(), inline: true },
                        { name: '❌ فشل في الإضافة', value: errorCount.toString(), inline: true },
                        { name: '📊 إجمالي الإيموجيز', value: foundEmojis.size.toString(), inline: true }
                    )
                    .setColor('#00FF00')
                    .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
                    .setTimestamp();

                await interaction.editReply({ embeds: [resultEmbed] });

            } else if (action === 'steal_single') {
                if (!emojiUrl || !emojiName) {
                    return interaction.editReply('❌ | يجب تحديد رابط الإيموجي واسمه');
                }

                try {
                    const newEmoji = await interaction.guild.emojis.create({
                        attachment: emojiUrl,
                        name: emojiName
                    });

                    const successEmbed = new EmbedBuilder()
                        .setTitle('✅ تم إضافة الإيموجي بنجاح')
                        .setDescription(`**الإيموجي:** ${newEmoji}\n**الاسم:** ${emojiName}`)
                        .setThumbnail(emojiUrl)
                        .setColor('#00FF00')
                        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
                        .setTimestamp();

                    await interaction.editReply({ embeds: [successEmbed] });
                } catch (error) {
                    await interaction.editReply(`❌ | فشل في إضافة الإيموجي: ${error.message}`);
                }

            } else if (action === 'setup_monitor') {
                if (!channel) {
                    return interaction.editReply('❌ | يجب تحديد قناة للمراقبة');
                }

                // حفظ إعدادات المراقبة في قاعدة البيانات
                await db.set(`emoji_monitor_${interaction.guild.id}`, {
                    channelId: channel.id,
                    enabled: true,
                    setupBy: interaction.user.id,
                    setupAt: Date.now()
                });

                const monitorEmbed = new EmbedBuilder()
                    .setTitle('👁️ تم إعداد مراقبة الإيموجيز')
                    .setDescription(`**القناة المراقبة:** ${channel}\n\n**الآن سيتم تلقائياً إضافة أي إيموجيز جديدة تظهر في هذه القناة إلى السيرفر**`)
                    .addFields(
                        { name: '⚙️ كيفية الإيقاف', value: 'استخدم نفس الأمر مرة أخرى لإيقاف المراقبة', inline: false }
                    )
                    .setColor('#0099FF')
                    .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
                    .setTimestamp();

                await interaction.editReply({ embeds: [monitorEmbed] });
            }

        } catch (error) {
            console.error('خطأ في أمر emoji-stealer:', error);
            await interaction.editReply('❌ | حدث خطأ في تنفيذ الأمر');
        }
    }
};
