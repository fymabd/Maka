
module.exports = {
    name: 'unwarn',
    description: 'إزالة تحذير من متجر',
    async execute(interaction, db, config) {
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
};
