const whatsappModel = require('../models/whatsapp');
const LogController = require("../controller/log");
const whatsappSchema = require('../validations/whatsapp.validator');

exports.AddWhatsapp = async(req, res)=>{
    // add validation
    const { error } = whatsappSchema.addWhatsappSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    
    try {
        // check duplicate record and Convert name to lowercase for consistent comparison
        const name = req.body.name.toLowerCase();
        const existingTelegram = await whatsappModel.findOne({ name: name  });
        if (existingTelegram) {
            return res.status(409).json({ status: 'error', message: 'Whatsapp name already exists!', });
        }
        const whatsapp = await whatsappModel.create(req.body);
        const logdt = {user:req.user.username, action: 'Whatsapp Create', remarks:'Whatsapp channel created by '+ req.user.username, ip: req.clientIp}
        await LogController.insertLog(logdt);
        return res.send({ message: 'Successfully added!', status: 'success' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 'error', message: error.message })
    }
}



exports.WhatsappLists = async(req, res) => {
    try {
        const query = {};
        const list  = await whatsappModel.find(query);
        return res.send({ message: 'Lists fetched Successfully!', data: list })
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.UpdateWhatsapp = async(req, res)=>{
    // add validation
    const { error } = whatsappSchema.updateWhatsappSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
    
    try {
        const {id, type, name, link, admin_name, admin_number, admin_email, purpose} = req.body;

        // check record exist or not 
        const whatsappRow  = await whatsappModel.findById(id);
        if(!whatsappRow){
            return res.status(400).json({ status: 'error', message: "Invalid Id, No data found" });
        }

        // update data
        const updated = await whatsappModel.findByIdAndUpdate(id,{
            type: type, name: name, link: link,
            admin_name: admin_name, admin_number: admin_number, admin_email: admin_email, purpose: purpose,
        });
        
        const logdt = {user:req.user.username, action: 'Whatsapp Update', remarks:'Whatsapp channel Update by '+req.user.username, ip: req.clientIp}
        await LogController.insertLog(logdt);
            
        res.send({ message: 'Successfully Updated!', status: 'success' });
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: 'error', message: 'Something went wrong.' })
    }
}