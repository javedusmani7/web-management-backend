const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    company_name: {
        type: String,
        required: true
    },
    account_name: {
        type: String,
        required: true
    },
    person_name: {
        type: String,
        required: true
    },
    account_password: {
        type: String,
        required: true
    },
    account_email: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    account_type: {
        type: String,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('Account', AccountSchema);