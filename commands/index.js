const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// إنشاء collection للأوامر
const commands = new Collection();

// قراءة جميع ملفات الأوامر
const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && file !== 'index.js');

for (const file of commandFiles) {
    const command = require(path.join(__dirname, file));
    if (command.name) {
        commands.set(command.name, command);
    }
}

module.exports = commands;
