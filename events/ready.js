
const { Routes, REST } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client, config) {
        console.log(`✅ Bot logged in as ${client.user.tag}`);

        // تحديث حالة البوت مع البينغ
        setInterval(() => {
            const ping = Math.round(client.ws.ping);
            client.user.setPresence({
                activities: [{ name: `My ping ${ping}ms by l_7r`, type: 0 }],
                status: 'online'
            });
        }, 10000); // كل 10 ثوانِ

        // تسجيل الأوامر
        const { getCommands } = require('../utils/commands');
        const commands = getCommands();
        const rest = new REST().setToken(config.token);

        try {
            console.log('🔄 تحديث أوامر البوت...');
            const data = await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );
            console.log(`✅ تم تحديث ${data.length} أوامر بنجاح`);
        } catch (error) {
            console.error('❌ خطأ في تحديث الأوامر:', error);
        }
    }
};
