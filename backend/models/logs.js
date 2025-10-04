const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const LogSchema = new Schema({
    user: { type: String, required: true },
    action: { type: String, required: true },
    remarks: { type: String, required: true },
    ip: { type: String, required: true }
},{ timestamps: true });


module.exports = mongoose.model('Logs',LogSchema)