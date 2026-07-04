const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    government: { type: String, required: true }, // e.g., "Central Govt" or "State Govt"
    applyLink: { type: String, required: true },
    videoLink: { type: String, required: true },
    description: { type: String, required: true }
});

module.exports = mongoose.model('Scheme', schemeSchema);