const { ApplicationCommandOptionType } = require('discord.js');

function getCommands() {
    const types = require('../types.js');
    
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
            name: 'help',
            description: 'عرض جميع أوامر البوت'
        },
        {
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
                    name: 'channel',
                    description: 'القناة المراد الإرسال فيها',
                    type: ApplicationCommandOptionType.Channel,
                    required: false
                }
            ]
        },
        {
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
                    description: 'لون الـ embed',
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: 'channel',
                    description: 'القناة المراد الإرسال فيها',
                    type: ApplicationCommandOptionType.Channel,
                    required: false
                }
            ]
        },
        {
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
                    description: 'القناة لسرقة الإيموجيز منها',
                    type: ApplicationCommandOptionType.Channel,
                    required: false
                },
                {
                    name: 'emoji_url',
                    description: 'رابط الإيموجي',
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: 'emoji_name',
                    description: 'اسم الإيموجي',
                    type: ApplicationCommandOptionType.String,
                    required: false
                },
                {
                    name: 'limit',
                    description: 'عدد الرسائل للبحث',
                    type: ApplicationCommandOptionType.Integer,
                    required: false
                }
            ]
        }
    ];
}

module.exports = { getCommands };
