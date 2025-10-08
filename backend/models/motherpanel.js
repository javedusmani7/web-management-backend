const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PanelSchema = new Schema({
    name: { type: String, trim: true, lowercase: true, required: true, unique: true },
    url_address1: { type: String, trim: true, lowercase: true, required: true },
    url_address2: { type: String, trim: true, lowercase: true, default: null },
    country: { type: String, trim: true, lowercase: true, default: null },

    // server_account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null },
    // cloudflore_account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null },
    // domain_account: { type: mongoose.Schema.Types.ObjectId, ref: "Account", default: null },
    // company_name: { type: String, required: true },
    // company_master_account: { type: mongoose.Schema.Types.ObjectId, ref: "OtherAccount", default: null },
    // company_agent_account: { type: mongoose.Schema.Types.ObjectId, ref: "AgentAccount", default: null },
}, {
    timestamps: true
});

module.exports = mongoose.model('MotherPanel', PanelSchema);
