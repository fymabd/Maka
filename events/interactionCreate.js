
module.exports = {
    name: 'interactionCreate',
    async execute(interaction, db, config, client) {
        try {
            // التحقق من أن التفاعل لم ينته أو يتم الرد عليه
            if (interaction.replied || interaction.deferred) {
                console.log('تم تجاهل التفاعل - تم الرد عليه مسبقاً');
                return;
            }

            if (interaction.isChatInputCommand()) {
                const { handleSlashCommands } = require('../utils/slashCommands');
                await handleSlashCommands(interaction, db, config, client);
            } else if (interaction.isButton()) {
                const { handleButtonInteractions } = require('../utils/buttonHandler');
                await handleButtonInteractions(interaction, db, config, client);
            } else if (interaction.isModalSubmit()) {
                const { handleModalSubmits } = require('../utils/modalHandler');
                await handleModalSubmits(interaction, db, config, client);
            } else if (interaction.isStringSelectMenu()) {
                const { handleStringSelectMenus } = require('../utils/selectMenuHandler');
                await handleStringSelectMenus(interaction, db, config, client);
            }
        } catch (error) {
            console.error('خطأ في معالجة التفاعل:', error);

            // محاولة الرد بخطأ إذا لم يتم الرد بعد
            if (!interaction.replied && !interaction.deferred) {
                try {
                    await interaction.reply({
                        content: 'حدث خطأ أثناء معالجة طلبك!',
                        flags: 64 // ephemeral
                    });
                } catch (replyError) {
                    console.error('فشل في إرسال رسالة الخطأ:', replyError);
                }
            }
        }
    }
};
