const schema = require('../schemas/prefix');

class prefix {
    constructor(client) {
        this.client = client;
    }
    async cache() {
        const data = await schema.find();
        if (data.length != 0) {
            return data;
        } else throw new Error('No prefix')
    }
}

module.exports = prefix;