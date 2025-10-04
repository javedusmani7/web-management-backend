const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    name: {
        type: String,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Customer', CustomerSchema);