const { readdirSync } = require('fs');
const { join } = require('path');
class eventHandler {
    constructor(client) {
        this.client = client
    }

    start() {
        const eventFiles = readdirSync(join(__dirname, "..", "events")).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const event = require(`../events/${file}`);
            if (event.once) {
                this.client.once(event.name, (...args) => event.execute(...args, this.client));
            } else {
                this.client.on(event.name, (...args) => event.execute(...args, this.client));
            }
        }
    }
}

module.exports = eventHandler;