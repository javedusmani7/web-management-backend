const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true        
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    number: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    permissions: {
        type: [String],
        default: []
    },
    type: {
        type: String,
        required: true
    }
}, {timestamps: true});

module.exports = mongoose.model('User', UserSchema);