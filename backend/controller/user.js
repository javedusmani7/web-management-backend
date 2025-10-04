const UserModel = require('../models/user');
const jwt = require("jsonwebtoken");
const CryptoJS = require('crypto-js');
const bcrypt = require('bcryptjs');
require("dotenv").config();
const LogController = require("../controller/log");

const privateKey = CryptoJS.enc.Hex.parse(process.env.PRIVATE_KEY);

function decrypt(encryptedData) {
    const [ivHex, encryptedHex] = encryptedData.split(':');
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const encrypted = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(encryptedHex) });

    const decrypted = CryptoJS.AES.decrypt(encrypted, privateKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

exports.Login = async (req, res, next) => {
    try {
        const main_body = JSON.parse(decrypt(req.body.body_data));
        const { userId, password } = main_body;

        const check_user = await UserModel.findOne({ userId: userId.toLowerCase() });
        if (!check_user) return res.status(401).send({ message: "Username is wrong!" });

        const check_password = await bcrypt.compare(password, check_user.password);
        if (!check_password) return res.status(401).send({ message: "Password is wrong!" });
        if (!check_user.status && check_user.type == 'user') return res.status(401).send({ message: "Please contact Admin" });

        let level = check_user.type == 'admin' ? '1' : '2';

        const token = jwt.sign(
            { username: check_user.userId, email: check_user.email, id: check_user._id, level: level, permissions: check_user.permissions }, process.env.TOKEN_KEY, { expiresIn: "2h" }
        );
        res.send({ token: token, expiresIn: 7200, id: check_user._id, name: check_user.userId, email: check_user.email, level: level, permissions: check_user.permissions, users_status: check_user.status });

    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Invalid authentication credentials!" });
    }
}

exports.AddUser = async (req, res, next) => {
    try {
        // console.log(req)
        const { user_name, user_email, userId, password, number } = req.body;

        const user_password = await bcrypt.hash(password, 12);

        let user = new UserModel({
            name: user_name, email: user_email, userId: userId.toLowerCase(), number, password: user_password, type: 'user', status: true
        });
        await user.save();
        const logdt = { user: req.user.username, action: 'User Create', remarks: 'User created by ' + req.user.username + '. Username: ' + userId, ip: req.clientIp }
        await LogController.insertLog(logdt);
        res.send({ message: 'Successfully added!', status: 'success' });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.getUser = async (req, res, next) => {
    try {

        const users = await UserModel.find({ type: { $ne: 'admin' } })
        res.send(users)
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.getUserById = async (req, res, next) => {
    try {
        const user_id = req.params.id;
        const users = await UserModel.findById({ _id: user_id })
        res.send(users)
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.GetPermission = async (req, res, next) => {
    try {
        const user = await UserModel.findOne({ userId: req.params.userId });
        if (!user) return res.status(404).send('User not found.');

        res.send(user.permissions);
    } catch (error) {
        res.status(500).send(err.message);

    }
}

exports.UserPermission = async (req, res, next) => {
    try {
        const { permissions } = req.body;

        const user = await UserModel.findByIdAndUpdate(req.params.userId, { permissions }, { new: true }
        );
        if (!user) return res.status(404).send('User not found.');
        res.send(user);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 'error', message: error.message })
    }
}

exports.CheckUserId = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await UserModel.findOne({ userId });

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

exports.CheckEmail = async (req, res, next) => {
    try {
        const email = req.params.email;
        const user = await UserModel.findOne({ email });

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

exports.CheckNumber = async (req, res, next) => {
    try {
        const number = req.params.number;
        const user = await UserModel.findOne({ number });

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

exports.UserStatus = async (req, res, next) => {
    try {
        const { id } = req.body;

        await UserModel.findByIdAndUpdate(id, { status: false })
            .then(async (doc) => {
                const logdt = { user: req.user.username, action: 'User Status', remarks: 'User Status Changed by ' + req.user.username + '. UserName: ' + doc.userId, ip: req.clientIp }
                await LogController.insertLog(logdt);
            });
        res.send({ status: 'success', message: 'Status Changed successfully!' });
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: 'error', message: 'Something went wrong.' })
    }
}


exports.ActiveUser = async (req, res, next) => {
    try {
        const { id } = req.body;

        await UserModel.findByIdAndUpdate(id, { status: true })
            .then(async (doc) => {
                const logdt = { user: req.user.username, action: 'User Status', remarks: 'User Status Changed by ' + req.user.username + '. UserName: ' + doc.userId, ip: req.clientIp }
                await LogController.insertLog(logdt);
            });
        res.send({ status: 'success', message: 'Status Changed successfully!' });
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: 'error', message: 'Something went wrong.' })
    }
}

exports.UpdateUser = async (req, res, next) => {
    try {

        const { _id, data } = req.body;
        if (!(_id)) return res.status(400).send({ status: 'error', message: 'Invalid request.' });

        await UserModel.findByIdAndUpdate(_id, {
            name: data.user_name, email: data.user_email, userId: data.userId.toLowerCase(), number: data.number
        })
        const logdt = { user: req.user.username, action: 'User Update', remarks: 'User Updated by ' + req.user.username + '. Username: ' + data.userId, ip: req.clientIp }
        await LogController.insertLog(logdt);
        res.send({ status: 'success', message: 'Successfully changed.' })
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: 'error', message: 'Something went wrong.' })
    }
}

exports.UpdatePassword = async (req, res, next) => {

    try {
        const main_body = JSON.parse(decrypt(req.body.body_data));
        const { _id, data } = main_body;
        if (!(_id)) return res.status(400).send({ status: 'error', message: 'Invalid request.' });

        const check_admin = await UserModel.findOne({ userId: 'admin' });

        if (!check_admin) return res.status(403).send({ status: 'error', message: 'You are not allowed' });

        const check_admin_pass = await bcrypt.compare(data.password,check_admin.password)

        if (!check_admin_pass) return res.status(401).send({ status: 'error', message: 'Your Password Not Match' });

        const new_password = await bcrypt.hash(data.newpassword,12)
        await UserModel.findByIdAndUpdate(_id, { password: new_password })
        const logdt = { user: req.user.username, action: 'User Update', remarks: 'User Updated by ' + req.user.username + '. Username: ' + data.userId, ip: req.clientIp }
        await LogController.insertLog(logdt);
        res.send({ status: 'success', message: 'Successfully changed.' })

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: 'error', message: 'Something went wrong.' })
    }
}

exports.DeleteUser = async (req, res, next) => {
    try {
        const { id } = req.body;
        await UserModel.findByIdAndDelete({ _id: id })
            .then(async (doc) => {
                const logdt = { user: req.user.username, action: 'User Delete', remarks: 'User deleted by ' + req.user.username + '. UserName: ' + doc.userId, ip: req.clientIp }
                await LogController.insertLog(logdt);
            });
        res.send({ status: 'success', message: 'Deleted successfully!' });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Something went wrong.' });
    }
}


