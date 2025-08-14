
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'add-mentions',
    description: 'إضافة منشنات لمتجر',
    async execute(interaction, db, config, client) {
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
        await shopChannel.send(`**تـم إضـافـه مـنـشـنـات لـلـمـتـجـر **\n**__${everyone}__** أفـري ون\n**__${here}__** هـيـر\n**__${shopm}__** مـنـشـن مـتـجـر`);
    }
};
