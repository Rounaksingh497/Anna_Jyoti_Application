const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    city: { type: String },
    state: { type: String },
    landAcres: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Farmer', farmerSchema);