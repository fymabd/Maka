
const { EmbedBuilder } = require('discord.js');
const types = require('../types.js');

module.exports = {
    name: 'change-name',
    description: 'تغيير اسم متجر',
    async execute(interaction, db, config) {
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
};
