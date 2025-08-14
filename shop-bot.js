const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const { QuickDB, JSONDriver } = require("quick.db");
const fs = require('fs');
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ApplicationCommandOptionType,
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ComponentType,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
    REST,
    Routes
} = require("discord.js");
const express = require('express');
const ms = require('ms');

// إعدادات البوت المحدثة
let orderChannel = "1351407597466419232"; // روم يوصل له الطلبات

const config = {
    token: process.env.TOKEN,
    Admin: "1403143764935184576",
    line: "https://cdn.discordapp.com/attachments/1332738938372100136/1401264541903360201/c8d9bd0f1ab908f7.png?ex=689d7c8d&is=689c2b0d&hm=faab726b1f707c2ee5d2cef2c3019cee89647941b8806b856161094a07d9b72b&",
    prefix: "-",
    log: "1351871249059676170",
    tax: "",
    commandlog: "1302700402885529620",
    debuglog: "1351871249059676170", // قناة إرسال رسائل التصحيح
    words: ['بيع', 'شراء', 'سعر', 'عرض', 'هاك', 'فيزا', 'مطلوب', 'كرديت', 'متوفر', 'حساب', 'شوب', 'خاص', 'فيزات', 'مقابل'],
    button1: "PLATENUEM",
    button2: "GRAND MASTER",
    button3: "MASTER",
    button4: "DIAMOND",
    button5: "BRONZE",
    bank: "966178756341411862",
    probot: "282859044593598464",
    catagory: "1351408133892870144",
    info: "https://media.discordapp.net/attachments/1301558735415545907/1302795627306025120/New_Project_133_69BBD87.png",
    shop1: "1403137248571949137",
    shop2: "1403137248571949137",
    shop3: "1403137248571949137",
    shop4: "1403137248571949137",
    shop5: "1403137248571949137",
    here: 2,
    every: 2,
    help: "1278638315586977793",
    oeverey: 40000,
    ohere: 30000,
    co: "1310888668164263956",
    ord: "1292282209528713247"
};

// إعداد قاعدة البيانات
const jsonDriver = new JSONDriver();
const db = new QuickDB({ driver: jsonDriver });

// إعداد العميل
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ],
    ws: {
        properties: {
            $browser: "Discord Android" // يمكنك تغييرها إلى "Discord iOS" أو "Discord Client"
        }
    }
});

// إعداد Express للـ keep alive
const app = express();
app.get('/', (req, res) => res.send('Bot is running!'));

const PORT = process.env.PORT || 5000;
let serverStarted = false;

function startServer(port) {
    if (serverStarted) return;

    const server = app.listen(port, '0.0.0.0', () => {
        console.log(`Express server running on port ${port}`);
        serverStarted = true;
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE' && port < 5010) {
            console.log(`Port ${port} is busy, trying port ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
}

startServer(PORT);

// دالة توليد لون عشوائي محسنة
function randomColor() {
    return Math.floor(Math.random() * 0xFFFFFF);
}

// دالة إنشاء embed للمتاجر
function createShopEmbed(ownerId, type, messageText, serverName, serverIcon, imageembed) {
    return new EmbedBuilder()
        .setDescription(
            `${messageText}\n\n<@${ownerId}> **تم إعادة تعيين منشنات متجرك:**\n• @everyone: ${type.every}\n• @here: ${type.here}\n• shop: ${type.shop}`
        )
        .setTitle(`** ${serverName} - رسـتـرنـا الـمـنـشـنـات**`)
        .setThumbnail(serverIcon)
        .setImage(imageembed)
        .setColor(randomColor())
        .setFooter({ text: '_d3q', iconURL: serverIcon })
        .setTimestamp();
}

// دالة لإرسال رسائل التصحيح إلى Discord
async function sendDebugLog(message, channelName = 'غير محدد', username = 'غير محدد') {
    try {
        const debugChannel = client.channels.cache.get(config.debuglog);
        if (debugChannel) {
            const embed = new EmbedBuilder()
                .setTitle('🔍 رسالة تصحيح البوت')
                .setDescription(message)
                .addFields(
                    { name: 'اسم الروم', value: channelName, inline: true },
                    { name: 'اسم المستخدم', value: username, inline: true },
                    { name: 'الوقت', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
                )
                .setColor(randomColor())
                .setThumbnail(client.guilds.cache.first()?.iconURL())
                .setFooter({ text: '_d3q', iconURL: client.guilds.cache.first()?.iconURL() })
                .setTimestamp();

            await debugChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('خطأ في إرسال رسالة التصحيح:', error);
    }
}

// أنواع المتاجر المحدثة
const types = require('./types.js');

// قائمة كلمات التشفير
const replace = [
    { word: "متوفر", replace: "مـ.ـتوفر" },
    { word: "بيع", replace: " بــيـ,ــع " },
    { word: "شوب", replace: "شـ,ــوب" },
    { word: "ديسكورد", replace: "ديس_ورد" },
    { word: "تبادل", replace: "تبا1دل" },
    { word: "توكن", replace: "ت9كن" },
    { word: "بوست", replace: "ب9ست" },
    { word: "حساب", replace: "حسـ,ــاب" },
    { word: "نتفيلكس", replace: "ن$$فيلكس" },
    { word: "سعر", replace: "سـعـ,ــر" },
    { word: "مطلوب", replace: "مـ.ـطلوب" },
    { word: "دولار", replace: "دولاr" },
    { word: "روبوكس", replace: "ر9بوكس" },
    { word: "نيترو", replace: "نيتر9" },
    { word: "مقابل", replace: "مـ,ـقابل" },
    { word: "فيزات", replace: "فـيـ,زات" },
    { word: "خاص", replace: " خـ,ــاص" }
];

const auctions = new Map();

// الأحداث تم نقلها إلى مجلد events/
// دالة إنشاء متجر
async function createShop(interaction) {
    await interaction.deferReply();

    const type = types.find(t => t.id === interaction.options.getString('type'));
    const name = interaction.options.getString('name').replaceAll(' ', '・');
    const owner = interaction.options.getUser('owner');

    if (!type) {
        return interaction.editReply('نوع المتجر غير صحيح!');
    }

    const adminRole = interaction.guild.roles.cache.get(config.Admin);
    const shopRole = interaction.guild.roles.cache.get(type.role);

    try {
        const channel = await interaction.guild.channels.create({
            name: `${type.badge}${config.prefix}${name}`,
            type: ChannelType.GuildText,
            parent: type.id,
            permissionOverwrites: [
                {
                    id: owner.id,
                    allow: ['SendMessages', 'MentionEveryone', 'EmbedLinks', 'AttachFiles', 'ViewChannel']
                },
                {
                    id: interaction.guild.roles.everyone,
                    deny: ['SendMessages'],
                    allow: ['ViewChannel']
                },
                {
                    id: adminRole.id,
                    allow: ['SendMessages', 'MentionEveryone', 'EmbedLinks', 'AttachFiles', 'ViewChannel']
                }
            ]
        });

        const timestamp = Math.floor(Date.now() / 1000);

        await db.set(`shop_${channel.id}`, {
            owner: owner.id,
            type: type.role,
            shop: type.shop,
            every: type.every,
            here: type.here,
            date: `<t:${timestamp}:R>`,
            status: "1",
            warns: 0,
            badge: type.badge
        });

        if (shopRole) {
            await interaction.guild.members.cache.get(owner.id).roles.add(shopRole);
        }

        const embed = new EmbedBuilder()
            .setTitle('معلومات المتجر')
            .setDescription(`**المنشنات:**\n• everyone: ${type.every}\n• here: ${type.here}`)
            .addFields(
                { name: 'صاحب المتجر', value: `<@${owner.id}>`, inline: true },
                { name: 'نوع المتجر', value: `<@&${type.role}>`, inline: true },
                { name: 'تاريخ الإنشاء', value: `<t:${timestamp}:R>`, inline: true }
            )
            .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await channel.send({ embeds: [embed] });
        await interaction.editReply({ content: `تم إنشاء المتجر بنجاح ${channel}`, embeds: [embed] });

        // إرسال لوج
        const logChannel = interaction.guild.channels.cache.get(config.commandlog);
        if (logChannel) {
            const logEmbed = new EmbedBuilder()
                .setTitle('تم إنشاء متجر')
                .setDescription(`المسؤول: <@${interaction.user.id}>`)
                .addFields(
                    { name: 'المتجر', value: `<#${channel.id}>`, inline: true },
                    { name: 'النوع', value: `<@&${type.role}>`, inline: true },
                    { name: 'المالك', value: `<@${owner.id}>`, inline: true }
                )
                .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            await logChannel.send({ embeds: [logEmbed] });
        }

    } catch (error) {
        console.error('خطأ في إنشاء المتجر:', error);
        await interaction.editReply('حدث خطأ أثناء إنشاء المتجر!');
    }
}

// دالة عرض المنشنات
async function showMentions(interaction) {
    const shopData = await db.get(`shop_${interaction.channel.id}`);

    if (!shopData) {
        return interaction.reply({ content: 'هذا الشات ليس متجراً!', ephemeral: true });
    }

    const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('buy_mentions')
                .setLabel('شراء منشنات')
                .setStyle(ButtonStyle.Primary)
        );

    const embed = new EmbedBuilder()
        .setTitle('📊 المنشنات المتبقية')
        .setDescription(`**المنشنات المتبقية:**\n• everyone: ${shopData.every || 0}\n• here: ${shopData.here || 0}\n• shop: ${shopData.shop || 0}`)
        .setColor(randomColor())
        .setThumbnail(interaction.guild.iconURL())
        .setImage(config.line)
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await interaction.reply({
        embeds: [embed],
        components: [button]
    });
}

// دالة حساب الضريبة
async function calculateTax(interaction) {
    await interaction.deferReply({ ephemeral: false });

    const option = interaction.options.get('number');
    if (!option) {
        return interaction.editReply('**يـجـب ان تـضـع رقـم بـخـيـار number.**');
    }

    let number = option.value;
    const regex = /^[0-9]+([kKmMbB])?$/;

    if (!regex.test(number)) {
        return interaction.editReply('**يـجـب ان تـحـتـوي الـرسـالـة عـلـى رقـم.**');
    }

    if (number.endsWith('m') || number.endsWith('M')) {
        number = parseFloat(number.slice(0, -1)) * 1000000;
    } else if (number.endsWith('k') || number.endsWith('K')) {
        number = parseFloat(number.slice(0, -1)) * 1000;
    } else if (number.endsWith('b') || number.endsWith('B')) {
        number = parseFloat(number.slice(0, -1)) * 1000000000;
    } else {
        number = parseFloat(number);
    }

    if (isNaN(number) || number < 1) {
        return interaction.editReply('**يـجـب أن يـكـون الـرقـم اكـبـر مـن او يـسـاوي الـواحـد**');
    }

    let taxwi = Math.floor(number * 20 / 19 + 1);
    let tax2 = Math.floor(number * (20) / (19) + (1) - (number));
    let tax3 = Math.floor(tax2 * (20) / (19) + (1));
    let tax4 = Math.floor(tax2 + tax3 + number);
    let num = taxwi - number;

    return interaction.editReply(`** 💳 الـمـبـلـغ **  :  **__${number}__** \n ** 💰  الـضـريـبـة **  :  **__${num}__** \n ** 💵 الـمـبـلـغ مـع   الـضـريـبـة**  :  **__${taxwi}__** \n ** 💵 الـمـبـلـغ مـع ضـريـبـة الـوسـيـط **  : **__${tax4}__**`);
}

// معالجة التفاعلات مع الأزرار
async function handleButtonInteractions(interaction) {
    const { customId } = interaction;

    try {
        if (customId === 'buy_shop_ticket') {
            await handleBuyShopTicket(interaction);
        } else if (customId === 'buy_order_ticket') {
            await handleBuyOrderTicket(interaction);
        } else if (customId === 'buy_mentions') {
            await handleMentionButton(interaction);
        } else if (customId.startsWith('shop_type_')) {
            await handleShopTypeSelection(interaction);
        } else if (customId === 'mention') {
            await handleMentionButton(interaction);
        } else if (['here', 'everyone'].some(prefix => customId.startsWith(prefix))) {
            await handleMentionPurchase(interaction);
        } else if (['1b', '2b', '3b', '4b', '5b'].includes(customId)) {
            await handleShopTypePurchase(interaction);
        } else if (customId === 'close_ticket') {
            await handleCloseTicket(interaction);
        } else if (customId === 'remove_warning_modal') {
            await showRemoveWarningModal(interaction);
        } else if (customId === 'remove_warning_ticket') {
            await handleRemoveWarningTicket(interaction);
        } else if (customId.startsWith('remove_warning_')) {
            await handleRemoveWarning(interaction);
        } else if (customId === 'view_shop_prices') {
            await handleShopPricesView(interaction);
        } else if (customId === 'view_auction_prices') {
            await handleAuctionPricesView(interaction);
        } else if (customId === 'view_order_prices') {
            await handleOrderPricesView(interaction);
        } else if (customId.startsWith('shop_price_')) {
            await handleShopPriceSelection(interaction);
        } else if (customId === 'auction_everyone_price' || customId === 'auction_here_price') {
            await handleAuctionPriceSelection(interaction);
        } else if (customId === 'order_everyone_price' || customId === 'order_here_price') {
            await handleOrderPriceSelection(interaction);
        } else if (customId === 'cancel') {
            await interaction.update({
                content: 'تم إلغاء العملية.',
                components: [],
                embeds: []
            });
        }
    } catch (error) {
        console.error('خطأ في معالجة الزر:', error);
        if (!interaction.replied) {
            await interaction.reply({ content: 'حدث خطأ!', ephemeral: true });
        }
    }
}

// معالجة شراء المتاجر التلقائي
async function handleBuyShopTicket(interaction) {
    const data = await db.get(`buy_shop_ticket_${interaction.member.id}`);
    if (data) {
        return await interaction.reply({
            content: `**من فضلك عندك تذكره لا يمكنك فتح تذكره اخره - <#${data.channelId}>**`,
            ephemeral: true
        });
    }

    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({ content: `Please wait ....` });

    const channel = await interaction.guild.channels.create({
        name: `buy shop ${interaction.user.tag}`,
        type: ChannelType.GuildText,
        parent: config.catagory,
        topic: "تـكـت شـراء مـتـجـر",
        permissionOverwrites: [
            {
                id: interaction.user.id,
                allow: [
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ViewChannel,
                ],
            },
            {
                id: interaction.guild.id,
                deny: [
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ViewChannel,
                ],
            },
        ],
    });

    await db.set(`buy_shop_ticket_${interaction.member.id}`, {
        userId: interaction.member.id,
        channelId: channel.id
    });

    const embedAboveButtons = new EmbedBuilder()
        .setColor('#000100')
        .setDescription(`**قـم بـإخـتـيـار نـوع الـمـتـجـر مـن الأزرار أدنـاه**`)
        .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
        .setTimestamp()
        .setAuthor({ name: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
        .setImage(config.info);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('1b')
                .setLabel(config.button1)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('2b')
                .setLabel(config.button2)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('3b')
                .setLabel(config.button3)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('4b')
                .setLabel(config.button4)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('5b')
                .setLabel(config.button5)
                .setStyle(ButtonStyle.Primary)
        );

    const closeRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('إغلاق التذكرة')
                .setStyle(ButtonStyle.Danger)
        );

    await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embedAboveButtons],
        components: [row, closeRow]
    });

    await interaction.editReply({
        content: `**-  ..تـم انـشـاء تـذكرتـك بنـجـاح.. \n- روم التـذكـرة : <#${channel.id}>**`,
        ephemeral: true
    });
}

// معالجة شراء نوع المتجر
async function handleShopTypePurchase(interaction) {
    const userData = await db.get(`shop_credit_${interaction.member.id}`);
    if (userData) {
        return await interaction.reply({
            content: `**لا يمكنك شراء متجرين في نفس الوقت.**`,
            ephemeral: true
        });
    }

    let typei;
    switch (interaction.customId) {
        case '1b': typei = types[0]; break; // PLATENUEM
        case '2b': typei = types[1]; break; // GRAND MASTER
        case '3b': typei = types[2]; break; // MASTER
        case '4b': typei = types[3]; break; // DIAMOND
        case '5b': typei = types[4]; break; // BRONZE
        default: return;
    }

    if (!typei) {
        return await interaction.reply({
            content: `**خطأ في نوع المتجر المحدد.**`,
            ephemeral: true
        });
    }

    const price = typei.price;
    const taxs = Math.floor(typei.price * 20 / 19 + 1);

    const choosedShop = interaction.message.components[0].components.find(c => c.customId === interaction.customId).label;
    const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setTitle(`Choosed Shop: ${choosedShop}\nprice: ${price}`)
        .setDescription(`- <@${interaction.member.id}>\n\`\`\`ملاحظة: انسخ الرسالة ادناء للتحويل بسرعة لديك 60 ثانية\`\`\``)
        .setTimestamp();

    await interaction.deferUpdate();
    await interaction.channel.send({ embeds: [embed] });
    await interaction.channel.send({ content: `#credit ${config.bank} ${taxs}` });
    await db.set(`shop_credit_${interaction.member.id}`, interaction.member.id);

    // مراقبة الدفع
    const collectorFilter = m => m.author.bot === true && m.author.id === config.probot;
    const collector = interaction.channel.createMessageCollector({
        filter: collectorFilter,
        time: 60000
    });

    collector.on('collect', async c => {
        await sendDebugLog('تم اكتشاف رسالة من البوت: ' + c.content, interaction.channel.name, interaction.user.username);

        // التحقق من أن الرسالة تحتوي على رمز المال ومعلومات التحويل
        if (c.content.includes(':moneybag:') || c.content.includes('💰')) {
            await sendDebugLog('رسالة دفع محتملة: ' + c.content, interaction.channel.name, interaction.user.username);

            // التحقق من وجود اسم المستخدم والبنك في الرسالة
            const hasUsername = c.content.includes(interaction.user.username) || c.content.includes(interaction.user.tag) || c.content.includes(interaction.user.displayName);
            const hasBank = c.content.includes(config.bank);

            await sendDebugLog(`فحص الرسالة - المستخدم: ${hasUsername} | البنك: ${hasBank}`, interaction.channel.name, interaction.user.username);

            if (hasUsername && hasBank) {
                // البحث عن المبلغ بصيغ مختلفة
                let transferredAmount = 0;

                // أنماط البحث المحسنة
                const patterns = [
                    /has transferred `\$([0-9,]+)`/g,
                    /قام بتحويل `\$([0-9,]+)`/g,
                    /transferred `\$([0-9,]+)`/g,
                    /`\$([0-9,]+)`/g,
                    /\$([0-9,]+)/g,
                    /([0-9,]+)\$/g
                ];

                for (const pattern of patterns) {
                    const matches = [...c.content.matchAll(pattern)];
                    for (const match of matches) {
                        const amount = parseInt(match[1].replace(/,/g, ''));
                        if (amount > 0) {
                            transferredAmount = amount;
                            await sendDebugLog(`تم العثور على المبلغ: ${transferredAmount} بالنمط: ${pattern}`, interaction.channel.name, interaction.user.username);
                            break;
                        }
                    }
                    if (transferredAmount > 0) break;
                }

                if (transferredAmount > 0) {
                    await sendDebugLog(`المبلغ المحول: ${transferredAmount} | المطلوب: ${price} | الضريبة: ${taxs}`, interaction.channel.name, interaction.user.username);

                    // التحقق من أن المبلغ يساوي السعر أو الضريبة أو أكثر
                    if (transferredAmount >= price) {
                        await sendDebugLog('✅ تم تأكيد الدفع! جاري إنشاء المتجر...', interaction.channel.name, interaction.user.username);
                        collector.stop('DONE');
                        // تنفيذ إنشاء المتجر مباشرة
                        setTimeout(async () => {
                            await createShopFromPayment(interaction, typei.id, typei);
                        }, 1000);
                        return;
                    } else {
                        await sendDebugLog(`❌ المبلغ غير كافي: ${transferredAmount} | المطلوب: ${price}`, interaction.channel.name, interaction.user.username);
                    }
                } else {
                    await sendDebugLog('❌ لا يمكن  ستخراج المبلغ من الرسالة', interaction.channel.name, interaction.user.username);
                }
            } else {
                await sendDebugLog('❌ الرسالة لا تحتوي على المستخدم أو البنك المطلوب', interaction.channel.name, interaction.user.username);
            }
        } else {
            await sendDebugLog('الرسالة ليست رسالة دفع', interaction.channel.name, interaction.user.username);
        }
    });

    collector.on('end', async (collected, reason) => {
        if (reason === 'DONE') {
            // createShopFromPayment is called inside the collector now
        } else {
            // التحقق من وجود القناة قبل إرسال الرسالة
            if (interaction.channel && !interaction.channel.deleted) {
                await interaction.channel.send({ content: 'انتهى الوقت. قم بإنشاء تذكرة جديدة لإعادة المحاولة.' }).catch(error => {
                    console.error('خطأ في إرسال رسالة انتهاء الوقت:', error);
                });
                await db.delete(`buy_shop_ticket_${interaction.member.id}`);
                await db.delete(`shop_credit_${interaction.member.id}`);
                setTimeout(() => {
                    if (interaction.channel && !interaction.channel.deleted) {
                        interaction.channel.delete().catch(error => {
                            console.error('خطأ في حذف القناة:', error);
                        });
                    }
                }, 5000);
            } else {
                // تنظيف البيانات حتى لو حُذفت القناة
                await db.delete(`buy_shop_ticket_${interaction.member.id}`);
                await db.delete(`shop_credit_${interaction.member.id}`);
            }
        }
    });
}

// إنشاء المتجر بعد الدفع
async function createShopFromPayment(interaction, categoryID, typei) {
    const msg = await interaction.channel.send({
        content: `\`-\` **<@${interaction.member.id}>\nرجاء قم بكتابة اسم المتجر.**\n\`-\` **__لا يمكنك تغيير الاسم بعد كتابته.__**`
    });

    const nameCollector = interaction.channel.createMessageCollector({
        filter: m => m.author.id === interaction.user.id,
        time: 60000
    });

    nameCollector.on('collect', async m => {
        const are = m.content.trim();
        if (are.length < 3 || are.length > 15) {
            await interaction.channel.send('**يـجـب ان يـكـون الأسـم اكـثـر مـن ثـلاث احـرف و اقـل مـن 15 حـرف **');
            return;
        }

        const naeee = are.replaceAll(' ', '・');
        const typeo = types.find(t => t.id === categoryID);
        const opi = `${typeo.badge}${config.prefix}${naeee}`;
        const existingChannel = interaction.guild.channels.cache.find(c => c.name === opi);

        if (existingChannel) {
            await interaction.channel.send('**يـوجـد مـتـجـر بـهـذا الأسـم ضـع أسـم أخـر**');
            return;
        }

        await db.delete(`buy_shop_ticket_${interaction.member.id}`);
        await db.delete(`shop_credit_${interaction.member.id}`);

        let adminss = interaction.guild.roles.cache.get(config.Admin);

        const newChannel = await interaction.guild.channels.create({
            name: opi,
            type: ChannelType.GuildText,
            parent: typeo.id,
            permissionOverwrites: [
                {
                    id: interaction.user.id,
                    allow: ['SendMessages', 'MentionEveryone', 'EmbedLinks', 'AttachFiles', 'ViewChannel']
                },
                {
                    id: interaction.guild.roles.everyone,
                    deny: ['SendMessages'],
                    allow: ['ViewChannel']
                },
                {
                    id: adminss.id,
                    allow: ['SendMessages', 'MentionEveryone', 'EmbedLinks', 'AttachFiles', 'ViewChannel']
                }
            ]
        });

        const dy = parseInt(Date.now() / 1000);
        const em5 = {
            title: ` **مـعـلـومـات مـتـجـر : ** `,
            description: `** - المـنـشـنـات:  **\n\`•\` everyone: ${typeo.every} \n \`•\` here: ${typeo.here}`,
            author: {
                name: `${interaction.guild.name}`,
                icon_url: interaction.guild.iconURL({ size: 1024 }),
            },
            footer: {
                text: `_d3q`,
                icon_url: interaction.guild.iconURL()
            },
            fields: [
                {
                    name: 'صـاحب المتـجـر',
                    value: `<@${interaction.user.id}>`,
                    inline: true
                },
                {
                    name: 'نـوع المـتـجـر',
                    value: `<@&${typeo.role}>`,
                    inline: true
                },
                {
                    name: 'مـوعـد انـشـاء المـتـجـر',
                    value: `<t:${dy}:R>`,
                    inline: true
                },
            ],
            timestamp: new Date(),
        };

        await newChannel.send({ embeds: [em5] });
        await interaction.channel.send({ content: `**تـم انـشـاء المـتـجـر بـ نـجـاح  ${newChannel}**` });

        let dateed = parseInt(Date.now() / 1000);
        let datecreatedd = `<t:${dateed}:R>`;
        await db.set(`shop_${newChannel.id}`, {
            owner: interaction.user.id,
            type: typei.role,
            shop: typei.shop,
            every: typei.every,
            here: typei.here,
            date: datecreatedd,
            status: "1",
            badge: typei.badge
        });

        // إرسال لوج
        const logg = interaction.guild.channels.cache.get(config.commandlog);
        if (logg) {
            const embedlog = {
                title: `تـم إنـشـاء مـتـجـر`,
                description: `الـمـسـؤول : شـراء تـلـقـائـي (الـبـوت) `,
                fields: [
                    {
                        name: 'الـمـتـجـر الـذي تـم إنـشـائـه',
                        value: `<#${newChannel.id}>`,
                        inline: true
                    },
                    {
                        name: 'نـوع الـمـتـجـر',
                        value: `<@&${typei.role}>`,
                        inline: true
                    },
                    {
                        name: 'مـالـك الـمـتـجـر',
                        value: `<@${interaction.user.id}>`,
                        inline: true
                    }
                ],
                footer: {
                    text: `_d3q`,
                    icon_url: interaction.guild.iconURL()
                },
                timestamp: new Date(),
            };
            await logg.send({ embeds: [embedlog] });
        }

        setTimeout(() => {
            interaction.channel.delete();
        }, 5000);

        nameCollector.stop();
    });

    nameCollector.on('end', async collected => {
        if (collected.size === 0) {
            // التحقق من وجود القناة عند انتهاء الوقت
            if (msg && !msg.deleted && interaction.channel && !interaction.channel.deleted) {
                await msg.edit({ content: 'انتهى وقت تسمية المتجر. قم بإنشاء تذكرة جديدة لإعادة المحاولة.' }).catch(error => {
                    console.error('خطأ في تعديل الرسالة:', error);
                });
                await db.delete(`buy_shop_ticket_${interaction.member.id}`);
                await db.delete(`shop_credit_${interaction.member.id}`);
                setTimeout(() => {
                    if (interaction.channel && !interaction.channel.deleted) {
                        interaction.channel.delete().catch(error => {
                            console.error('خطأ في حذف القناة:', error);
                        });
                    }
                }, 5000);
            } else {
                // تنظيف البيانات حتى لو حُذفت القناة
                await db.delete(`buy_shop_ticket_${interaction.member.id}`);
                await db.delete(`shop_credit_${interaction.member.id}`);
            }
        }
    });
}

// معالجة شراء المنشورات
async function handleBuyOrderTicket(interaction) {
    const data = await db.get(`buy_${interaction.member.id}`);
    if (data) {
        return await interaction.reply({
            content: `**من فضلك عندك تذكره لا يمكنك فتح تذكره اخره - <#${data.channelId}>**`,
            ephemeral: true
        });
    }

    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({ content: `Please wait ....` });

    const channel = await interaction.guild.channels.create({
        name: `buy manshor ${interaction.user.tag}`,
        type: ChannelType.GuildText,
        parent: config.catagory,
        topic: "تـكـت شـراء منشور",
        permissionOverwrites: [
            {
                id: interaction.user.id,
                allow: [
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ViewChannel,
                ],
            },
            {
                id: interaction.guild.id,
                deny: [
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ViewChannel,
                ],
            },
        ],
    });

    await db.set(`buy_${interaction.member.id}`, {
        userId: interaction.member.id,
        channelId: channel.id
    });

    const embedAboveButtons = new EmbedBuilder()
        .setColor('#000100')
        .setDescription(`**قـم بـإخـتـيـار نـوع الـمـنـشـن مـن الأزرار أدنـاه**`)
        .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
        .setTimestamp()
        .setAuthor({ name: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
        .setImage(config.info);

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('everyone')
                .setLabel("مـنـشـن افـري")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('here')
                .setLabel("مـنـشـن هـيـر")
                .setStyle(ButtonStyle.Primary),
        );

    const closeRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('إغلاق التذكرة')
                .setStyle(ButtonStyle.Danger)
        );

    await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embedAboveButtons],
        components: [row, closeRow]
    });

    await interaction.editReply({
        content: `**-  ..تـم انـشـاء تـذكرتـك بنـجـاح.. \n- روم التـذكـرة : <#${channel.id}>**`,
        ephemeral: true
    });
}

// معالجة شراء المنشنات
async function handleMentionButton(interaction) {
    const sellerId = await db.get(`shop_${interaction.channel.id}.owner`);

    if (interaction.user.id !== sellerId) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Not Shop Owner')
            .setDescription(`You are not the owner of the shop. the owner is <@${sellerId || 'Not found in the database'}>`)
        return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    const modal = new ModalBuilder()
        .setCustomId('mention_modal')
        .setTitle('شراء منشنات');

    const mentionStyle = new TextInputBuilder()
        .setCustomId('amount')
        .setLabel('اكتب عدد المنشنات التي تريد شرائها')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(mentionStyle);
    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);
}

// معالجة مودال المنشنات
async function handleModalSubmits(interaction) {
    if (interaction.customId === 'bot_setup_modal') {
        const shopAdmin = interaction.fields.getTextInputValue('shop_admin');
        const logsChannel = interaction.fields.getTextInputValue('logs_channel');
        const bankId = interaction.fields.getTextInputValue('bank_id');
        const lineImage = interaction.fields.getTextInputValue('line_image');
        const orderRoom = interaction.fields.getTextInputValue('order_room');

        config.Admin = shopAdmin;
        config.log = logsChannel;
        config.bank = bankId;
        if (lineImage) config.line = lineImage;
        if (orderRoom) {
            orderChannel = orderRoom;
            config.orderRoom = orderRoom;
        }

        await interaction.reply({
            content: `✅ تم تحديث الإعدادات الأساسية بنجاح!\n\n` +
                    `**🛡️ shop-admin:** <@&${shopAdmin}>\n` +
                    `**📋 logs:** <#${logsChannel}>\n` +
                    `**🏦 bank:** <@${bankId}>\n` +
                    `**📏 line:** ${lineImage ? '✅ تم التحديث' : '❌ لم يتم تحديده'}\n` +
                    `**📋 order-room:** ${orderRoom ? `<#${orderRoom}>` : '❌ لم يتم تحديده'}`,
            ephemeral: true
        });
    } else if (interaction.customId === 'admins_setup_modal') {
        const orderAdmin = interaction.fields.getTextInputValue('order_admin');
        const auctionAdmin = interaction.fields.getTextInputValue('auction_admin');
        const auctionRoom = interaction.fields.getTextInputValue('auction_room');

        if (orderAdmin) config.orderAdmin = orderAdmin;
        if (auctionAdmin) config.auctionAdmin = auctionAdmin;
        if (auctionRoom) {
            config.auctionChannel = auctionRoom;
            // تحديث المتغير العام أيضاً إذا لزم الأمر
        }

        await interaction.reply({
            content: `✅ تم تحديث إعدادات الإدارة بنجاح!\n\n` +
                    `**📋 order-admin:** ${orderAdmin ? `<@${orderAdmin}>` : '❌ لم يتم تحديده'}\n` +
                    `**🏆 auction-admin:** ${auctionAdmin ? `<@${auctionAdmin}>` : '❌ لم يتم تحديده'}\n` +
                    `**🏆 auction-room:** ${auctionAdmin ? `<#${auctionRoom}>` : '❌ لم يتم تحديده'}`,
            ephemeral: true
        });
    } else if (interaction.customId === 'tickets_setup_modal') {
        const orderTicket = interaction.fields.getTextInputValue('order_ticket');
        const auctionTicket = interaction.fields.getTextInputValue('auction_ticket');
        const category = interaction.fields.getTextInputValue('category');

        if (orderTicket) config.orderTicket = orderTicket;
        if (auctionTicket) config.auctionTicket = auctionTicket;
        if (category) config.catagory = category;

        await interaction.reply({
            content: `✅ تم تحديث إعدادات التذاكر بنجاح!\n\n` +
                    `**🎫 order-ticket:** ${orderTicket ? `<#${orderTicket}>` : '❌ لم يتم تحديده'}\n` +
                    `**🎫 auction-ticket:** ${auctionTicket ? `<#${auctionTicket}>` : '❌ لم يتم تحديده'}\n` +
                    `**📁 category:** ${category ? `<#${category}>` : '❌ لم يتم تحديده'}`,
            ephemeral: true
        });
    } else if (interaction.customId === 'normal_mentions_modal') {
        const everyonePrice = parseInt(interaction.fields.getTextInputValue('everyone_price')) || config.every;
        const herePrice = parseInt(interaction.fields.getTextInputValue('here_price')) || config.here;
        const shopMentionPrice = parseInt(interaction.fields.getTextInputValue('shop_mention_price')) || 5000;

        config.every = everyonePrice;
        config.here = herePrice;
        config.shopMentionPrice = shopMentionPrice;

        await interaction.reply({
            content: `✅ تم تحديث أسعار المنشنات العادية بنجاح!\n\n` +
                    `**📢 الأسعار الجديدة:**\n` +
                    `• منشن @everyone: ${config.every.toLocaleString()} كرديت\n` +
                    `• منشن @here: ${config.here.toLocaleString()} كرديت\n` +
                    `• منشن المتجر: ${config.shopMentionPrice.toLocaleString()} كرديت\n\n` +
                    `**💡 هذه الأسعار تطبق على منشنات المتاجر العادية فقط**`,
            ephemeral: true
        });
    } else if (interaction.customId === 'order_mentions_modal') {
        const orderEveryonePrice = parseInt(interaction.fields.getTextInputValue('order_everyone_price')) || config.oeverey;
        const orderHerePrice = parseInt(interaction.fields.getTextInputValue('order_here_price')) || config.ohere;
        const orderDescription = interaction.fields.getTextInputValue('order_description') || '';

        config.oeverey = orderEveryonePrice;
        config.ohere = orderHerePrice;
        config.orderDescription = orderDescription;

        await interaction.reply({
            content: `✅ تم تحديث أسعار منشنات الطلبات بنجاح!\n\n` +
                    `**📋 الأسعار الجديدة:**\n` +
                    `• منشن @everyone للطلبات: ${config.oeverey.toLocaleString()} كرديت\n` +
                    `• منشن @here للطلبات: ${config.ohere.toLocaleString()} كرديت\n` +
                    (orderDescription ? `\n**📝 الوصف:** ${orderDescription}` : '') +
                    `\n\n**💡 هذه الأسعار تطبق على طلبات المشتريات فقط**`,
            ephemeral: true
        });
    } else if (interaction.customId === 'auction_mentions_modal') {
        const auctionEveryonePrice = parseInt(interaction.fields.getTextInputValue('auction_everyone_price')) || config.oeverey;
        const auctionHerePrice = parseInt(interaction.fields.getTextInputValue('auction_here_price')) || config.ohere;
        const auctionDescription = interaction.fields.getTextInputValue('auction_description') || '';

        // تحديث أسعار المزادات (نفس أسعار الطلبات حالياً)
        config.auctionEveryone = auctionEveryonePrice;
        config.auctionHere = auctionHerePrice;
        config.auctionDescription = auctionDescription;

        await interaction.reply({
            content: `✅ تم تحديث أسعار منشنات المزادات بنجاح!\n\n` +
                    `**🏆 الأسعار الجديدة:**\n` +
                    `• منشن @everyone للمزادات: ${auctionEveryonePrice.toLocaleString()} كرديت\n` +
                    `• منشن @here للمزادات: ${auctionHerePrice.toLocaleString()} كرديت\n` +
                    (auctionDescription ? `\n**📝 الوصف:** ${auctionDescription}` : '') +
                    `\n\n**💡 هذه الأسعار تطبق على المزادات فقط**`,
            ephemeral: true
        });
    } else if (interaction.customId === 'shop_prices_modal') {
        const platinumPrice = parseInt(interaction.fields.getTextInputValue('platinum_price')) || types[0].price;
        const grandmasterPrice = parseInt(interaction.fields.getTextInputValue('grandmaster_price')) || types[1].price;
        const shopPriceNote = interaction.fields.getTextInputValue('shop_price_note') || '';

        // تحديث أسعار أول متجرين كمثال
        types[0].price = platinumPrice;
        types[1].price = grandmasterPrice;
        config.shopPriceNote = shopPriceNote;

        await interaction.reply({
            content: `✅ تم تحديث أسعار المتاجر بنجاح!\n\n` +
                    `**🏪 الأسعار الجديدة:**\n` +
                    `• ${types[0].badge} ${types[0].name}: ${platinumPrice.toLocaleString()} كرديت\n` +
                    `• ${types[1].badge} ${types[1].name}: ${grandmasterPrice.toLocaleString()} كرديت\n` +
                    (shopPriceNote ? `\n**📝 ملاحظة:** ${shopPriceNote}` : '') +
                    `\n\n**💡 يمكنك تعديل باقي أنواع المتاجر من ملف types.js**`,
            ephemeral: true
        });
    } else if (interaction.customId === 'extra_services_modal') {
        const removeWarningPrice = parseInt(interaction.fields.getTextInputValue('remove_warning_price')) || 2;
        const enableShopPrice = parseInt(interaction.fields.getTextInputValue('enable_shop_price')) || 5000;
        const changeNamePrice = parseInt(interaction.fields.getTextInputValue('change_name_price')) || 1;

        config.removeWarningPrice = removeWarningPrice;
        config.enableShopPrice = enableShopPrice;
        config.changeNamePrice = changeNamePrice;

        await interaction.reply({
            content: `✅ تم تحديث أسعار الخدمات الإضافية بنجاح!\n\n` +
                    `**💰 الأسعار الجديدة:**\n` +
                    `• إزالة التحذير الواحد: ${removeWarningPrice.toLocaleString()} كرديت\n` +
                    `• تفعيل متجر معطل: ${enableShopPrice.toLocaleString()} كرديت\n` +
                    `• تغيير اسم متجر: ${changeNamePrice.toLocaleString()} كرديت\n\n` +
                    `**💡 ملاحظة:** تغيير نوع المتجر = نصف سعر المتجر الجديد`,
            ephemeral: true
        });
    } else if (interaction.customId === 'prices_config_modal') {
        // Keep for backward compatibility
        const everyonePrice = parseInt(interaction.fields.getTextInputValue('everyone_price')) || config.every;
        const herePrice = parseInt(interaction.fields.getTextInputValue('here_price')) || config.here;
        const orderEveryonePrice = parseInt(interaction.fields.getTextInputValue('order_everyone_price')) || config.oeverey;
        const orderHerePrice = parseInt(interaction.fields.getTextInputValue('order_here_price')) || config.ohere;
        const shopMentionPrice = parseInt(interaction.fields.getTextInputValue('shop_mention_price')) || 5000;

        config.every = everyonePrice;
        config.here = herePrice;
        config.oeverey = orderEveryonePrice;
        config.ohere = orderHerePrice;
        config.shopMentionPrice = shopMentionPrice;

        await interaction.reply({
            content: `✅ تم تحديث جميع الأسعار بنجاح! استخدم \`/edit-prices type:view_all\` لعرض الأسعار الجديدة`,
            ephemeral: true
        });
    } else if (interaction.customId === 'encryption_modal') {
        const oldWord = interaction.fields.getTextInputValue('old_word');
        const newWord = interaction.fields.getTextInputValue('new_word');

        // إضافة الكلمة الجديدة لقائمة التشفير
        replace.push({ word: oldWord, replace: newWord });

        await interaction.reply({
            content: `✅ تم إضافة كلمة التشفير:\n**قبل:** ${oldWord}\n**بعد:** ${newWord}`,
            ephemeral: true
        });
    } else if (interaction.customId === 'remove_warning_amount_modal') {
        const warningAmount = interaction.fields.getTextInputValue('warning_amount');

        if (isNaN(warningAmount) || parseInt(warningAmount) <= 0) {
            return interaction.reply({
                content: 'يجب إدخال رقم صحيح أكبر من صفر',
                ephemeral: true
            });
        }

        const shopData = await db.get(`shop_${interaction.channel.id}`);
        if (!shopData) {
            return interaction.reply({
                content: 'هذا الشات ليس متجراً!',
                ephemeral: true
            });
        }

        const currentWarns = shopData.warns || 0;
        const amountToRemove = parseInt(warningAmount);

        if (currentWarns < amountToRemove) {
            return interaction.reply({
                content: `لا يمكن إزالة ${amountToRemove} تحذيرات والمتجر لديه ${currentWarns} تحذيرات فقط!`,
                ephemeral: true
            });
        }

        // التحقق من أن المستخدم هو صاحب المتجر أو مساعد له
        const shopPartners = shopData.partners || [];
        const isOwner = interaction.user.id === shopData.owner;
        const isHelper = shopPartners.includes(interaction.user.id);

        if (!isOwner && !isHelper) {
            return interaction.reply({
                content: 'لا يمكنك استخدام متجر ليس لك',
                ephemeral: true
            });
        }

        // حساب التكلفة لإزالة التحذير
        const pricePerWarning = 2; // 2 كرديت لكل تحذير
        const totalPrice = amountToRemove * pricePerWarning;
        const tax = Math.floor(totalPrice * 20 / 19 + 1);

        const paymentEmbed = new EmbedBuilder()
            .setTitle('💰 دفع لإزالة التحذير')
            .setDescription(`**لإزالة ${amountToRemove} تحذير من متجرك، يجب دفع المبلغ التالي:**`)
            .addFields(
                { name: 'عدد التحذيرات:', value: amountToRemove.toString(), inline: true },
                { name: 'السعر لكل تحذير:', value: pricePerWarning.toLocaleString(), inline: true },
                { name: 'إجمالي المبلغ:', value: totalPrice.toLocaleString(), inline: true },
                { name: 'المبلغ مع الضريبة:', value: tax.toLocaleString(), inline: true }
            )
            .setColor('#FFA500')
            .setFooter({ text: 'Dev By: ibro & yzn' })
            .setTimestamp();

        await interaction.reply({ embeds: [paymentEmbed] });

        await interaction.followUp({
            content: `#credit ${config.bank} ${tax}`
        });

        // حفظ بيانات عملية الدفع
        await db.set(`remove_warning_payment_${interaction.user.id}`, {
            shopId: interaction.channel.id,
            warningAmount: amountToRemove,
            totalPrice: totalPrice,
            tax: tax,
            timestamp: Date.now()
        });

        // مراقبة الدفع
        const filter = (message) => {
            return (
                message.author.id === config.probot &&
                (message.content.includes(':moneybag:') || message.content.includes('💰')) &&
                (message.content.includes(interaction.user.username) ||
                 message.content.includes(interaction.user.tag) ||
                 message.content.includes(interaction.user.displayName)) &&
                message.content.includes(config.bank)
            );
        };

        const collector = interaction.channel.createMessageCollector({
            filter,
            max: 1,
            time: 120000
        });

        collector.on('collect', async (collected) => {
            const transferredAmount = extractAmountFromMessage(collected.content);

            if (transferredAmount >= totalPrice) {
                // إزالة التحذيرات
                await db.sub(`shop_${interaction.channel.id}.warns`, amountToRemove);
                const newWarns = currentWarns - amountToRemove;

                // تحديث الرسالة الأصلية لتبقى مرئية
                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ تم إزالة التحذير بنجاح')
                    .setDescription(`**تم الدفع وإزالة التحذيرات**`)
                    .addFields(
                        { name: 'التحذيرات المُزالة:', value: amountToRemove.toString(), inline: true },
                        { name: 'التحذيرات المتبقية:', value: newWarns.toString(), inline: true },
                        { name: 'المبلغ المدفوع:', value: transferredAmount.toLocaleString(), inline: true }
                    )
                    .setColor('#00FF00')
                    .setFooter({ text: 'Dev By: ibro & yzn' })
                    .setTimestamp();

                const disabledButton = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`removed_warning`)
                            .setLabel(`✅ تم الإزالة بنجاح`)
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(true)
                    );

                // تحديث الرسالة الأصلية بدلاً من حذفها
                await interaction.message.edit({
                    embeds: [successEmbed],
                    components: [disabledButton]
                });

                // إذا كان المتجر مقفل وأصبح عدد التحذيرات أقل من 5، قم بإعادة تفعيله
                if (shopData.status === "0" && newWarns < 5) {
                    const shop = interaction.guild.channels.cache.get(shopId);
                    if (shop) {
                        await shop.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                            ViewChannel: true,
                        });
                        await db.set(`shop_${shopId}.status`, "1");

                        const unlockEmbed = new EmbedBuilder()
                            .setTitle('🔓 تم إعادة تفعيل المتجر')
                            .setDescription('تم إعادة تفعيل المتجر بعد إزالة التحذيرات')
                            .addFields(
                                { name: 'صاحب المتجر:', value: `<@${shopData.owner}>` },
                                { name: 'التحذيرات الحالية:', value: newWarns.toString() }
                            )
                            .setColor('#00FF00')
                            .setFooter({ text: 'Dev By: ibro & yzn' })
                            .setTimestamp();

                        await shop.send({ embeds: [unlockEmbed] });
                    }
                }

                // إرسال لوج
                const logChannel = interaction.guild.channels.cache.get(config.commandlog);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('تم إزالة تحذير متجر بالدفع')
                        .setDescription(`صاحب المتجر: <@${interaction.user.id}>`)
                        .addFields(
                            { name: 'المتجر:', value: `<#${shopId}>`, inline: true },
                            { name: 'التحذيرات المُزالة:', value: warningAmount.toString(), inline: true },
                            { name: 'التحذيرات الحالية:', value: newWarns.toString(), inline: true },
                            { name: 'المبلغ المدفوع:', value: transferredAmount.toLocaleString(), inline: true }
                        )
                        .setFooter({ text: 'Dev By: ibro & yzn' })
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] });
                }

                // حذف بيانات الدفع
                await db.delete(`remove_warning_payment_${interaction.user.id}`);
            } else {
                await interaction.channel.send({
                    content: `❌ المبلغ المحول (${transferredAmount.toLocaleString()}) غير كافي. المطلوب: ${totalPrice.toLocaleString()}`
                });
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                await interaction.channel.send({
                    content: `❌ انتهى وقت الدفع لإزالة التحذير. يرجى المحاولة مرة أخرى.`
                });
                await db.delete(`remove_warning_payment_${interaction.user.id}`);
            }
        });

    } else if (interaction.customId === 'change_name_modal') {
        const newName = interaction.fields.getTextInputValue('new_name');
        const userData = await db.get(`change_name_${interaction.user.id}`);

        if (!userData || !userData.paid) {
            return interaction.reply({
                content: 'لم يتم العثور على عملية دفع صحيحة',
                ephemeral: true
            });
        }

        const shop = interaction.guild.channels.cache.get(userData.shopId);
        if (!shop) {
            return interaction.reply({
                content: 'لم يتم العثور على المتجر',
                ephemeral: true
            });
        }

        const formattedName = newName.replaceAll(' ', '・');
        const fullName = `${config.prefix}${formattedName}`;

        await shop.setName(fullName);
        await db.delete(`change_name_${interaction.user.id}`);

        await interaction.reply({
            content: `✅ تم تغيير اسم المتجر إلى: ${fullName}`,
            ephemeral: true
        });
    } else if (interaction.customId === 'mention_modal') {
        const amount = interaction.fields.getTextInputValue('amount');
        if (isNaN(amount)) {
            return interaction.reply({
                content: ' **العدد المدخل يجب ان يكون ارقام فقط**',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('شراء منشنات')
            .setDescription(`**- عزيزي التاجر لقد طلبت شراء منشنات\n- عدد المنشنات : \`${amount}\`\nاختار ادناه نوع المنشنات التي تريد شرائها.**`)
            .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('here' + amount)
                    .setLabel('منشن هير')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('everyone' + amount)
                    .setLabel('منشن افري')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('الغاء')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
}

// معالجة شراء نوع المنشن
async function handleMentionPurchase(interaction) {
    const sellerId = await db.get(`shop_${interaction.channel.id}.owner`);

    if (interaction.user.id !== sellerId) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('Not Shop Owner')
            .setDescription(`You are not the owner of the shop. the owner is <@${sellerId || 'Not found in the database'}>`)
        return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (interaction.customId.startsWith('here')) {
        const amount = parseInt(interaction.customId.slice("here".length));
        await processMentionPurchase(interaction, amount, config.here, 'here');
    } else if (interaction.customId.startsWith('everyone')) {
        const amount = parseInt(interaction.customId.slice("everyone".length));
        await processMentionPurchase(interaction, amount, config.every, 'every');
    }
}

// معالجة عملية شراء المنشن
async function processMentionPurchase(interaction, amount, price, type) {
    const result = amount * price;
    const tax = Math.floor(result * (20 / 19) + 1);

    const embed = new EmbedBuilder()
        .setDescription(`لقد اخترت منشنات ${type === 'here' ? 'هير' : 'افري'}\nالعدد : \`${amount}\`\nالسعر : \`${result}\`\n\`\`\`#credit ${config.bank} ${tax}\`\`\``)
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('here')
                .setLabel('منشن هير')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('everyone')
                .setLabel('منشن افري')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true)
        );

    await interaction.update({ embeds: [embed], components: [row] });
    await interaction.followUp({
        content: `#credit ${config.bank} ${tax}`,
        ephemeral: false
    });

    // مراقبة الدفع
    const collectorFilter = m => m.author.bot === true && m.author.id === config.probot;
    const collector = interaction.channel.createMessageCollector({
        filter: collectorFilter,
        time: 60000,
    });

    let iscollected = false;
    collector.on("collect", async (collected) => {
        await sendDebugLog('تم اكتشاف رسالة من البوت: ' + collected.content, interaction.channel.name, interaction.user.username);

        // التحقق من أن الرسالة تحتوي على رمز المgل ومعلومات التحويل
        if (collected.content.includes(':moneybag:') || collected.content.includes('💰')) {
            await sendDebugLog('رسالة دفع محتملة: ' + collected.content, interaction.channel.name, interaction.user.username);

            // التحقق من وجود اسم المستخدم والبنك في الرسالة
            const hasUsername = collected.content.includes(interaction.user.username) ||
                              collected.content.includes(interaction.user.tag) ||
                              collected.content.includes(interaction.user.displayName);
            const hasBank = collected.content.includes(config.bank);

            await sendDebugLog(`فحص الرسالة - المستخدم: ${hasUsername} | البنك: ${hasBank}`, interaction.channel.name, interaction.user.username);

            if (hasUsername && hasBank) {
                // البحث عن المبلغ بصيغ مختلفة
                let transferredAmount = 0;

                // أنماط البحث المحسنة
                const patterns = [
                    /has transferred `\$([0-9,]+)`/g,
                    /قام بتحويل `\$([0-9,]+)`/g,
                    /transferred `\$([0-9,]+)`/g,
                    /`\$([0-9,]+)`/g,
                    /\$([0-9,]+)/g,
                    /([0-9,]+)\$/g
                ];

                for (const pattern of patterns) {
                    const matches = [...collected.content.matchAll(pattern)];
                    for (const match of matches) {
                        const amount_found = parseInt(match[1].replace(/,/g, ''));
                        if (amount_found > 0) {
                            transferredAmount = amount_found;
                            await sendDebugLog(`تم العثور على المبلغ: ${transferredAmount} بالنمط: ${pattern}`, interaction.channel.name, interaction.user.username);
                            break;
                        }
                    }
                    if (transferredAmount > 0) break;
                }

                if (transferredAmount > 0) {
                    await sendDebugLog(`المبلغ المحول: ${transferredAmount} | المطلوب: ${result}`, interaction.channel.name, interaction.user.username);

                    // التحقق من أن المبلغ يساوي السعر المطلوب أو أكثر
                    if (transferredAmount >= result) {
                        await sendDebugLog('✅ تم تأكيد الدفع! جاري إضافة المنشنات...', interaction.channel.name, interaction.user.username);
                        iscollected = true;
                        collector.stop('DONE');

                        // حذف رسالة الكرديت بعد تأكيد الدفع
                        const creditMessages = await interaction.channel.messages.fetch({ limit: 10 });
                        const creditMessage = creditMessages.find(msg =>
                            msg.author.id === interaction.client.user.id &&
                            msg.content.includes(`#credit ${config.bank} ${tax}`)
                        );
                        if (creditMessage) {
                            try {
                                await creditMessage.delete();
                            } catch (error) {
                                console.error('خطأ في حذف رسالة الكرديت:', error);
                            }
                        }

                        const data = await db.get(`shop_${interaction.channel.id}`);
                        if (data) {
                            await db.add(`shop_${interaction.channel.id}.${type}`, amount);

                            // تحديث الإمبد الأصلي بدلاً من إرسال رسالة جديدة
                            const successEmbed = new EmbedBuilder()
                                .setTitle("✅ تمت عملية الشراء بنجاح")
                                .setDescription(`**تم شراء منشنات ${type === 'here' ? 'هير' : 'افري'} بنجاح**`)
                                .addFields(
                                    { name: 'العدد المشترى:', value: amount.toString(), inline: true },
                                    { name: 'المنشنات الحالية:', value: `• everyone: ${data.every + (type === 'every' ? amount : 0)}\n• here: ${data.here + (type === 'here' ? amount : 0)}`, inline: false }
                                )
                                .setColor('#00FF00')
                                .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
                                .setTimestamp();

                            await interaction.editReply({ embeds: [successEmbed], components: [] });
                        }
                        return;
                    } else {
                        await sendDebugLog(`❌ المبلغ غير كافي: ${transferredAmount} | المطلوب: ${result}`, interaction.channel.name, interaction.user.username);
                    }
                } else {
                    await sendDebugLog('❌ لا يمكن استخراج المبلغ من الرسالة', interaction.channel.name, interaction.user.username);
                }
            } else {
                await sendDebugLog('❌ الرسالة لا تحتوي على المستخدم أو البنك المطلوب', interaction.channel.name, interaction.user.username);
            }
        } else {
            await sendDebugLog('الرسالة ليست رسالة دفع', interaction.channel.name, interaction.user.username);
        }
    });

    collector.on("end", (collected, reason) => {
        if (reason === 'DONE') {
            // تمت العملية بنجاح
            return;
        }

        if (iscollected) return;

        // التحقق من وجود القناة عند انتهاء الوقت
        if (interaction.channel && !interaction.channel.deleted) {
            const embedf = new EmbedBuilder()
                .setTitle("انتهاء الوقت")
                .setDescription("انتهى الوقت لم يتم تحويل المبلغ")
                .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            interaction.channel.send({ embeds: [embedf] }).catch(error => {
                console.error('خطأ في إرسال رسالة انتهاء الوقت:', error);
            });
        }
    });
}

// دوال إضافية للأوامر
async function sendBuyTicket(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const chann = interaction.options.getChannel('channel');

    if (!interaction.member.roles.cache.has(config.Admin)) {
        return interaction.editReply(`ليس لديك صلاحية لاستخدام هذا الأمر - تحتاج رتبة <@&${config.Admin}>`);
    }

    const embed = new EmbedBuilder()
        .setTitle('شراء متجر')
        .setDescription('**__قم بالضغط على الزر في الاسفل لشراء متجر__**')
        .setImage(config.info)
        .setColor('#000100');

    const row = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
            .setCustomId('buy_shop_ticket')
            .setLabel('شراء متجر')
            .setStyle(ButtonStyle.Primary)
        );

    const closeRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('إغلاق التذكرة')
                .setStyle(ButtonStyle.Danger)
        );

    if (chann) {
        const uio = interaction.guild.channels.cache.get(chann.id);
        if (!uio) {
            return interaction.editReply('**الـروم غـيـر مـوجـود داخـل الـسـيـرفـر او لـم أسـتـطـع إيـجـاده**');
        }
        await chann.send({ embeds: [embed], components: [row, closeRow] });
        await interaction.editReply('**تـم إرسـال الـرس الـه بـنـجـاح**');
    } else {
        await interaction.channel.send({ embeds: [embed], components: [row, closeRow] });
        await interaction.editReply('**تـم إرسـال الـرسـالـه بـنـجـاح**');
    }
}

async function sendOrderTicket(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const chann = interaction.options.getChannel('channel');

    if (!interaction.member.roles.cache.has(config.Admin)) {
        return interaction.editReply(`ليس لديك صلاحية لاستخدام هذا الأمر - تحتاج رتبة <@&${config.Admin}>`);
    }

    const embed = new EmbedBuilder()
        .setTitle('شراء منشور')
        .setDescription('**__قم بالضغط على الزر في الاسفل لشراء منشور__**')
        .setImage(config.info)
        .setColor('#000100');

    const row = new ActionRowBuilder()
        .addComponents(new ButtonBuilder()
            .setCustomId('buy_order_ticket')
            .setLabel('شراء منشور')
            .setStyle(ButtonStyle.Primary)
        );

    const closeRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('إغلاق التذكرة')
                .setStyle(ButtonStyle.Danger)
        );

    if (chann) {
        const uio = interaction.guild.channels.cache.get(chann.id);
        if (!uio) {
            return interaction.editReply('**الـروم غـيـر مـوجـود داخـل الـسـيـرفـر او لـم أسـتـطـع إيـجـاده**');
        }
        await chann.send({ embeds: [embed], components: [row, closeRow] });
        await interaction.editReply('**تـم إرسـال الـرسـالـه بـنـجـاح**');
    } else {
        await interaction.channel.send({ embeds: [embed], components: [row, closeRow] });
        await interaction.editReply('**تـم إرسـال الـرسـالـه بـنـجـاح**');
    }
}

async function handleOrder(interaction) {
    const member = interaction.options.getMember("الشخص");
    const order = interaction.options.getString("الطلب");
    const mention = interaction.options.getString("المنشن");

    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.guild.channels.cache.get(orderChannel);
    if (!channel) {
        return interaction.editReply({
            content: "❌ لم يتم العثور على القناة لإرسال الطلب.",
        });
    }

    const orderEmbed = new EmbedBuilder()
        .setTitle('📋 طلب جديد')
        .addFields(
            { name: 'صاحب الطلب:', value: member.toString(), inline: true },
            { name: 'المطلوب:', value: order, inline: true },
            { name: 'المنشن:', value: mention, inline: true }
        )
        .setColor('#0099FF')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await channel.send({ embeds: [orderEmbed] });
    await interaction.editReply({ content: `✅ **تم إرسال الطلب بنجاح**` });
}

async function handleAuction(interaction) {
    const member = interaction.options.getMember("الشخص");
    const item = interaction.options.getString("السلعة");
    const price = interaction.options.getString("السعر");
    const mention = interaction.options.getString("المنشن");
    const time = interaction.options.getString("الوقت");
    const picture1 = interaction.options.getString("الصورة1");
    const picture2 = interaction.options.getString("الصورة2");
    const picture3 = interaction.options.getString("الصورة3");

    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.guild.channels.cache.get(config.auctionChannel); // Use config.auctionChannel
    if (!channel) return interaction.editReply(`**القناة غير صحيحة**`);

    const minutes = parseInt(time.replace("m", ""));
    if (isNaN(minutes) || minutes <= 0) {
        return interaction.editReply("*الرجاء إدخال وقت صحيح بصيغة m (مثل: 5m)*");
    }

    const timestamp = Math.floor(Date.now() / 1000) + minutes * 60;
    const imageRegex = /\.(jpeg|jpg|png|gif)(\?.*)?$/i;
    const images = [picture1, picture2, picture3].filter(
        (url) => url && imageRegex.test(url)
    );

    // فتح القناة للجميع
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        ViewChannel: true,
        SendMessages: true
    });

    const auctionEmbed = new EmbedBuilder()
        .setTitle('🏆 مزاد جديد')
        .setDescription(`**صاحب المزاد:** ${member}\n**السلعة:** ${item}\n**سعر البداية:** ${price}\n**المنشن:** ${mention}`)
        .addFields(
            { name: '⏰ وقت انتهاء المزاد:', value: `<t:${timestamp}:R>`, inline: true },
            { name: '📊 الحالة:', value: 'نشط', inline: true }
        )
        .setColor('#FFD700')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    if (images.length > 0) {
        auctionEmbed.setImage(images[0]);
    }

    const files = images.slice(1).map((url) => ({ attachment: url }));

    const auctionMessage = await channel.send({
        content: mention,
        embeds: [auctionEmbed],
        files: files.length ? files : undefined,
    });

    auctions.set(auctionMessage.id, {
        channelId: channel.id,
        endTime: timestamp,
        interaction,
        messageId: auctionMessage.id
    });

    await interaction.editReply({ content: "✅ تم بدء المزاد بنجاح!" });

    setTimeout(async () => {
        if (auctions.has(auctionMessage.id)) {
            // حذف رسالة المزاد
            try {
                await auctionMessage.delete();
            } catch (error) {
                console.log('لا يمكن حذف رسالة المزاد:', error);
            }

            // إغلاق القناة
            await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                ViewChannel: false,
                SendMessages: false
            });

            const endEmbed = new EmbedBuilder()
                .setTitle('⏰ انتهى المزاد')
                .setDescription(`انتهى المزاد للسلعة: **${item}**`)
                .setColor('#FF4500')
                .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            await channel.send({ embeds: [endEmbed] });
            auctions.delete(auctionMessage.id);
        }
    }, minutes * 60 * 1000);
}

// دوال إضافية
async function warnShop(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const shop = interaction.options.getChannel('shop');
    const amount = interaction.options.getNumber('amount');
    const reason = interaction.options.getString('reason');
    const proof = interaction.options.getAttachment('proof');

    if (amount === 0) return interaction.editReply({ content: `لا يمكن إضافة 0 تحذيرات` });

    const data = await db.get(`shop_${shop.id}`);
    if (!data) {
        return interaction.editReply({ content: `** هـصة الـروم لـيـسـت مـتـجـرا **` });
    }

    await db.add(`shop_${shop.id}.warns`, amount);
    const newWarns = (data.warns || 0) + amount;

    const embed = new EmbedBuilder()
        .setTitle(`تـم تـحـذيـر الـمـتـجـر`)
        .setDescription(`الـمـسـؤول: <@${interaction.user.id}>`)
        .addFields(
            { name: 'عـدد الـتـحـذيـرات الـكـامـل:', value: newWarns.toString(), inline: true },
            { name: 'سـبـب الـتـحـذيـر:', value: reason, inline: true },
            { name: 'عـدم تـشـفـيـر الـكـلـمـات النـاتـجـة:', value: 'خـاص', inline: true },
            { name: 'الـمـسـؤول:', value: 'تـلـقـائـي', inline: true },
            { name: 'الـوقـت:', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
        )
        .setImage(proof?.url || null)
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp()
        .setColor('#FF0000');

    const removeButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`remove_warning_${shop.id}_${amount}`)
                .setLabel('إزالة التحذير')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('💰')
        );

    await shop.send({ content: `<@${data.owner}>`, embeds: [embed], components: [removeButton] });

    // فحص إذا وصلت التحذيرات لـ 5 أو أكثر
    if (newWarns >= 7) {
        // حذف المتجر نهائياً
        const deleteEmbed = new EmbedBuilder()
            .setTitle('🗑️ تم حذف المتجر نهائياً')
            .setDescription(`**تم حذف المتجر بسبب وصول التحذيرات إلى 7 تحذيرات**`)
            .addFields(
                { name: 'عدد التحذيرات:', value: newWarns.toString() },
                { name: 'المالك:', value: `<@${data.owner}>` },
                { name: 'اسم المتجر:', value: shop.name }
            )
            .setColor('#8B0000')
            .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        // إرسال إشعار للوج
        const logChannel = interaction.guild.channels.cache.get(config.log);
        if (logChannel) {
            await logChannel.send({
                content: '@everyone',
                embeds: [deleteEmbed]
            });
        }

        // حذف بيانات المتجر من قاعدة البيانات
        await db.delete(`shop_${shop.id}`);

        // حذف القناة
        await shop.delete();

    } else if (newWarns >= 5) {
        // قفل المتجر
        await shop.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            ViewChannel: false,
        });

        await db.set(`shop_${shop.id}.status`, "0");

        const lockEmbed = new EmbedBuilder()
            .setTitle('🔒 تم إغلاق المتجر')
            .setDescription(`**تم إغلاق المتجر بسبب وصول التحذيرات إلى 5 تحذيرات**`)
            .addFields(
                { name: 'عدد التحذيرات:', value: newWarns.toString() },
                { name: 'المالك:', value: `<@${data.owner}>` },
                { name: 'تحذير:', value: 'عند وصول التحذيرات إلى 7 سيتم حذف المتجر نهائياً' }
            )
            .setColor('#8B0000')
            .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await shop.send({ content: `<@${data.owner}>`, embeds: [lockEmbed] });

        // إرسال إشعار للوج
        const logChannel = interaction.guild.channels.cache.get(config.log);
        if (logChannel) {
            await logChannel.send({
                content: '@everyone',
                embeds: [lockEmbed]
            });
        }
    }

    await interaction.editReply({ content: `**تـم تـحـذيـر الـمـتـجـر ${shop} بـنـجـاح - التحذيرات الآن: ${newWarns}**` });

    // إرسال لوج
    const logg = interaction.guild.channels.cache.get(config.commandlog);
    if (logg) {
        const embedlog = new EmbedBuilder()
            .setTitle(`تـم تـحـذيـر مـتـجـر`)
            .setDescription(`الـمـسـؤول : <@${interaction.user.id}>`)
            .addFields(
                { name: 'المـتـجـر:', value: `<#${shop.id}>`, inline: true },
                { name: 'عـدد الـتـحـذيـرات الـجـديـدة', value: amount.toString(), inline: true },
                { name: 'إجـمـالـي الـتـحـذيـرات', value: newWarns.toString(), inline: true },
                { name: 'سـبـب الـتـحـذيـر', value: reason, inline: true }
            )
            .setImage(proof?.url || null)
            .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await logg.send({ embeds: [embedlog] });
    }
}

async function unwarnShop(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const shop = interaction.options.getChannel('shop');
    const amount = interaction.options.getNumber('amount');

    const data = await db.get(`shop_${shop.id}`);
    if (!data) {
        return interaction.editReply({ content: `** هـذة الـروم لـيـسـت مـتـجـرا **` });
    }

    if (!data.warns) data.warns = 0;
    if (data.warns - amount < 0) {
        return interaction.editReply({ content: `** بـتـشـيـل ${amount} كـيـف و عـدد تـحـذيـرات المـتـجـر ${data.warns} اصـلا **` });
    }

    await db.sub(`shop_${shop.id}.warns`, amount);

    await interaction.editReply({ content: `**تـم ازالـة ${amount} تـحـذيـرات مـن مـتـجـر بـ نـجـاح ${shop}**` });
    await shop.send({ content: `**تـم ازالـة ${amount} تـحـذيـرات مـن المـتـجـر**` });
}

async function disableShop(interaction) {
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
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await shop.send({ content: `<@${datap.owner}>`, embeds: [embedlog] });
    await interaction.editReply('**تـم تـعـطـيـل الـمـتـجـر بـنـجـاح**');
}

async function activateShop(interaction) {
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
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await shopi.send({ embeds: [embedlog], content: `<@${shppp.owner}>` });
    await interaction.editReply('**تـم تـفـعـيـل الـمـتـجـر بـنـجـاح**');
}

// دوال إضافية
async function addMentions(interaction) {
    await interaction.deferReply();
    const shop8 = interaction.options.getChannel('shop');
    const data8 = await db.get(`shop_${shop8.id}`);
    const everyone = interaction.options.getNumber('everyone') || 0;
    const here = interaction.options.getNumber('here') || 0;
    const shopm = interaction.options.getNumber('shop_mentions') || 0;

    if (!data8) {
        return interaction.editReply({ content: `هذه القناة ليست متجراً مسجلاً` });
    }

    await db.add(`shop_${shop8.id}.every`, everyone);
    await db.add(`shop_${shop8.id}.here`, here);
    await db.add(`shop_${shop8.id}.shop`, shopm);

    await interaction.editReply({ content: `** تـم اضـافـه الـمـنـشـنـات بـنـجـاح **` });

    const shopChannel = await client.channels.fetch(shop8.id);
    await shopChannel.send(`**تـم إضـافـه مـنـشـنـات لـلـمnتـجـر **\n**__${everyone}__** أفـري ون\n**__${here}__** هـيـر\n**__${shopm}__** مـنـشـن مـتـجـر`);
}

async function showShopData(interaction) {
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
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await interaction.reply({ content: `مـعـلـومـات مـتـجـر : ${interaction.channel}`, embeds: [embed] });
}

async function showWarns(interaction) {
    const shopData = await db.get(`shop_${interaction.channel.id}`);

    if (!shopData) {
        return interaction.reply({
            content: `**هذا الشات ليس متجراً مسجلاً في قاعدة البيانات**\n\n**لإصلاح هذه المشكلة:**\n1. استخدم الأمر \`/data\` لإضافة بيانات المتجر يدوياً\n2. أو استخدم \`/fix-bot\` لإ(لاح مشاكل البوت عموماً`,
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

async function addHelper(interaction) {
    await interaction.deferReply();
    const part = interaction.options.getUser("helper");
    const shop = interaction.options.getChannel("shop");

    const data = await db.get(`shop_${shop.id}`);
    if (!data) return interaction.editReply("هذه القناة ليست متجراً مسجلاً");

    const existingPartners = data.partners || [];
    if (existingPartners.includes(part.id)) {
        return interaction.editReply(" **هـذا العـضـو عـمـيـل بـ الفـعـل فـي هـذا المـتـجـر.** ");
    }

    const shopChannel = await interaction.guild.channels.fetch(shop.id);
    await shopChannel.permissionOverwrites.edit(part.id, {
        ViewChannel: true,
        SendMessages: true,
        EmbedLinks: true,
        MentionEveryone: true,
        AttachFiles: true
    });

    existingPartners.push(part.id);
    await db.set(`shop_${shop.id}.partners`, existingPartners);

    const role = interaction.guild.roles.cache.get(config.help);
    if (role) await part.roles.add(role);

    await interaction.editReply(`**تـم اضـافـة العـمـيـل <@${part.id}> لـ المـتـجـر <#${shop.id}> بـ نـجـاح.**`);
    await shopChannel.send(`تـم إضـافـه ${part} كـ مـسـاعـد بالـمـتـجـر`);
}

async function removeHelper(interaction) {
    await interaction.deferReply();
    const part = interaction.options.getUser("helper");
    const shop = interaction.options.getChannel("shop");

    const data = await db.get(`shop_${shop.id}`);
    if (!data) return interaction.editReply("** هـذة الروم لـيـس مسجل كـ مـتـجـر **");

    const existingPartners = data.partners || [];
    if (!existingPartners.includes(part.id)) {
        return interaction.editReply(" **هـذا العـضـو لـيـس عـمـيـل فـي هـذا المـتـجـر.** ");
    }

    const shopChannel = await interaction.guild.channels.fetch(shop.id);
    await shopChannel.permissionOverwrites.delete(part.id);

    const updatedPartners = existingPartners.filter(partnerId => partnerId !== part.id);
    await db.set(`shop_${shop.id}.partners`, updatedPartners);

    const role = interaction.guild.roles.cache.get(config.help);
    if (role) await part.roles.remove(role);

    await interaction.editReply(`** الـمـسـاعـد <@${part.id}> تـم ازالـتـه مـن المـتـجـر <#${shop.id}> بـ نـجـاح.**`);
    await shopChannel.send(`** تـم ازالـة : <@${part.id}> \n كـ مـسـاعـد مـن المـتـجـر **`);
}

async function changeOwner(interaction) {
    await interaction.deferReply();
    const shop = interaction.options.getChannel('shop');
    const newOwner = interaction.options.getMember('new-owner');

    const shopData = await db.get(`shop_${shop.id}`);
    if (!shopData) {
        return interaction.editReply({ content: 'هـدة الـروم لـيـست مـتـجـرا.', ephemeral: true });
    }

    const oldOwnerId = shopData.owner;
    const oldOwner = interaction.guild.members.cache.get(oldOwnerId);

    if (!newOwner) {
        return interaction.editReply({ content: 'المـالـك الجـديـد غـيـر صـحـيـح.', ephemeral: true });
    }

    if (oldOwnerId === newOwner.id) {
        return interaction.editReply({ content: `هـذا الشـخـص : <@${newOwner.id}> هـو مـالـك المـتـجـر بـالفـعـل.`, ephemeral: true });
    }

    await shop.permissionOverwrites.delete(oldOwner.id);
    await shop.permissionOverwrites.edit(newOwner.id, {
        ViewChannel: true,
        SendMessages: true,
        EmbedLinks: true,
        MentionEveryone: true,
        AttachFiles: true
    });

    await db.set(`shop_${shop.id}.owner`, newOwner.id);

    await interaction.editReply({
        content: `تـم نـقـل مـلـكـيـة المـتـجـر :${shop} الـي : ${newOwner}`
    });

    await shop.send(`تـم نـقل مـلـكـيـة الـمـتـجـر \n مـن <@${oldOwner.id}>  \n  إلـي <@${newOwner.id}>`);
}

async function changeName(interaction) {
    await interaction.deferReply();
    const shop = interaction.options.getChannel('shop');
    const newj = interaction.options.getString('new-name');

    const chan = await interaction.guild.channels.cache.get(shop.id);
    if (!chan) {
        return interaction.editReply('**لا اسـتـطـيـع الـعـثـور عـلـي هـذه الـروم**');
    }

    const data = await db.get(`shop_${shop.id}`);
    if (!data) {
        return interaction.editReply('**هـذا الـروم لـيـس مـتـجـر**');
    }

    const naeee = newj.replaceAll(' ', '・');
    const shopType = types.find(t => t.id === chan.parentId);
    const badge = shopType ? shopType.badge : '🏪';
    const opi = `${badge}${config.prefix}${naeee}`;

    if (chan.name === opi) {
        return interaction.editReply('**هـذا هـو أسـم الـمـتـجـر بـالـفـعـل**');
    }

    if (newj.length <= 3 || newj.length > 15) {
        return interaction.editReply('**يـجـب ان يـكـون الأسـم اكـثـر مـن ثـلاث احـرف و اقـل مـن 15 حـرف **');
    }

    await chan.setName(opi);
    await interaction.editReply('**تـم تـغـيـيـر أسـم الـمـتـجـر بـنـجـاح**');
}

async function changeType(interaction) {
    await interaction.deferReply();
    const shop = interaction.options.getChannel('shop');
    const typeu = interaction.options.get('new-type').value;
    const type = types.find(x => x.id === typeu);

    if (!type) return interaction.editReply({ content: '**لم اتمكن من العثور على كاتقوري هذا النوع**', ephemeral: true });

    const shopuu = await interaction.guild.channels.cache.get(shop.id);
    if (!shopuu) {
        return interaction.editReply('**لا اسـتـطـيـع الـعـثـور عـلـي الـمـتـجـر**');
    }

    const currentType = types.find(x => x.id === shopuu.parentId);
    if (currentType && currentType.id === type.id) {
        return interaction.editReply('**هـذا هـو نـوع الـمـتـجـر بـالـفـعـل**');
    }

    await shopuu.setParent(type.id);
    await db.set(`shop_${shop.id}.type`, type.role);
    await shop.send('**تـم تـغـيـيـر الـمـتـجـر مـن `' + (currentType ? currentType.name : 'غير معروف') + '` الـي `' + type.name + '`**');
    await interaction.editReply('**تـم تـغـيـيـر نـوع الـمـتـجـر بـنـجـاح**');
}

async function deleteShop(interaction) {
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
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await dmChannel.send({ embeds: [emm] });
    await hohoho.delete();
    await db.delete(`shop_${shop.id}`);
    await interaction.editReply('**تـم حـذف الـروم بـنـجـاح**');
}

async function resetMentions(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channelssend = interaction.options.getChannel('channel') ?? interaction.channel;
    const imageembed = interaction.options.getString('image');
    const customMessage = interaction.options.getString('message');

    const channels = await interaction.guild.channels.fetch();
    await interaction.editReply('**بدات عملية اعادة تعيين المنشنات**');

    const guild = interaction.guild;
    const serverName = guild.name;
    const serverIcon = guild.iconURL();

    for (const [channelId, channel] of channels) {
        // التحقق من أن القناة هي من نوع نصية وأن لديها parent ID
        if (channel.type === ChannelType.GuildText && channel.parentId) {
            const shopData = await db.get(`shop_${channelId}`);

            // التحقق مما إذا كانت القناة متجرًا مسجلاً
            if (shopData) {
                const typeData = types.find(t => t.id === channel.parentId);

                if (typeData) {
                    // إعادة تعيين المنشنات إلى القيم الافتراضية من types.js
                    shopData.every = typeData.every;
                    shopData.here = typeData.here;
                    shopData.shop = typeData.shop;

                    await db.set(`shop_${channelId}`, shopData);

                    // إنشاء الإمبد الخاص بإعادة التعيين
                    const shopEmbed = createShopEmbed(
                        shopData.owner,
                        {
                            every: shopData.every,
                            here: shopData.here,
                            shop: shopData.shop
                        },
                        customMessage || 'تم إعادة تعيين المنشنات بنجاح.',
                        serverName,
                        serverIcon,
                        imageembed
                    );

                    // إرسال المنشن كـ content عشان يتأكد إنه يوصل
                    await channel.send({ embeds: [shopEmbed] });

                    await new Promise(res => setTimeout(res, 500)); // لتجنب الـ rate limit
                }
            }
        }
    }

    await interaction.editReply('**تمت إعادة تعيين المنشنات لجميع المتاجر.**');

    // إرسال إشعار للقناة المحددة
    if (channelssend && channelssend.id !== interaction.channel.id) {
        await channelssend.send('**تم إعادة تعيين المنشنات لجميع المتاجر في السيرفر.**');
    }

    // إرسال لوج
    const logChannel = interaction.guild.channels.cache.get(config.commandlog);
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setTitle('تم إعادة تعيين منشنات المتاجر')
            .setDescription(`المسؤول: <@${interaction.user.id}>`)
            .addFields(
                { name: 'القناة التي تم فيها الإشعار', value: channelssend.toString(), inline: true },
                { name: 'الصورة المستخدمة', value: imageembed || 'لا يوجد', inline: true },
                { name: 'الرسالة المخصصة', value: customMessage || 'لا يوجد', inline: true }
            )
            .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
    }
}

function isPublicCommand(commandName) {
    // التحقق من أن الأمر موجود في مجلد user-commands
    return userCommands.has(commandName);
}

// دوال جديدة
async function displayMentions(interaction) {
    const shopData = await db.get(`shop_${interaction.channel.id}`);

    if (!shopData) {
        return interaction.reply({ content: 'هذا الشات ليس متجراً!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
        .setTitle('📊 المنشنات المتبقية')
        .setDescription(`**المنشنات المتبقية:**\n• everyone: ${shopData.every || 0}\n• here: ${shopData.here || 0}`)
        .setColor('#0099FF')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await interaction.reply({
        embeds: [embed]
    });
}

async function addEncryptionWords(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('encryption_modal')
        .setTitle('إضافة كلمات التشفير');

    const oldWordInput = new TextInputBuilder()
        .setCustomId('old_word')
        .setLabel('الكلمة قبل التشفير')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const newWordInput = new TextInputBuilder()
        .setCustomId('new_word')
        .setLabel('الكلمة بعد التشفير')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const firstRow = new ActionRowBuilder().addComponents(oldWordInput);
    const secondRow = new ActionRowBuilder().addComponents(newWordInput);

    modal.addComponents(firstRow, secondRow);
    await interaction.showModal(modal);
}

async function changeNamePaid(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const shop = interaction.options.getChannel('shop');

    const shopData = await db.get(`shop_${shop.id}`);
    if (!shopData) {
        return interaction.editReply('هذه القناة ليست متجراً');
    }

    const embed = new EmbedBuilder()
        .setTitle('💰 دفع لتغيير اسم المتجر')
        .setDescription('لتغيير اسم المتجر، يجب دفع 1 كرديت')
        .setColor('#FFA500')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    const creditMessage = await interaction.channel.send({
        content: `\`\`\`#credit ${config.bank} 1\`\`\``
    });

    // مراقبة الدفع
    const filter = (message) => {
        return (
            message.author.id === config.probot &&
            message.content.includes(':moneybag:') &&
            message.content.includes(interaction.user.username) &&
            message.content.includes(config.bank)
        );
    };

    const collector = interaction.channel.createMessageCollector({
        filter,
        max: 1,
        time: 120000
    });

    collector.on('collect', async (collected) => {
        const transferredAmount = extractAmountFromMessage(collected.content);

        if (transferredAmount >= 1) {
            await creditMessage.delete().catch(() => {});

            const nameModal = new ModalBuilder()
                .setCustomId('change_name_modal')
                .setTitle('تغيير اسم المتجر');

            const nameInput = new TextInputBuilder()
                .setCustomId('new_name')
                .setLabel('الاسم الجديد للمتجر')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const nameRow = new ActionRowBuilder().addComponents(nameInput);
            nameModal.addComponents(nameRow);

            await interaction.followUp({
                content: 'تم تأكيد الدفع! الآن أدخل الاسم الجديد:',
                ephemeral: true
            });

            // حفظ بيانات العملية
            await db.set(`change_name_${interaction.user.id}`, {
                shopId: shop.id,
                paid: true
            });
        }
    });
}

async function changeTypePaid(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const shop = interaction.options.getChannel('shop');
    const newTypeId = interaction.options.getString('new-type');

    const newType = types.find(t => t.id === newTypeId);
    if (!newType) {
        return interaction.editReply('نوع المتجر غير صحيح');
    }

    const halfPrice = Math.floor(newType.price / 2);
    const tax = Math.floor(halfPrice * 20 / 19 + 1);

    const embed = new EmbedBuilder()
        .setTitle('💰 دفع لتغيير نوع المتجر')
        .setDescription('لتغيير نوع المتجر، يجب دفع نصف سعر المتجر الجديد')
        .addFields(
            { name: 'المبلغ مع الضريبة:', value: tax.toString() }
        )
        .setColor('#FFA500')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    const creditMessage = await interaction.channel.send({
        content: `\`\`\`#credit ${config.bank} ${tax}\`\`\``
    });

    // مراقبة الدفع
    const filter = (message) => {
        return (
            message.author.id === config.probot &&
            message.content.includes(':moneybag:') &&
            message.content.includes(interaction.user.username) &&
            message.content.includes(config.bank)
        );
    };

    const collector = interaction.channel.createMessageCollector({
        filter,
        max: 1,
        time: 120000
    });

    collector.on('collect', async (collected) => {
        const transferredAmount = extractAmountFromMessage(collected.content);

        if (transferredAmount >= halfPrice) {
            await creditMessage.delete().catch(() => {});

            const shopChannel = interaction.guild.channels.cache.get(shop.id);
            const currentType = types.find(x => x.id === shopChannel.parentId);

            await shopChannel.setParent(newType.id);
            await db.set(`shop_${shop.id}.type`, newType.role);

            await shop.send(`✅ تم تغيير نوع المتجر من \`${currentType ? currentType.name : 'غير معروف'}\` إلى \`${newType.name}\``);
            await interaction.followUp({
                content: 'تم تغيير نوع المتجر بنجاح!',
                ephemeral: true
            });
        }
    });
}

async function enableShop(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const shop = interaction.options.getChannel('shop') || interaction.channel;

    const shopData = await db.get(`shop_${shop.id}`);
    if (!shopData) {
        return interaction.editReply('هذه القناة ليست متجراً');
    }

    if (shopData.status === "1") {
        return interaction.editReply('المتجر مفعل بالفعل');
    }

    const embed = new EmbedBuilder()
        .setTitle('💰 دفع لتفعيل المتجر')
        .setDescription('لتفعيل المتجر بعد التعطيل، يجب دفع رسوم التفعيل')
        .setColor('#FFA500')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    const creditMessage = await interaction.channel.send({
        content: `\`\`\`#credit ${config.bank} 5000\`\`\``
    });

    // مراقبة الدفع
    const filter = (message) => {
        return (
            message.author.id === config.probot &&
            message.content.includes(':moneybag:') &&
            message.content.includes(interaction.user.username) &&
            message.content.includes(config.bank)
        );
    };

    const collector = interaction.channel.createMessageCollector({
        filter,
        max: 1,
        time: 120000
    });

    collector.on('collect', async (collected) => {
        const transferredAmount = extractAmountFromMessage(collected.content);

        if (transferredAmount >= 5000) {
            await creditMessage.delete().catch(() => {});

            await shop.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                ViewChannel: true,
            });
            await db.set(`shop_${shop.id}.status`, "1");

            const successEmbed = new EmbedBuilder()
                .setTitle('✅ تم تفعيل المتجر')
                .setDescription('تم تفعيل المتجر بنجاح بعد الدفع')
                .setColor('#00FF00')
                .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            await shop.send({ embeds: [successEmbed] });
        }
    });
}

function getCommands() {
    return [
        {
            name: 'fix-bot',
            description: 'إصلاح مشاكل البوت وإزالة التذاكر المفتوحة'
        },
        {
            name: 'send-panels',
            description: 'إرسال بانلات الشراء (متاجر - طلبات - منشورات)',
            options: [
                {
                    name: 'channel',
                    description: 'القناة لإرسال البانلات',
                    type: ApplicationCommandOptionType.Channel,
                    required: false
                }
            ]
        },
        {
            name: 'price-panels',
            description: 'إرسال بانلات الأسعار',
            options: [
                {
                    name: 'channel',
                    description: 'القناة لإرسال البانلات',
                    type: ApplicationCommandOptionType.Channel,
                    required: false
                }
            ]
        },
        {
            name: 'setup',
            description: 'إعداد البوت من الديسكورد'
        },
        {
            name: 'edit-prices',
            description: 'تعديل أسعار البوت بالتفصيل',
            options: [
                {
                    name: 'type',
                    description: 'نوع السعر المراد تعديله',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: '📢 أسعار المنشنات العادية (everyone/here)', value: 'normal_mentions' },
                        { name: '📋 أسعار منشنات الطلبات', value: 'order_mentions' },
                        { name: '🏆 أسعار منشنات المزادات', value: 'auction_mentions' },
                        { name: '🏪 أسعار المتاجر', value: 'shop_prices' },
                        { name: '💰 أسعار الخدمات الإضافية', value: 'extra_services' },
                        { name: '🔧 عرض جميع الأسعار الحالية', value: 'view_all' }
                    ]
                }
            ]
        },
        {
            name: 'refresh-commands',
            description: 'إعادة تحديث أوامر البوت'
        },
        {
            name: 'set-tax-room',
            description: 'إضافة قناة حساب الضريبة',
            options: [
                {
                    name: 'channel',
                    description: 'القناة',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        },
        {
            name: 'remove-tax-room',
            description: 'إزالة قناة حساب الضريبة'
        },
        {
            name: 'manage-mentions',
            description: 'إدارة منشنات المتاجر',
            options: [
                {
                    name: 'action',
                    description: 'الإجراء',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: 'إضافة', value: 'add' },
                        { name: 'إزالة', value: 'remove' }
                    ]
                },
                {
                    name: 'type',
                    description: 'نوع المنشن',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: 'everyone', value: 'every' },
                        { name: 'here', value: 'here' },
                        { name: 'shop', value: 'shop' }
                    ]
                },
                {
                    name: 'amount',
                    description: 'العدد',
                    type: ApplicationCommandOptionType.Number,
                    required: true
                },
                {
                    name: 'channel',
                    description: 'المتجر (افتراضي: القناة الحالية)',
                    type: ApplicationCommandOptionType.Channel,
                    required: false
                }
            ]
        },
        {
            name: 'user-shops',
            description: 'عرض متاجر مستخدم معين',
            options: [
                {
                    name: 'user',
                    description: 'المستخدم',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'shop',
            description: 'إنشاء متجر جديد',
            options: [
                {
                    name: 'type',
                    description: 'نوع المتجر',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: types.map(t => ({ name: t.name, value: t.id }))
                },
                {
                    name: 'name',
                    description: 'اسم المتجر',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'owner',
                    description: 'مالك المتجر',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'mentions',
            description: 'عرض منشنات المتجر',
        },
        {
            name: 'tax',
            description: 'حساب الضريبة',
            options: [
                {
                    name: 'number',
                    description: 'المبلغ',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'warn',
            description: 'تحذير متجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: 'amount',
                    description: 'عدد التحذيرات',
                    type: ApplicationCommandOptionType.Number,
                    required: true
                },
                {
                    name: 'reason',
                    description: 'السبب',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'proof',
                    description: 'دليل المخالفة',
                    type: ApplicationCommandOptionType.Attachment,
                    required: true
                }
            ]
        },
        {
            name: 'unwarn',
            description: 'إزالة تحذير من متجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: 'amount',
                    description: 'عدد التحذيرات',
                    type: ApplicationCommandOptionType.Number,
                    required: true
                }
            ]
        },
        {
            name: 'disable',
            description: 'تعطيل متجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: 'reason',
                    description: 'السبب',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'active',
            description: 'تفعيل متجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: ApplicationCommandOptionType.Channel,
                    required: false
                }
            ]
        },
        {
            name: 'buyticket',
            description: 'إرسال تذكرة شراء متجر',
            options: [
                {
                    name: 'channel',
                    description: 'القناة',
                    type: ApplicationCommandOptionType.Channel,
                    required: false
                }
            ]
        },
        {
            name: 'orderticket',
            description: 'إرسال تذكرة شراء منشور',
            options: [
                {
                    name: 'channel',
                    description: 'القناة',
                    type: ApplicationCommandOptionType.Channel,
                    required: false
                }
            ]
        },
        {
            name: 'order',
            description: 'إنشاء طلب',
            options: [
                {
                    name: 'الشخص',
                    description: 'الشخص',
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'الطلب',
                    description: 'المطلوب',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'المنشن',
                    description: 'نوع المنشن',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: 'everyone', value: '@everyone' },
                        { name: 'here', value: '@here' }
                    ]
                }
            ]
        },
        {
            name: 'auctions',
            description: 'إنشاء مزاد',
            options: [
                {
                    name: 'الشخص',
                    description: 'صاحب المزاد',
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'السلعة',
                    description: 'السلعة المعروضة',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'السعر',
                    description: 'سعر بدء المزاد',
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: 'المنشن',
                    description: 'المنشن',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: "everyone", value: "@everyone" },
                        { name: "here", value: "@here" }
                    ]
                },
                {
                    name: 'الوقت',
                    description: 'وقت المزاد',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: '5m', value: '5m' },
                        { name: '6m', value: '6m' },
                        { name: '7m', value: '7m' },
                        { name: '8m', value: '8m' },
                        { name: '9m', value: '9m' },
                        { name: '10m', value: '10m' },
                        { name: '11m', value: '11m' },
                        { name: '12m', value: '12m' }
                    ]
                },
                {
                    name: 'الصورة1',
                    description: 'الصورة الاولى',
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: 'الصورة2',
                    description: 'الصورة الثانية',
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: 'الصورة3',
                    description: 'الصورة الثالثة',
                    type: ApplicationCommandOptionType.String,
                    required: false
                }
            ]
        },
        {
            name: 'add-mentions',
            description: 'إضافة منشنات لمتجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: 'everyone',
                    description: 'عدد منشنات everyone',
                    type: ApplicationCommandOptionType.Number,
                    required: true
                },
                {
                    name: 'here',
                    description: 'عدد منشنات here',
                    type: ApplicationCommandOptionType.Number,
                    required: true
                },
                {
                    name: 'shop_mentions',
                    description: 'عدد منشنات المتجر',
                    type: ApplicationCommandOptionType.Number,
                    required: true
                }
            ]
        },
        {
            name: 'shop-data',
            description: 'عرض معلومات متجر'
        },
        {
            name: 'warns',
            description: 'عرض تحذيرات متجر'
        },
        {
            name: 'add-helper',
            description: 'إضافة مساعد للمتجر',
            options: [
                {
                    name: 'helper',
                    description: 'المساعد',
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        },
        {
            name: 'remove-helper',
            description: 'إزالة مساعد من متجر',
            options: [
                {
                    name: 'helper',
                    description: 'المساعد',
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        },
        {
            name: 'owner',
            description: 'تغيير مالك متجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: 'new-owner',
                    description: 'المالك الجديد',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'change-name',
            description: 'تغيير اسم متجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: 'new-name',
                    description: 'الاسم الجديد',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'change-type',
            description: 'تغيير نوع متجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: 'new-type',
                    description: 'النوع الجديد',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: types.map(t => ({ name: t.name, value: t.id }))
                }
            ]
        },
        {
            name: 'delete-shop',
            description: 'حذف متجر',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: 'reason',
                    description: 'السبب',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
        {
            name: 'r-mentions',
            description: 'إعادة تعيين منشنات جميع المتاجر',
            options: [
                {
                    name: 'channel',
                    description: 'القناة التي تريد إرسال الإشعار فيها',
                    type: ApplicationCommandOptionType.Channel,
                    required: false
                },
                {
                    name: 'image',
                    description: 'رابط صورة الإمبد',
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: 'message',
                    description: 'رسالة مخصصة (اتركها فارغة للرسالة الافتراضية)',
                    type: ApplicationCommandOptionType.String,
                    required: false
                }
            ]
        },
        {
            name: 'mentions-display',
            description: 'عرض المنشنات المتبقية'
        },
        {
            name: 'encryption-words',
            description: 'إضافة كلمات تشفير جديدة'
        },
        {
            name: 'change-name-paid',
            description: 'تغيير اسم متجر مع الدفع',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        },
        {
            name: 'change-type-paid',
            description: 'تغيير نوع متجر مع الدفع',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: 'new-type',
                    description: 'النوع الجديد',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: types.map(t => ({ name: t.name, value: t.id }))
                }
            ]
        },
        {
            name: 'enable-shop',
            description: 'تفعيل متجر معطل مع الدفع',
            options: [
                {
                    name: 'shop',
                    description: 'المتجر',
                    type: ApplicationCommandOptionType.Channel,
                    required: false
                }
            ]
        },

        {
            name: 'remove-rank-mentions',
            description: 'إزالة منشنات الرتب (يبقى فقط here و everyone)'
        },
        {
            name: 'remove-shop-mentions',
            description: 'إزالة منشنات shop من جميع المتاجر'
        },
        {
            name: 'send-encryption-panel',
            description: 'إرسال لوحة التشفير'
        },
        {
            name: 'help',
            description: 'عرض جميع أوامر البوت'
        },
        {
            name: 'data',
            description: 'إضافة بيانات متجر يدوياً',
            options: [
                {
                    name: 'channel',
                    description: 'القناة التي ستصبح متجراً',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                },
                {
                    name: 'owner',
                    description: 'مالك المتجر',
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: 'type',
                    description: 'نوع المتجر',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: types.map(t => ({ name: t.name, value: t.id }))
                },
                {
                    name: 'everyone',
                    description: 'عدد منشنات everyone',
                    type: ApplicationCommandOptionType.Number,
                    required: false
                },
                {
                    name: 'here',
                    description: 'عدد منشنات here',
                    type: ApplicationCommandOptionType.Number,
                    required: false
                },
                {
                    name: 'shop',
                    description: 'عدد منشنات المتجر',
                    type: ApplicationCommandOptionType.Number,
                    required: false
                },
                {
                    name: 'warns',
                    description: 'عدد التحذيرات',
                    type: ApplicationCommandOptionType.Number,
                    required: false
                },
                {
                    name: 'status',
                    description: 'حالة المتجر',
                    type: ApplicationCommandOptionType.String,
                    required: false,
                    choices: [
                        { name: 'مفعل', value: '1' },
                        { name: 'معطل', value: '0' }
                    ]
                }
            ]
        },
        {
            name: 'set-order-admin',
            description: 'تحديد مسؤول الطلبات',
            options: [
                {
                    name: 'admin',
                    description: 'مسؤول الطلبات',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'set-auction-admin',
            description: 'تحديد مسؤول المزاد',
            options: [
                {
                    name: 'admin',
                    description: 'مسؤول المزاد',
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        },
        {
            name: 'set-auction-room',
            description: 'تحديد روم المزاد',
            options: [
                {
                    name: 'channel',
                    description: 'روم المزاد',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        },
        {
            name: 'set-order-room',
            description: 'تحديد روم الطلبات',
            options: [
                {
                    name: 'channel',
                    description: 'روم الطلبات',
                    type: ApplicationCommandOptionType.Channel,
                    required: true
                }
            ]
        }
    ];
}

// دالة إظهار مودال إزالة التحذير
async function showRemoveWarningModal(interaction) {
    const shopData = await db.get(`shop_${interaction.channel.id}`);

    if (!shopData) {
        return interaction.reply({ content: 'هذا الشات ليس متجراً!', ephemeral: true });
    }

    // التحقق من أن المستخدم هو صاحب المتجر أو مساعد له
    const shopPartners = shopData.partners || [];
    const isOwner = interaction.user.id === shopData.owner;
    const isHelper = shopPartners.includes(interaction.user.id);

    if (!isOwner && !isHelper) {
        return interaction.reply({
            content: 'لا يمكنك استخدام متجر ليس لك',
            ephemeral: true
        });
    }

    const currentWarns = shopData.warns || 0;
    if (currentWarns === 0) {
        return interaction.reply({
            content: 'المتجر لا يحتوي على أي تحذيرات لإزالتها',
            ephemeral: true
        });
    }

    const modal = new ModalBuilder()
        .setCustomId('remove_warning_amount_modal')
        .setTitle('إزالة تحذيرات المتجر');

    const warningAmountInput = new TextInputBuilder()
        .setCustomId('warning_amount')
        .setLabel(`كم تحذير تريد إزالته؟ (المتاح: ${currentWarns})`)
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(2)
        .setPlaceholder('مثال: 1');

    const firstRow = new ActionRowBuilder().addComponents(warningAmountInput);
    modal.addComponents(firstRow);

    await interaction.showModal(modal);
}

// الدوال المفقودة

async function fixBotIssues(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        let fixedIssues = [];

        // إغلاق جميع التذاكر المفتوحة
        const allKeys = Object.keys(await db.all());
        let closedTickets = 0;

        for (const key of allKeys) {
            if (key.startsWith('buy_shop_ticket_') || key.startsWith('buy_') || key.startsWith('shop_credit_')) {
                const data = await db.get(key);
                if (data && data.channelId) {
                    try {
                        const channel = interaction.guild.channels.cache.get(data.channelId);
                        if (channel) {
                            await channel.delete();
                            closedTickets++;
                        }
                    } catch (error) {
                        console.error(`خطأ في حذف القناة ${data.channelId}:`, error);
                    }
                }
                await db.delete(key);
            }
        }

        if (closedTickets > 0) {
            fixedIssues.push(`تم إغلاق ${closedTickets} تذكرة مفتوحة`);
        }

        // تنظيف قاعدة البيانات من البيانات التالفة
        let cleanedEntries = 0;
        for (const key of allKeys) {
            if (key.startsWith('shop_')) {
                const data = await db.get(key);
                if (!data || typeof data !== 'object') {
                    await db.delete(key);
                    cleanedEntries++;
                }
            }
        }

        if (cleanedEntries > 0) {
            fixedIssues.push(`تم تنظيف ${cleanedEntries} من البيانات التالفة`);
        }

        // إعادة تعيين المنشنات لجميع المتاجر
        const channels = await interaction.guild.channels.fetch();
        let restoredShops = 0;

        for (const type of types) {
            for (const [channelId, channel] of channels) {
                if (channel.parentId === type.id) {
                    const shopData = await db.get(`shop_${channelId}`);
                    if (shopData) {
                        await db.set(`shop_${channelId}.every`, type.every);
                        await db.set(`shop_${channelId}.here`, type.here);
                        await db.set(`shop_${channelId}.shop`, type.shop);
                        restoredShops++;
                    }
                }
            }
        }

        if (restoredShops > 0) {
            fixedIssues.push(`تم استعادة منشنات ${restoredShops} متجر`);
        }

        const embed = new EmbedBuilder()
            .setTitle('🔧 تم إصلاح مشاكل البوت')
            .setDescription('**المشاكل التي تم إصلاحها:**')
            .addFields(
                { name: 'النتائج:', value: fixedIssues.length > 0 ? fixedIssues.join('\n') : 'لم يتم العثور على مشاكل' }
            )
            .setColor('#00FF00')
            .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('خطأ في إصلاح البوت:', error);
        await interaction.editReply('حدث خطأ أثناء إصلاح البوت!');
    }
}

async function sendAllPanels(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel('channel') || interaction.channel;

    // بانل واحد مع صورة وثلاثة أزرار
    const mainPanelEmbed = new EmbedBuilder()
        .setTitle('🛒 بانل الخدمات')
        .setDescription('**اختر الخدمة التي تريدها من الأزرار أدناه:**')
        .setImage(config.info)
        .setColor('#0099FF')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    const mainButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('buy_shop_ticket')
                .setLabel('شراء متجر')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🏪'),
            new ButtonBuilder()
                .setCustomId('buy_order_ticket')
                .setLabel('شراء طلب')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📋'),
            new ButtonBuilder()
                .setCustomId('buy_mentions')
                .setLabel('شراء منشن')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📢')
        );

    await channel.send({ embeds: [mainPanelEmbed], components: [mainButtons] });

    await interaction.editReply('تم إرسال بانل الخدمات بنجاح!');
}

async function sendPricePanels(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel('channel') || interaction.channel;

    // بانل الأسعار الرئيسي
    const mainPriceEmbed = new EmbedBuilder()
        .setTitle('💰 بانل الأسعار')
        .setDescription('**اختر من الأزرار أدناه لعرض الأسعار:**')
        .setImage(config.info)
        .setColor('#FFD700')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    const mainPriceButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('view_shop_prices')
                .setLabel('أسعار المتاجر')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🏪'),
            new ButtonBuilder()
                .setCustomId('view_auction_prices')
                .setLabel('أسعار المزادات')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🏆'),
            new ButtonBuilder()
                .setCustomId('view_order_prices')
                .setLabel('أسعار الطلبات')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📋')
        );

    await channel.send({ embeds: [mainPriceEmbed], components: [mainPriceButtons] });
    await interaction.editReply('تم إرسال بانل الأسعار بنجاح!');
}

async function handleBotSetup(interaction) {
    if (interaction.replied || interaction.deferred) {
        console.log('تم تجاهل setup - التفاعل تم الرد عليه مسبقاً');
        return;
    }

    try {
        const setupEmbed = new EmbedBuilder()
            .setTitle('⚙️ إعداد البوت')
            .setDescription('**اختر نوع الإعدادات التي تريد تكوينها:**')
            .addFields(
                { name: '🔧 الإعدادات الأساسية', value: 'إعداد الإدارة، البنك، واللوجز', inline: true },
                { name: '👥 إعدادات المسؤولين', value: 'تحديد مسؤولي الطلبات والمزادات', inline: true },
                { name: '🎫 إعدادات التذاكر', value: 'تكوين نظام التذاكر والفئات', inline: true }
            )
            .setColor('#0099FF')
            .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const setupMenu = new StringSelectMenuBuilder()
            .setCustomId('setup_select_menu')
            .setPlaceholder('اختر نوع الإعدادات')
            .addOptions([
                {
                    label: '🔧 الإعدادات الأساسية',
                    description: 'إعداد الإدارة، البنك، واللوجز',
                    value: 'basic_setup'
                },
                {
                    label: '👥 إعدادات المسؤولين',
                    description: 'تحديد مسؤولي الطلبات والمزادات',
                    value: 'admins_setup'
                },
                {
                    label: '🎫 إعدادات التذاكر',
                    description: 'تكوين نظام التذاكر والفئات',
                    value: 'tickets_setup'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(setupMenu);

        await interaction.reply({
            embeds: [setupEmbed],
            components: [row],
            ephemeral: true
        });

    } catch (error) {
        console.error('خطأ في إظهار قائمة الإعداد:', error);

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: 'حدث خطأ في إظهار قائمة الإعداد!',
                flags: 64
            });
        }
    }
}

async function handleDetailedPricesConfig(interaction) {
    const type = interaction.options.getString('type');

    switch (type) {
        case 'normal_mentions':
            await showNormalMentionsPriceModal(interaction);
            break;
        case 'order_mentions':
            await showOrderMentionsPriceModal(interaction);
            break;
        case 'auction_mentions':
            await showAuctionMentionsPriceModal(interaction);
            break;
        case 'shop_prices':
            await showShopPricesModal(interaction);
            break;
        case 'extra_services':
            await showExtraServicesPriceModal(interaction);
            break;
        case 'view_all':
            await showAllCurrentPrices(interaction);
            break;
        default:
            await interaction.reply({ content: 'نوع السعر غير صحيح!', ephemeral: true });
    }
}

async function showNormalMentionsPriceModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('normal_mentions_modal')
        .setTitle('📢 أسعار المنشنات العادية');

    const everyonePriceInput = new TextInputBuilder()
        .setCustomId('everyone_price')
        .setLabel('سعر منشن @everyone (كرديت)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('السعر الحالي: ' + config.every)
        .setValue(`${config.every}`);

    const herePriceInput = new TextInputBuilder()
        .setCustomId('here_price')
        .setLabel('سعر منشن @here (كرديت)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('السعر الحالي: ' + config.here)
        .setValue(`${config.here}`);

    const shopMentionPriceInput = new TextInputBuilder()
        .setCustomId('shop_mention_price')
        .setLabel('سعر منشن المتجر (كرديت)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('السعر الحالي: ' + (config.shopMentionPrice || 5000))
        .setValue(`${config.shopMentionPrice || 5000}`);

    const firstRow = new ActionRowBuilder().addComponents(everyonePriceInput);
    const secondRow = new ActionRowBuilder().addComponents(herePriceInput);
    const thirdRow = new ActionRowBuilder().addComponents(shopMentionPriceInput);

    modal.addComponents(firstRow, secondRow, thirdRow);
    await interaction.showModal(modal);
}

async function showOrderMentionsPriceModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('order_mentions_modal')
        .setTitle('📋 أسعار منشنات الطلبات');

    const orderEveryonePriceInput = new TextInputBuilder()
        .setCustomId('order_everyone_price')
        .setLabel('سعر @everyone للطلبات (كرديت)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('السعر الحالي: ' + config.oeverey)
        .setValue(`${config.oeverey}`);

    const orderHerePriceInput = new TextInputBuilder()
        .setCustomId('order_here_price')
        .setLabel('سعر @here للطلبات (كرديت)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('السعر الحالي: ' + config.ohere)
        .setValue(`${config.ohere}`);

    const orderDescriptionInput = new TextInputBuilder()
        .setCustomId('order_description')
        .setLabel('وصف إضافي للطلبات (اختياري)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setPlaceholder('مثال: منشنات الطلبات تستخدم لنشر الطلبات الخاصة')
        .setValue(config.orderDescription || '');

    const firstRow = new ActionRowBuilder().addComponents(orderEveryonePriceInput);
    const secondRow = new ActionRowBuilder().addComponents(orderHerePriceInput);
    const thirdRow = new ActionRowBuilder().addComponents(orderDescriptionInput);

    modal.addComponents(firstRow, secondRow, thirdRow);
    await interaction.showModal(modal);
}

async function showAuctionMentionsPriceModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('auction_mentions_modal')
        .setTitle('🏆 أسعار منشنات المزادات');

    const auctionEveryonePriceInput = new TextInputBuilder()
        .setCustomId('auction_everyone_price')
        .setLabel('سعر @everyone للمزادات (كرديت)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('السعر الحالي: ' + config.oeverey)
        .setValue(`${config.oeverey}`);

    const auctionHerePriceInput = new TextInputBuilder()
        .setCustomId('auction_here_price')
        .setLabel('سعر @here للمزادات (كرديت)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('السعر الحالي: ' + config.ohere)
        .setValue(`${config.ohere}`);

    const auctionDescriptionInput = new TextInputBuilder()
        .setCustomId('auction_description')
        .setLabel('وصف إضافي للمزادات (اختياري)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setPlaceholder('مثال: منشنات المزادات تستخدم لنشر المزادات العامة')
        .setValue(config.auctionDescription || '');

    const firstRow = new ActionRowBuilder().addComponents(auctionEveryonePriceInput);
    const secondRow = new ActionRowBuilder().addComponents(auctionHerePriceInput);
    const thirdRow = new ActionRowBuilder().addComponents(auctionDescriptionInput);

    modal.addComponents(firstRow, secondRow, thirdRow);
    await interaction.showModal(modal);
}

async function showShopPricesModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('shop_prices_modal')
        .setTitle('🏪 أسعار المتاجر');

    const platinum = types[0];
    const grandmaster = types[1];

    const platinumPriceInput = new TextInputBuilder()
        .setCustomId('platinum_price')
        .setLabel(`سعر ${platinum.name} (كرديت)`)
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('السعر الحالي: ' + platinum.price)
        .setValue(`${platinum.price}`);

    const grandmasterPriceInput = new TextInputBuilder()
        .setCustomId('grandmaster_price')
        .setLabel(`سعر ${grandmaster.name} (كرديت)`)
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('السعر الحالي: ' + grandmaster.price)
        .setValue(`${grandmaster.price}`);

    const noteInput = new TextInputBuilder()
        .setCustomId('shop_price_note')
        .setLabel('ملاحظة حول أسعار المتاجر (اختياري)')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setPlaceholder('مثال: الأسعار تشمل المنشنات والدعم الفني')
        .setValue(config.shopPriceNote || '');

    const firstRow = new ActionRowBuilder().addComponents(platinumPriceInput);
    const secondRow = new ActionRowBuilder().addComponents(grandmasterPriceInput);
    const thirdRow = new ActionRowBuilder().addComponents(noteInput);

    modal.addComponents(firstRow, secondRow, thirdRow);
    await interaction.showModal(modal);
}

async function showExtraServicesPriceModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('extra_services_modal')
        .setTitle('💰 أسعار الخدمات الإضافية');

    const removeWarningPriceInput = new TextInputBuilder()
        .setCustomId('remove_warning_price')
        .setLabel('سعر إزالة التحذير الواحد (كرديت)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('السعر الحالي: 2')
        .setValue('2');

    const enableShopPriceInput = new TextInputBuilder()
        .setCustomId('enable_shop_price')
        .setLabel('سعر تفعيل متجر معطل (كرديت)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('السعر الحالي: 5000')
        .setValue('5000');

    const changeNamePriceInput = new TextInputBuilder()
        .setCustomId('change_name_price')
        .setLabel('سعر تغيير اسم المتجر (كرديت)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('السعر الحالي: 1')
        .setValue('1');

    const firstRow = new ActionRowBuilder().addComponents(removeWarningPriceInput);
    const secondRow = new ActionRowBuilder().addComponents(enableShopPriceInput);
    const thirdRow = new ActionRowBuilder().addComponents(changeNamePriceInput);

    modal.addComponents(firstRow, secondRow, thirdRow);
    await interaction.showModal(modal);
}

async function showAllCurrentPrices(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('💰 جميع الأسعار الحالية في البوت')
        .setDescription('**عرض شامل لجميع الأسعار المعمول بها حالياً:**')
        .addFields(
            {
                name: '📢 المنشنات العادية',
                value: `• @everyone: ${config.every.toLocaleString()} كرديت\n• @here: ${config.here.toLocaleString()} كرديت\n• منشن المتجر: ${(config.shopMentionPrice || 5000).toLocaleString()} كرديت`,
                inline: true
            },
            {
                name: '📋 منشنات الطلبات',
                value: `• @everyone: ${config.oeverey.toLocaleString()} كرديت\n• @here: ${config.ohere.toLocaleString()} كرديت`,
                inline: true
            },
            {
                name: '🏆 منشنات المزادات',
                value: `• @everyone: ${config.oeverey.toLocaleString()} كرديت\n• @here: ${config.ohere.toLocaleString()} كرديت`,
                inline: true
            },
            {
                name: '🏪 أسعار المتاجر',
                value: types.map(t => `• ${t.badge} ${t.name}: ${t.price.toLocaleString()} كرديت`).join('\n'),
                inline: false
            },
            {
                name: '💰 الخدمات الإضافية',
                value: `• إزا ة تحذير واحد: 2 كرديت\n• تفعيل متجر معطل: 5,000 كرديت\n• تغيير اسم متجر: 1 كرديت\n• تغيير نوع متجر: نصف سعر المتجر الجديد`,
                inline: false
            },
            {
                name: '🔧 معلومات إضافية',
                value: `• جميع الأسعار تشمل الضريبة 5%\n• يمكن تعديل الأسعار من خلال أمر \`/edit-prices\`\n• الأسعار محدثة في: <t:${Math.floor(Date.now() / 1000)}:R>`,
                inline: false
            }
        )
        .setColor('#FFD700')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handlePricesConfig(interaction) {
    // Keep the old function for backward compatibility
    await handleDetailedPricesConfig(interaction);
}

async function refreshCommands(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const commands = getCommands();
        const rest = new REST().setToken(config.token);

        const data = await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        await interaction.editReply(`✅ تم تحديث ${data.length} أوامر بنجاح!`);
    } catch (error) {
        console.error('خطأ في تحديث الأوامر:', error);
        await interaction.editReply('❌ حدث خطأ أثناء تحديث الأوامر!');
    }
}

async function setTaxRoom(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel('channel');
    config.tax = channel.id;

    await interaction.editReply(`✅ تم تعيين قناة الضريبة إلى: ${channel}`);
}

async function removeTaxRoom(interaction) {
    await interaction.deferReply({ ephemeral: true });

    config.tax = "";

    await interaction.editReply('✅ تم إزالة قناة الضريبة');
}

async function manageMentions(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const action = interaction.options.getString('action');
    const amount = interaction.options.getNumber('amount');
    const mentionType = interaction.options.getString('type');
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

    const shopData = await db.get(`shop_${targetChannel.id}`);
    if (!shopData) {
        return interaction.editReply('هذه القناة ليست متجراً!');
    }

    const currentAmount = shopData[mentionType] || 0;

    if (action === 'add') {
        await db.add(`shop_${targetChannel.id}.${mentionType}`, amount);
        await interaction.editReply(`✅ تم إضافة ${amount} منشن ${mentionType} إلى ${targetChannel}`);
        await targetChannel.send(`تم إضافة ${amount} منشن ${mentionType} إلى متجرك`);
    } else if (action === 'remove') {
        if (currentAmount < amount) {
            return interaction.editReply(`لا يمكن إزالة ${amount} منشن، المتجر لديه ${currentAmount} منشن فقط`);
        }
        await db.sub(`shop_${targetChannel.id}.${mentionType}`, amount);
        await interaction.editReply(`✅ تم إزالة ${amount} منشن ${mentionType} من ${targetChannel}`);
        await targetChannel.send(`تم إزالة ${amount} منشن ${mentionType} من متجرك`);
    }
}

async function showUserShops(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const user = interaction.options.getUser('user');
    const channels = await interaction.guild.channels.fetch();

    let userShops = [];
    for (const [channelId, channel] of channels) {
        const shopData = await db.get(`shop_${channelId}`);
        if (shopData && shopData.owner === user.id) {
            userShops.push({
                channel: channel,
                data: shopData
            });
        }
    }

    if (userShops.length === 0) {
        return interaction.editReply(`المستخدم ${user} لا يملك أي متاجر`);
    }

    let shopsText = '';
    userShops.forEach((shop, index) => {
        const type = types.find(t => t.role === shop.data.type);
        shopsText += `**${index + 1}.** ${shop.channel} - ${type ? type.name : 'غير معروف'}\n`;
        shopsText += `   التحذيرات: ${shop.data.warns || 0} | الحالة: ${shop.data.status === "1" ? "مفعل" : "معطل"}\n\n`;
    });

    const embed = new EmbedBuilder()
        .setTitle(`متاجر ${user.username}`)
        .setDescription(`**عدد المتاجر: ${userShops.length}**\n\n${shopsText}`)
        .setColor('#0099FF')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}

// دالة إرسال رسالة المساعدة مع Select Menu
async function sendHelpMessage(channel) {
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

// دالة معالجة أمر help السلاش
async function sendHelpCommand(interaction) {
    await sendHelpMessage(interaction.channel);
    await interaction.reply({ content: 'تم إرسال دليل الأوامر!', ephemeral: true });
}

async function addShopData(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.options.getChannel('channel');
    const owner = interaction.options.getUser('owner');
    const typeId = interaction.options.getString('type');
    const everyone = interaction.options.getNumber('everyone') || 0;
    const here = interaction.options.getNumber('here') || 0;
    const shop = interaction.options.getNumber('shop') || 0;
    const warns = interaction.options.getNumber('warns') || 0;
    const status = interaction.options.getString('status') || "1";

    // التحقق من نوع المتجر
    const type = types.find(t => t.id === typeId);
    if (!type) {
        return interaction.editReply('نوع المتجر غير صحيح!');
    }

    // التحقق من وجود بيانات سابقة
    const existingData = await db.get(`shop_${channel.id}`);
    if (existingData) {
        return interaction.editReply(`هذه القناة لديها بيانات متجر بالفعل. استخدم أوامر التعديل إذا كنت تريد تحديث البيانات.`);
    }

    const timestamp = Math.floor(Date.now() / 1000);

    // إنشاء بيانات المتجر
    const shopData = {
        owner: owner.id,
        type: type.role,
        shop: shop,
        every: everyone,
        here: here,
        date: `<t:${timestamp}:R>`,
        status: status,
        warns: warns,
        badge: type.badge
    };

    await db.set(`shop_${channel.id}`, shopData);

    // إعطاء صلاحيات للمالك
    try {
        await channel.permissionOverwrites.edit(owner.id, {
            ViewChannel: true,
            SendMessages: true,
            EmbedLinks: true,
            MentionEveryone: true,
            AttachFiles: true
        });

        // إعطاء رتبة المتجر إذا كانت موجودة
        const shopRole = interaction.guild.roles.cache.get(type.role);
        if (shopRole) {
            const member = await interaction.guild.members.fetch(owner.id);
            await member.roles.add(shopRole);
        }
    } catch (error) {
        console.error('خطأ في إعطاء الصلاحيات:', error);
    }

    // إرسال رسالة معلومات في القناة
    const embed = new EmbedBuilder()
        .setTitle('معلومات المتجر')
        .setDescription(`**المنشنات:**\n• everyone: ${everyone}\n• here: ${here}\n• shop: ${shop}`)
        .addFields(
            { name: 'صاحب المتجر', value: `<@${owner.id}>`, inline: true },
            { name: 'نوع المتجر', value: `<@&${type.role}>`, inline: true },
            { name: 'تاريخ الإنشاء', value: `<t:${timestamp}:R>`, inline: true },
            { name: 'التحذيرات', value: warns.toString(), inline: true },
            { name: 'الحالة', value: status === "1" ? "مفعل" : "معطل", inline: true }
        )
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await channel.send({ content: `<@${owner.id}>`, embeds: [embed] });

    await interaction.editReply({
        content: `✅ تم إضافة بيانات المتجر بنجاح!\n**القناة:** ${channel}\n**المالك:** ${owner}\n**النوع:** ${type.name}`
    });

    // إرسال لوج
    const logChannel = interaction.guild.channels.cache.get(config.commandlog);
    if (logChannel) {
        const logEmbed = new EmbedBuilder()
            .setTitle('تم إضافة بيانات متجر يدوياً')
            .setDescription(`المسؤول: <@${interaction.user.id}>`)
            .addFields(
                { name: 'القناة', value: `<#${channel.id}>`, inline: true },
                { name: 'المالك', value: `<@${owner.id}>`, inline: true },
                { name: 'النوع', value: `<@&${type.role}>`, inline: true },
                { name: 'المنشنات', value: `Everyone: ${everyone}, Here: ${here}, Shop: ${shop}`, inline: false },
                { name: 'التحذيرات', value: warns.toString(), inline: true },
                { name: 'الحالة', value: status === "1" ? "مفعل" : "معطل", inline: true }
            )
            .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
    }
}

// دوال معالجة بانلات الأسعار الجديدة
async function handleShopPricesView(interaction) {
    const shopPricesEmbed = new EmbedBuilder()
        .setTitle('🏪 أسعار المتاجر')
        .setDescription('**اختر نوع المتجر لعرض تفاصيل السعر:**')
        .setImage(config.info)
        .setColor('#0099FF')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    const shopPriceButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('shop_price_platinum')
                .setLabel(`${types[0].badge} ${types[0].name}`)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('shop_price_grandmaster')
                .setLabel(`${types[1].badge} ${types[1].name}`)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('shop_price_master')
                .setLabel(`${types[2].badge} ${types[2].name}`)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('shop_price_diamond')
                .setLabel(`${types[3].badge} ${types[3].name}`)
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('shop_price_gold')
                .setLabel(`${types[4].badge} ${types[4].name}`)
                .setStyle(ButtonStyle.Primary)
        );

    await interaction.reply({ embeds: [shopPricesEmbed], components: [shopPriceButtons], ephemeral: true });
}

async function handleAuctionPricesView(interaction) {
    const auctionPricesEmbed = new EmbedBuilder()
        .setTitle('🏆 أسعار المزادات')
        .setDescription('**اختر نوع المنشن لعرض السعر:**')
        .setImage(config.info)
        .setColor('#FFA500')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    const auctionPriceButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('auction_everyone_price')
                .setLabel('@everyone')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📢'),
            new ButtonBuilder()
                .setCustomId('auction_here_price')
                .setLabel('@here')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📍')
        );

    await interaction.reply({ embeds: [auctionPricesEmbed], components: [auctionPriceButtons], ephemeral: true });
}

async function handleOrderPricesView(interaction) {
    const orderPricesEmbed = new EmbedBuilder()
        .setTitle('📋 أسعار الطلبات')
        .setDescription('**اختر نوع المنشن لعرض السعر:**')
        .setImage(config.info)
        .setColor('#00FF00')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    const orderPriceButtons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('order_everyone_price')
                .setLabel('@everyone')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📢'),
            new ButtonBuilder()
                .setCustomId('order_here_price')
                .setLabel('@here')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📍')
        );

    await interaction.reply({ embeds: [orderPricesEmbed], components: [orderPriceButtons], ephemeral: true });
}

async function handleShopPriceSelection(interaction) {
    const shopTypeMap = {
        'shop_price_platinum': 0,
        'shop_price_grandmaster': 1,
        'shop_price_master': 2,
        'shop_price_diamond': 3,
        'shop_price_gold': 4
    };

    const typeIndex = shopTypeMap[interaction.customId];
    const selectedType = types[typeIndex];

    if (!selectedType) {
        return interaction.reply({ content: 'خطأ في نوع المتجر!', ephemeral: true });
    }

    const shopDetailEmbed = new EmbedBuilder()
        .setTitle(`${selectedType.badge} ${selectedType.name}`)
        .setDescription(`**تفاصيل أسعار المتجر:**`)
        .addFields(
            { name: 'السعر:', value: `${selectedType.price.toLocaleString()} كرديت`, inline: true },
            { name: 'منشنات @everyone:', value: `${selectedType.every} منشن`, inline: true },
            { name: 'منشنات @here:', value: `${selectedType.here} منشن`, inline: true },
            { name: 'الباقة تشمل:', value: '• إنشاء متجر خاص\n• صلاحيات كاملة\n• دعم فني\n• منشنات مجانية', inline: false }
        )
        .setColor('#FFD700')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await interaction.reply({ embeds: [shopDetailEmbed], ephemeral: true });
}

async function handleAuctionPriceSelection(interaction) {
    let priceInfo = '';
    let title = '';

    if (interaction.customId === 'auction_everyone_price') {
        title = '📢 سعر منشن @everyone للمزادات';
        priceInfo = `**السعر:** ${config.oeverey.toLocaleString()} كرديت\n\n**المميزات:**\n• وصول للجميع في السيرفر\n• تأثير قوي\n• مناسب للمزادات الكبيرة`;
    } else {
        title = '📍 سعر منشن @here للمزادات';
        priceInfo = `**السعر:** ${config.ohere.toLocaleString()} كرديت\n\n**المميزات:**\n• وصول للأعضاء النشطين فقط\n• تأثير متوسط\n• مناسب للمزادات العادية`;
    }

    const auctionDetailEmbed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(priceInfo)
        .setColor('#FFA500')
        .setFooter({ text: '_d3q', iconURL: interaction.guild.iconURL() })
        .setTimestamp();

    await interaction.reply({ embeds: [auctionDetailEmbed], ephemeral: true });
}

// دالة مساعدة لاستخراج المبلغ من رسالة البروبوت
function extractAmountFromMessage(content) {
    const patterns = [
        /has transferred `\$([0-9,]+)`/g,
        /قام بتحويل `\$([0-9,]+)`/g,
        /transferred `\$([0-9,]+)`/g,
        /`\$([0-9,]+)`/g,
        /\$([0-9,]+)/g,
        /([0-9,]+)\$/g
    ];

    for (const pattern of patterns) {
        const matches = [...content.matchAll(pattern)];
        for (const match of matches) {
            const amount = parseInt(match[1].replace(/,/g, ''));
            if (amount > 0) {
                return amount;
            }
        }
    }
    return 0;
}

async function handleCloseTicket(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.channel;

    if (!channel) {
        return interaction.editReply({ content: 'لا يمكن العثور على القناة.', ephemeral: true });
    }

    // التحقق مما إذا كان المستخدم هو صاحب التذكرة
    const ticketData = await db.get(`buy_shop_ticket_${interaction.user.id}`) || await db.get(`buy_${interaction.user.id}`);
    if (!ticketData || ticketData.channelId !== channel.id) {
        // If the user is not the owner, check if they have admin privileges
        if (!interaction.member.roles.cache.has(config.Admin)) {
            return interaction.editReply({ content: 'ليس لديك صلاحية لإغلاق هذه التذكرة.', ephemeral: true });
        }
    }

    await channel.send({ content: 'سيتم حذف هذه التذكرة بعد 5 ثواني.' });

    // إزالة البيانات من قاعدة البيانات
    await db.delete(`buy_shop_ticket_${interaction.user.id}`);
    await db.delete(`buy_${interaction.user.id}`);
    await db.delete(`shop_credit_${interaction.user.id}`);

    setTimeout(() => {
        channel.delete();
    }, 5000);
}

async function setOrderAdmin(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const adminUser = interaction.options.getUser('admin');
    config.orderAdmin = adminUser.id;
    await interaction.editReply(`✅ تم تعيين <@${adminUser.id}> كمسؤول للطلبات.`);
}

async function setAuctionAdmin(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const adminUser = interaction.options.getUser('admin');
    config.auctionAdmin = adminUser.id;
    await interaction.editReply(`✅ تم تعيين <@${adminUser.id}> كمسؤول للمزادات.`);
}

async function setAuctionRoom(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.options.getChannel('channel');
    config.auctionChannel = channel.id;
    await interaction.editReply(`✅ تم تعيين روم المزادات إلى ${channel}.`);
}

async function setOrderRoom(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.options.getChannel('channel');
    orderChannel = channel.id;
    config.orderRoom = channel.id;
    await interaction.editReply(`✅ تم تعيين روم الطلبات إلى ${channel}.`);
}