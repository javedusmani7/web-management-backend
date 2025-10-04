const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AgentAccountSchema = new Schema({
    company_name: {
        type: String,
        required: true
    },
    master_account_name: {
        type: Schema.Types.ObjectId,
        ref:'OtherAccount'
    },
    website_name: {
        type: String,
        required: true
    },
    agent_name: {
        type: String,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    account_password: {
        type: String,
        required: true
    },
    backoffice_url: {
        type: String,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('AgentAccount', AgentAccountSchema);