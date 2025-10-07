const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OtherWebsiteSchema = Schema({
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
    },
    web_technology: {
        type: String
    },
    web_cloud_s: {
        type: Boolean,
        
    },
    web_cloud_ac:{
        type: Schema.Types.ObjectId,
        ref:'Account'
    },
    web_domain: {
        type: Schema.Types.ObjectId,
        ref:'Account'
    },
    web_domain_whitelist: {
        type: Boolean,
        
    },
    web_redis_allow: {
        type: Boolean,
        
    },
    web_main_link: {
        type: String
    },
    web_diff_server: {
        type: Boolean,        
    },
    web_project_name: {
        type: String
    },
    web_server_name: {
        type: String
    },
    web_server_comp: {
        type: Schema.Types.ObjectId,
        ref:'Account'
    },
    web_server_acc: {
        type: String
    },
    web_server_password: {
        type: String
    },
    web_server_ip: {
        type: String
    },
    web_ubuntu: {
        type: String
    },
    web_time_zone: {
        type: String
    },
    web_cache: {
        type: Date
    },
    web_reset: {
        type: Date
    },
    web_config: {
        type: Boolean,
    },
    web_nagios: {
        type: Boolean,
    },
    web_java_ver: {
        type: String
    },
    web_tom_ver: {
        type: String
    },
    web_tom_cache: {
        type: String
    },
    web_tom_log: {
        type: Date
    },
     web_node_ver: {
        type: String
    },
     web_angular_ver: {
        type: String
    },
    web_nginx_ver: {
        type: String
    },
    web_nginx_cache: {
        type: String
    },
    web_nginx_conn: {
        type: String
    },
    web_nginx_file: {
        type: String
    },
    web_nginx_log: {
        type: Date
    },
    web_pm_log: {
        type: Date
    },
    web_max_body: {
        type: String
    },
    web_socket_ver: {
        type: String
    },
    web_ssl: {
        type: Boolean,
        
    },
    web_ssl_name: {
        type: String
    },
    web_ssl_ex: {
        type: Date
    },
    web_ssl_up: {
        type: Boolean,
        
    },
    web_ssl_date: {
        type: Date
    },
    web_ssl_cache: {
        type: String
    },
    userLinkId: {
        type: String
    },
    userLinkPassword: {
        type: String
    },
    userLinkId2: {
        type: String
    },
    userLinkPassword2: {
        type: String
    },
    userLinkId3: {
        type: String
    },
    userLinkPassword3: {
        type: String
    },
    mgtLinkId: {
        type: String
    },
    mgtLinkPassword: {
        type: String
    },
    userAlternativeLink: {
        type: [String]
    },
    mgtAlternativeLink: {
        type: [String],
    },
    withMgtLink: {
        type: [String],
    },
    web_http2: {
        type: Boolean,
    },
    web_gzip: {
        type: Boolean,
    }
},{ timestamps: true});

module.exports = mongoose.model('OtherWebsiteData', OtherWebsiteSchema);