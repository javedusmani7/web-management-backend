const AccountModel = require('../models/account');
const OtherAccount = require('../models/otheraccount');
const AgentAccountModel = require('../models/agentaccount');
const LogController = require("../controller/log");
const agentaccount = require('../models/agentaccount');

exports.AddAccount = async(req,res,next)=>{
    try {
        if(req.body.hiddenTitle === 'server')
            {
                const {accountName, password,personname, email, number,serverCompany, hiddenTitle, google_authenticator_email} = req.body;

                let account = new AccountModel({
                    company_name: serverCompany,
                    account_name: accountName,
                    person_name:personname,
                    account_email: email,
                    google_authenticator_email: google_authenticator_email,
                    account_password: password,
                    account_type: hiddenTitle,
                    number: number
                })
                await account.save();
                const logdt = {user:req.user.username, action: 'Server Account Create', remarks:'Server Account created by '+req.user.username+'. Account Name: '+accountName, ip: req.clientIp}
                await LogController.insertLog(logdt);
                res.send({ message: 'Successfully added!', status: 'success' });
            }
            else
            {
                const {accountName, password,personname, email, number,companyName, hiddenTitle, google_authenticator_email} = req.body;
                let account = new AccountModel({
                    company_name: companyName,
                    account_name: accountName,
                    person_name:personname,
                    account_email: email,
                    google_authenticator_email: google_authenticator_email,
                    account_password: password,
                    account_type: hiddenTitle,
                    number: number
                })
                await account.save();
                const logdt = {user:req.user.username, action: hiddenTitle.toUpperCase()+' Account Create', remarks:hiddenTitle.toUpperCase()+' Account created by '+req.user.username+'. Account Name: '+accountName, ip: req.clientIp}
                await LogController.insertLog(logdt);
                res.send({ message: 'Successfully added!', status: 'success' });
            }
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.AccountList = async(req,res,next) => {
    try {
        const type = req.params.type;
        const accounts = await AccountModel.find({account_type: type});
        res.send(accounts)
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.GetAllAccount = async(req,res,next) => {
    try {
        const accounts = await AccountModel.find({});
        res.send(accounts)
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.UpdateAccount = async(req,res,next)=>{
    try {
        const {_id, data} = req.body;
        if(data.hiddenTitle === 'server')
            {
                await AccountModel.findByIdAndUpdate(_id,{
                    company_name: data.serverCompany, 
                    account_name: data.accountName,
                    person_name:data.personname,
                    account_email: data.email,
                    google_authenticator_email: data.google_authenticator_email,
                    account_password: data.password,
                    account_type: data.hiddenTitle,
                    number: data.number
                });
                const logdt = {user:req.user.username, action: 'Server Account Update', remarks:'Server Account Update by '+req.user.username+'. Account Name: '+data.accountName, ip: req.clientIp}
                await LogController.insertLog(logdt);
                
                res.send({ message: 'Successfully Updated!', status: 'success' });
            }
            else
            {
                  await AccountModel.findByIdAndUpdate(_id,{
                    company_name: data.companyName,
                    account_name: data.accountName,
                    person_name:data.personname,
                    account_email: data.email,
                    google_authenticator_email: data.google_authenticator_email,
                    account_password: data.password,
                    account_type: data.hiddenTitle,
                    number: data.number
                })

                const logdt = {user:req.user.username, action: data.hiddenTitle.toUpperCase()+' Account Update', remarks:data.hiddenTitle.toUpperCase()+' Account Update by '+req.user.username+'. Account Name: '+data.accountName, ip: req.clientIp}
                await LogController.insertLog(logdt);
                res.send({ message: 'Successfully Updated!', status: 'success' });
            }
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: 'error', message: 'Something went wrong.' })
    }
}

exports.DeleteAccount = async(req,res,next)=>{
    try {
        const {id} = req.body;

        await AccountModel.findByIdAndDelete({_id: id}).then(async (doc) => {
            const logdt = { user: req.user.username, action: doc.account_type.toUpperCase()+' Account Delete', remarks: doc.account_type.toUpperCase()+' Account deleted by ' + req.user.username + '. Account Name: ' + doc.account_name, ip: req.clientIp }
            await LogController.insertLog(logdt);
        });

        res.send({ status: 'success', message: 'Deleted successfully!' });
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: 'error', message: 'Something went wrong.' })
    }
}

exports.ShowPassword = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).send({ status: 'error', message: 'Account ID is required.' });
        }

        // check if account exists
        const accountRow = await AccountModel.findOne({ _id: id }).select("account_password").lean();
        if (!accountRow) {
            return res.status(404).send({ status: 'Not Found', message: 'Account not found, Invalid ID!' });
        }

        // return result
        res.send({ status: 'success', data: accountRow });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 'error', message: error.message });
    }
};




// Master Account

exports.AddMasterAccount = async(req,res,next)=>{
    try {
        const {master_account_name, account_url,account_password, email, user_id,company_name, google_authenticator_email} = req.body;

                let account = new OtherAccount({
                    master_account_name: master_account_name,
                    company_name: company_name,
                    account_url: account_url,
                    account_password: account_password, 
                    email: email, 
                    google_authenticator_email: google_authenticator_email,
                    user_id: user_id
                })
                await account.save();
                const logdt = {user:req.user.username, action: 'Master Account Create', remarks:'Master Account created by '+req.user.username+'. Account Name: '+master_account_name, ip: req.clientIp}
                await LogController.insertLog(logdt);
                res.send({ message: 'Successfully added!', status: 'success' });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.MasterAccountList = async(req,res,next)=>{
    try {
        const accounts = await OtherAccount.find({});
        res.send(accounts)
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.CompanyLists = async(req, res)=>{
    try {
        // Hardcoded company names (or you can fetch them from DB)
        const companyNames = [ "awc", "saba", "international"];
        res.send(companyNames)
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.MasterAccountListsByCompany = async(req, res)=>{
    
    const company = req.params.company;
    if(!company){
        return res.status(400).send({ status: 'Bad Request', message: "Company is required." })
    }    

    try {
        const accounts = await OtherAccount.find({company_name: company});
        res.send(accounts)
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.AgentAccountListsByCompany = async(req, res)=>{
    
    const company = req.params.company;
    const master_account = req.params.master_account;
    if(!company || !master_account){
        return res.status(400).send({ status: 'Bad Request', message: "company and master_account is required." })
    }    

    try {
        const accounts = await agentaccount.find({company_name: company, master_account_name: master_account});
        res.send(accounts)
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.UpdateMasterAccount = async(req,res,next)=>{
    try {
        const {_id, data} = req.body;
        await OtherAccount.findByIdAndUpdate(_id,{
            master_account_name: data.master_account_name,
            company_name: data.company_name, 
            account_url: data.account_url,
            account_password: data.account_password,
            email: data.email,
            google_authenticator_email: data.google_authenticator_email,
            user_id: data.user_id
        });
        const logdt = {user:req.user.username, action: 'Master Account Update', remarks:'Master Account Update by '+req.user.username+'. Account Name: '+data.accountName, ip: req.clientIp}
        await LogController.insertLog(logdt);
        
        res.send({ message: 'Successfully Updated!', status: 'success' });
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: 'error', message: 'Something went wrong.' })
    }
}


exports.DeleteMasterAccount = async(req,res,next)=>{
    try {
        const {id} = req.body;

        await OtherAccount.findByIdAndDelete({_id: id}).then(async (doc) => {
            const logdt = { user: req.user.username, action: 'Master Account Delete', remarks: 'Master Account deleted by ' + req.user.username + '. Account Name: ' + doc.master_account_name, ip: req.clientIp }
            await LogController.insertLog(logdt);
        });

        res.send({ status: 'success', message: 'Deleted successfully!' });
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: 'error', message: 'Something went wrong.' })
    }
}


// Agent Account

exports.AddAgentAccount = async(req,res,next)=>{
    try {
        const {master_account_name, website_name,backoffice_url, account_password,agent_name, user_id,company_name} = req.body;

                let account = new AgentAccountModel({
                    master_account_name: master_account_name, company_name: company_name, backoffice_url: backoffice_url, account_password: account_password, agent_name: agent_name, user_id: user_id, website_name: website_name
                })
                await account.save();
                const logdt = {user:req.user.username, action: 'Agent Account Create', remarks:'Agent Account created by '+req.user.username+'. Account Name: '+master_account_name, ip: req.clientIp}
                await LogController.insertLog(logdt);
                res.send({ message: 'Successfully added!', status: 'success' });
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.AgentAccountList = async(req,res,next)=>{
    try {
        const accounts = await AgentAccountModel.find({}).populate([
            {
                path: 'master_account_name',
                select: 'master_account_name'
            }
        ]);
        res.send(accounts)
    } catch (error) {
        console.log(error)
        return res.status(500).send({ status: 'error', message: error.message })
    }
}