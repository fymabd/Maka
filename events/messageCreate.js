const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    async execute(message, db, config, client) {
        if (message.author.bot) return;

        // التحقق إذا كان المستخدم هو المالك قبل تنفيذ الأوامر المقيدة
        const isOwner = message.author.id === config.ownerId;

        // معالجة أمر help بالبريفكس
        if (message.content === config.prefix + "help") {
            const { sendHelpMessage } = require('../utils/help');
            await sendHelpMessage(message.channel, client, config);
            return;
        }

        // معالجة أمر say
        if (message.content.startsWith(config.prefix + "say")) {
            if (!isOwner) {
                await message.reply("لا يمكنك استخدام هذا الأمر!");
                return;
            }
            const textToSay = message.content.slice(config.prefix.length + 4).trim();
            if (!textToSay) {
                await message.reply("الرجاء تحديد النص المراد قوله.");
                return;
            }
            await message.channel.send(textToSay);
            await message.delete(); // حذف رسالة الأمر الأصلية
            return;
        }

        // معالجة أمر embed
        if (message.content.startsWith(config.prefix + "embed")) {
            if (!isOwner) {
                await message.reply("لا يمكنك استخدام هذا الأمر!");
                return;
            }
            const embedContent = message.content.slice(config.prefix.length + 6).trim();
            if (!embedContent) {
                await message.reply("الرجاء تحديد محتوى الإمبد (يمكن أن يكون JSON).");
                return;
            }
            try {
                const embedData = JSON.parse(embedContent);
                const embed = new EmbedBuilder(embedData);
                await message.channel.send({ embeds: [embed] });
                await message.delete(); // حذف رسالة الأمر الأصلية
            } catch (error) {
                console.error('خطأ في بناء الإمبد:', error);
                await message.reply("حدث خطأ أثناء بناء الإمبد. تأكد من أن التنسيق JSON صحيح.");
            }
            return;
        }

        // معالجة أمر التشفير
        if (message.content.startsWith(config.prefix + "تشفير")) {
            const { PermissionFlagsBits } = require('discord.js');
            if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

            const { sendEncryptionPanel } = require('../utils/encryption');
            await sendEncryptionPanel(message.channel, message.guild);
            return;
        }

        // معالجة أمر منشن بالبريفكس
        if (message.content.startsWith(config.prefix + "منشن")) {
            const { handlePrefixMentions } = require('../utils/mentions');
            await handlePrefixMentions(message, db, config);
            return;
        }

        // مراقبة الإيموجيز في القنوات المعينة
        const emojiMonitorData = await db.get(`emoji_monitor_${message.guild.id}`);
        if (emojiMonitorData && emojiMonitorData.enabled && emojiMonitorData.channelId === message.channel.id) {
            const emojiRegex = /<a?:\w+:(\d+)>/g;
            const matches = message.content.match(emojiRegex);

            if (matches) {
                for (const match of matches) {
                    try {
                        const emojiMatch = match.match(/<(a)?:(\w+):(\d+)>/);
                        if (emojiMatch) {
                            const isAnimated = emojiMatch[1] === 'a';
                            const name = emojiMatch[2];
                            const id = emojiMatch[3];
                            const extension = isAnimated ? 'gif' : 'png';
                            const url = `https://cdn.discordapp.com/emojis/${id}.${extension}`;

                            // التحقق من أن الإيموجي غير موجود بالفعل
                            const existingEmoji = message.guild.emojis.cache.find(e => e.name === name);
                            if (!existingEmoji) {
                                const newEmoji = await message.guild.emojis.create({
                                    attachment: url,
                                    name: name
                                });

                                // إرسال تأكيد في القناة
                                const confirmEmbed = new EmbedBuilder()
                                    .setTitle('🎭 تم إضافة إيموجي تلقائياً')
                                    .setDescription(`**تم إضافة الإيموجي:** ${newEmoji}\n**الاسم:** ${name}`)
                                    .setThumbnail(url)
                                    .setColor('#00FF00')
                                    .setFooter({ text: '_d3q', iconURL: message.guild.iconURL() })
                                    .setTimestamp();

                                await message.channel.send({ embeds: [confirmEmbed] });
                            }
                        }
                    } catch (error) {
                        console.error('خطأ في إضافة إيموجي تلقائياً:', error);
                    }
                }
            }
        }

        const shopData = await db.get(`shop_${message.channel.id}`);
        if (shopData) {
            // فحص الكلمات غير المشفرة
            const foundKeywords = config.words.filter(word => message.content.includes(word));

            if (foundKeywords.length > 0) {
                const { handleUnencryptedWords } = require('../utils/moderation');
                await handleUnencryptedWords(message, foundKeywords, config, db);
                return;
            }

            // مراقبة المنشنات
            const { handleMentions } = require('../utils/mentions');
            await handleMentions(message, shopData, db);
        }

        // حساب الضريبة
        if (message.channel.id === config.tax && config.tax) {
            const { handleTaxCalculation } = require('../utils/tax');
            handleTaxCalculation(message, config);
        }
    }
};