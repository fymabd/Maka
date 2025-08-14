
const fs = require('fs');
const path = require('path');

function loadEvents(client, db, config) {
    const eventsPath = __dirname;
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js') && file !== 'index.js');

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, db, config, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, db, config, client));
        }

        console.log(`✅ تم تحميل الحدث: ${event.name}`);
    }
}

module.exports = { loadEvents };
