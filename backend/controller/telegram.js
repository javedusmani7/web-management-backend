const telegramModel = require('../models/telegram');
const LogController = require("../controller/log");
const telegramSchema = require('../validations/telegram.validator');

exports.AddTelegram = async(req, res)=>{
    // add validation
    const { error } = telegramSchema.addtelegramSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    
    try {
        // check duplicate record
        const name = req.body.name.toLowerCase();
        const existingTelegram = await telegramModel.findOne({ name: name });
        if (existingTelegram) {
            return res.status(409).json({ status: 'error', message: 'Telegram name already exists!', });
        }

        const telegram = await telegramModel.create(req.body);
        const logdt = {user:req.user.username, action: 'Telegram Create', remarks:'telegram channel created by '+ req.user.username, ip: req.clientIp}
        await LogController.insertLog(logdt);
        return res.send({ message: 'Successfully added!', status: 'success' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 'error', message: error.message })
    }
}



exports.TelegramLists = async(req, res) => {
    try {
        const query = {};
        const list  = await telegramModel.find(query);
        return res.send({ message: 'Lists fetched Successfully!', data: list })
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.UpdateTelegram = async(req, res)=>{
    // add validation
    const { error } = telegramSchema.updateTelegramSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    
    try {
        const {id, type, name, link, admin_name, admin_number, admin_email, purpose} = req.body;

        // check record exist or not 
        const telegramRow  = await telegramModel.findById(id);
        if(!telegramRow){
            return res.status(400).json({ status: 'error', message: "Invalid Id, No data found" });
        }

        // update data
        const updated = await telegramModel.findByIdAndUpdate(id,{
            type: type, name: name, link: link,
            admin_name: admin_name, admin_number: admin_number, admin_email: admin_email, purpose: purpose,
        });
        
        const logdt = {user:req.user.username, action: 'Telegram Update', remarks:'Telgram channel Update by '+req.user.username, ip: req.clientIp}
        await LogController.insertLog(logdt);
            
        res.send({ message: 'Successfully Updated!', status: 'success' });
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: 'error', message: 'Something went wrong.' })
    }
}