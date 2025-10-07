const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DataBaseSchema = Schema({
    customer:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Customer'
    },
    platform:{
        type: String,
        required: true
    },
    website_name: {
        type: String,
        requried: true
    },
    website_type: {
        type: String,
        requried: true
    },
    website_status:{
        type: String,
        required: true
    },
    mother_panel:
    {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'MotherPanel'
    },
    db_ip: {
        type: String
    },
    db_ubutnu: {
        type: String
    },
    db_time_zone: {
        type: String
    },
    db_version: {
        type: String
    },
    db_index: {
        type: Boolean,
        
    },
    db_grafana: {
        type: Boolean,
        
    },
    db_auth: {
        type: Boolean,
        
    },
    db_firewall: {
        type: Boolean,
        
    },
    db_log: {
        type: Date
    },
    db_reset: {
        type: Date
    }
},{ timestamps: true});

module.exports = mongoose.model('Databasedetail', DataBaseSchema);