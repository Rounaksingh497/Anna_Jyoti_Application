const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
    farmerPhone: String,
    farmerName: String,
    queryType: String,
    subject: String,
    detail: String,
    adminResponse: { type: String, default: "" },
    status: { type: String, default: "Pending" },
    date: { type: String, default: () => new Date().toLocaleDateString('en-IN') }
});

module.exports = mongoose.model('SupportQuery', querySchema);