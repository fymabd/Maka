
const { EmbedBuilder } = require('discord.js');
const types = require('../types.js');

module.exports = {
    name: 'change-type',
    description: 'تغيير نوع متجر',
    async execute(interaction, db, config) {
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
};
