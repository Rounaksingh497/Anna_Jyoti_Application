const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: './images/default.png' },
    desc: { type: String, required: true },
    stock: { type: Number, default: 50 } // Added stock field
});

module.exports = mongoose.model('Product', productSchema);