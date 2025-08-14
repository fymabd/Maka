
const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// إنشاء collection للأوامر
const userCommands = new Collection();

// قراءة ملفات الأوامر
const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && file !== 'index.js');

for (const file of commandFiles) {
    const command = require(path.join(__dirname, file));
    if (command.name) {
        userCommands.set(command.name, command);
    }
}

module.exports = userCommands;
