const CustomerModel = require('../models/customer');
const PanelModel = require('../models/motherpanel');
const LogController = require("../controller/log");
const LogModel = require("../models/logs");

// joi validation
const motherPanelValidationSchema = require('../validations/custom.validator');


exports.CustomerList = async(req,res,next)=>{
    try {
        const customers = await CustomerModel.find({});
        res.send(customers)
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.AddCustomer = async(req,res,next) => {
    try {
        const {name} = req.body;
        let customer = new CustomerModel({name});
        await customer.save();
        const logdt = {user:req.user.username, action: 'Customer Create', remarks:'Customer created by '+req.user.username+'. Customer Name: '+name, ip: req.clientIp}
        await LogController.insertLog(logdt);
        res.send({ message: 'Successfully added!', status: 'success' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.CheckCustomer = async(req,res,next)=>{
    try {
        const name = req.params.name;
        const user =  await CustomerModel.findOne({name});
        
        if (user) {
            // userId exists
            res.json({ isTaken: true });
          } else {
            // userId does not exist
            res.json({ isTaken: false });
          }
    } catch (error) {
        
    }
}

exports.UpdateCustomer = async(req,res,next)=>{
    try {
        const {_id, data} = req.body;
        if (!(_id)) return res.status(400).send({ status: 'error', message: 'Invalid request.' });

        await CustomerModel.findByIdAndUpdate(_id,{
            name: data.name
        });
        const logdt = {user:req.user.username, action: 'Customer Update', remarks:'Customer Updated by '+req.user.username+'. Customer Name: '+data.name, ip: req.clientIp}
        await LogController.insertLog(logdt);
        res.send({ status: 'success', message: 'Successfully changed.' })
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: 'Something went wrong.' })
    }
}

exports.DeleteCustomer = async(req,res,next)=>{
    try {
        const { id } = req.body;
        await CustomerModel.findByIdAndDelete({ _id: id })
            .then(async (doc) => {
                const logdt = { user: req.user.username, action: 'Customer Delete', remarks: 'Customer deleted by ' + req.user.username + '. Name: ' + doc.name + ' Value: ' + doc.value, ip: req.clientIp }
                await LogController.insertLog(logdt);
            });
        res.send({ status: 'success', message: 'Deleted successfully!' });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Something went wrong.' });
    }
}

exports.PanelList = async(req,res,next)=>{
    console.log("inside panel List");
    
    try {
        
        const query = {};

        const panels = await PanelModel
        .find(query)
        .populate("server_account", "account_name")
        .populate("cloudflore_account", "account_name")
        .populate("domain_account", "account_name")
        .populate("company_master_account", "master_account_name")
        .populate("company_agent_account", "agent_name");
        res.send(panels)
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 'error', message: error.message })
    }
}


exports.AddPanel = async(req,res,next) => {
    // add validation
    const { error } = motherPanelValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }

    try {
        const {name, url_address1, url_address2, country, server_account, cloudflore_account, domain_account, company_name, company_master_account, company_agent_account} = req.body;

        // check duplicate records
        const panelRow = await PanelModel.findOne({name: name});
        if (panelRow){
            return res.status(400).send({ status: 'Bad-Request', message: 'Panel Name already exist.' })
        }

        // create record
        let panel = new PanelModel({
            name,
            url_address1,
            url_address2,
            country,
            server_account,
            cloudflore_account,
            domain_account,
            company_name,
            company_master_account,
            company_agent_account,
        });

        await panel.save();
        const logdt = {user:req.user.username, action: 'MotherPanel Create', remarks:'MotherPanel created by '+req.user.username+'. MotherPanel: '+name, ip: req.clientIp}
        await LogController.insertLog(logdt);
        res.send({ message: 'Successfully added!', status: 'success' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.CheckPanel = async(req,res,next)=> {
    try {
        const name = req.params.panel;
        const user =  await PanelModel.findOne({name});
        
        if (user) {
            // userId exists
            res.json({ isTaken: true });
          } else {
            // userId does not exist
            res.json({ isTaken: false });
          }
    } catch (error) {
        
    }
}

exports.UpdatePanel = async(req,res,next)=>{
    try {
        const {_id, data} = req.body;
        if (!(_id)) return res.status(400).send({ status: 'error', message: 'Invalid request.' });

        await PanelModel.findByIdAndUpdate(_id,{
            name: data.name
        });
        const logdt = {user:req.user.username, action: 'MotherPanel Update', remarks:'MotherPanel Updated by '+req.user.username+'. MotherPanel: '+data.name, ip: req.clientIp}
        await LogController.insertLog(logdt);
        res.send({ status: 'success', message: 'Successfully changed.' })
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: 'Something went wrong.' })
    }
}

exports.DeletePanel = async(req,res,next)=>{
    try {
        const { id } = req.body;
        await PanelModel.findByIdAndDelete({ _id: id })
            .then(async (doc) => {
                const logdt = { user: req.user.username, action: 'MotherPanel Delete', remarks: 'MotherPanel deleted by ' + req.user.username + '. Name: ' + doc.name + ' Value: ' + doc.value, ip: req.clientIp }
                await LogController.insertLog(logdt);
            });
        res.send({ status: 'success', message: 'Deleted successfully!' });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Something went wrong.' });
    }
}

exports.getLogs = async(req,res,next) => {
    try {
        const logs = await LogController.getLogs();
        res.send(logs);
    } catch (error) {
        console.log('getLogs', error);
        res.status(500).send({ status: "failed", message: "Something went wrong." })
    }
}

exports.UserLog = async(req,res,next) => {
    try {

        const user_id = req.params.userId;

        const logs = await LogModel.find({user:user_id});

        res.send(logs)
        
    } catch (error) {
        console.log('getLogs', error);
        res.status(500).send({ status: "failed", message: "Something went wrong." })
    }
}