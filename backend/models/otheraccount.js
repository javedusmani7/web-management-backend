const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OtherAccountSchema = new Schema({
    company_name: {
        type: String,
        required: true
    },
    master_account_name: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    account_password: {
        type: String,
        required: true
    },
    account_url: {
        type: String,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('OtherAccount', OtherAccountSchema);