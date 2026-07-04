const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    farmerPhone: { type: String, required: true }, // Links order to the farmer
    items: { type: Array, required: true }, // Array of { name, quantity, price, productId }
    total: { type: Number, required: true },
    status: { type: String, default: 'Processing' }, // Processing, Shipping, Delivered
    date: { type: String, required: true }
});

module.exports = mongoose.model('Order', orderSchema);