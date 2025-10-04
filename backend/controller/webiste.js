const WebsiteModel = require('../models/website');
const LogController = require("../controller/log");

exports.AddWebsite = async(req,res,next)=>{
    try {
        const website = await WebsiteModel.create(req.body);
        const logdt = {user:req.user.username, action: 'Website Create', remarks:'Website created by '+req.user.username+'. Website Name: '+req.body.website_name, ip: req.clientIp}
        await LogController.insertLog(logdt);
        res.send({ message: 'Successfully added!', status: 'success' });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.PanelByCustomer = async(req,res,next)=>{
    try {
        const {cust_id} = req.body;

        const website_data = await WebsiteModel.find({customer: cust_id});
        res.send(website_data)
    } catch (error) {
        
    }
}

exports.GetWebsite = async(req,res,next) => {
    try {
        const website_data = await WebsiteModel.find({}).populate([
            {
                path:'mother_panel',
                select: 'name'
            },
            {
                path: 'customer',
                select: 'name'
            },
            {
                path: 'web_cloud_ac',
                select: 'company_name account_name'
            },
            {
                path: 'web_domain',
                select: 'company_name account_name'
            },
            {
                path: 'web_awc',
                select: 'company_name master_account_name'
            },
            {
                path: 'web_saba',
                select: 'company_name master_account_name'
            },
            {
                path: 'web_inter',
                select: 'company_name master_account_name'
            },
            {
                path: 'web_server_comp',
                select: "company_name account_name"
            }
            
        ]);
        res.send(website_data);
    } catch (error) {
        
    }
}

exports.WebsiteDetail = async(req,res,next) => {
    try {
        const id = req.params.id;
        const website_data = await WebsiteModel.findOne({_id: id}).populate([
            {
                path:'mother_panel',
                select: 'name'
            },
            {
                path: 'customer',
                select: 'name'
            },
            {
                path: 'web_cloud_ac',
                select: 'company_name account_name'
            },
            {
                path: 'web_domain',
                select: 'company_name account_name'
            },
            {
                path: 'web_awc',
                select: 'company_name account_name'
            },
            {
                path: 'web_saba',
                select: 'company_name account_name'
            },
            {
                path: 'web_inter',
                select: 'company_name account_name'
            },
            {
                path: 'web_server_comp',
                select: "company_name account_name"
            }
            
        ]);

        res.send(website_data)
    } catch (error) {
        console.log(error)
    }
}

exports.WebsiteByMother = async(req,res,next)=>{
    try {
        
        const {m_detail,platformType} = req.body;
        const find_website = await WebsiteModel.findOne({website_status: 'panel',platform: platformType,mother_panel: m_detail});

        if(find_website)
        {
            res.send(find_website)
        }
        else
        {
            res.send([])
        }

    } catch (error) {
        console.log(error)
    }
}

exports.UpdateWebsite = async(req,res,next) => {
    try {
       
        const {_id, data} = req.body;
        const website = await WebsiteModel.findOneAndUpdate({_id: _id},req.body.data);
        if(req.body?.type === 'info')
        {
            const logdt = {user:req.user.username, action: 'Information Update', remarks:'Information Updated by '+req.user.username+'. Website Name: '+data.website_name, ip: req.clientIp}
            await LogController.insertLog(logdt);
        }
        else
        {
            const logdt = {user:req.user.username, action: 'Website Update', remarks:'Website Updated by '+req.user.username+'. Website Name: '+data.website_name, ip: req.clientIp}
            await LogController.insertLog(logdt);
        }
       
        res.send({ message: 'Successfully Updated!', status: 'success' });
    } catch (error) {
        console.log(error)
    }
}