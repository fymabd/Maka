
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tax',
    description: 'حساب الضريبة',
    async execute(interaction, db, config) {
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
};
