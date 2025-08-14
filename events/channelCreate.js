
const { ChannelType } = require('discord.js');

module.exports = {
    name: 'channelCreate',
    async execute(channel, db) {
        if (channel.type === ChannelType.GuildText && channel.parentId) {
            const types = require('../types.js');
            const type = types.find(t => t.id === channel.parentId);
            if (type) {
                await db.set(`shop_${channel.id}`, {
                    id: channel.id,
                    type: type.role,
                    shop: type.shop,
                    here: type.here,
                    every: type.every,
                    status: "1",
                    owner: null,
                    date: `<t:${Math.floor(Date.now() / 1000)}:R>`,
                    warns: 0,
                    badge: type.badge
                });
            }
        }
    }
};
