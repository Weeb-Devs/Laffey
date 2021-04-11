const { Schema, model } = require("mongoose");

const PrefixSchema = new Schema({
    guildID: String,
    prefix: String,
})

module.exports = model('Prefixx', PrefixSchema);