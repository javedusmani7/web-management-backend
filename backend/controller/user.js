const UserModel = require('../models/user');
const loginPermissionModel = require('../models/loginPermission');
const jwt = require("jsonwebtoken");
const CryptoJS = require('crypto-js');
const bcrypt = require('bcryptjs');
const LoginPermission = require("../models/loginPermission");
require("dotenv").config();
const LogController = require("../controller/log");
const { updateUserValidationSchema } = require('../validations/user.validator');
const { generateAuthResponse } = require('../../helper/authResponse');

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

exports.Login = async (req, res) => {
  try {
    const main_body = JSON.parse(decrypt(req.body.body_data));
    const { userId, password } = main_body;

    const user = await UserModel.findOne({ userId: userId.toLowerCase() });
    if (!user) return res.status(401).send({ message: "Username is wrong!" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(401).send({ message: "Password is wrong!" });
    if (!user.status && user.type === "user") return res.status(401).send({ message: "Please contact Admin" });

    // Initialize steps
    let steps = {
      emailVerification: false,
      google2FAVerification: false,
    };

    // Fetch login permissions
    const loginPermission = await LoginPermission.findOne({ user: user._id });

    const requireEmailVerification = loginPermission?.emailVerification || true;
    const requireGoogleAuth = loginPermission?.googleAuthVerification || true;

    // Set which steps are required
    steps.emailVerification = requireEmailVerification;
    steps.google2FAVerification = requireGoogleAuth;

    // 1️⃣ Case: Email verification required → send OTP step first
    if (requireEmailVerification) {
      return res.status(200).send({
        message: "Email OTP verification required",
        otp_required: true,
        userId: user._id,
        steps,
      });
    }

    // 2️⃣ Case: Google Auth required → check if setup/OTP step
    if (requireGoogleAuth) {
      if (!user.googleAuth) {
        return res.status(200).send({
          message: "Google Auth setup required",
          setup_required: true,
          userId: user._id,
          steps,
        });
      } else {
        return res.status(200).send({
          message: "Google OTP required",
          otp_required: true,
          userId: user._id,
          steps,
        });
      }
    }

    // 3️⃣ Case: No extra verification → generate token immediately
    return res.status(200).send(generateAuthResponse(user, steps));
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "Invalid authentication credentials!" });
  }
};




exports.AddUser = async (req, res, next) => {
    try {
        // console.log(req)
        const { user_name, user_email, userId, password, number, googleAuthVerification, emailVerification } = req.body;

        const user_password = await bcrypt.hash(password, 12);

        let user = new UserModel({
            name: user_name, email: user_email, userId: userId.toLowerCase(), number, password: user_password, type: 'user', status: true
        });
        const newUser = await user.save();

        // Create login permission (capture the result)
        const loginPermissionDoc = await loginPermissionModel.findOneAndUpdate(
            { user: newUser._id },
            { $set: {user: newUser._id, emailVerification, googleAuthVerification} },
            { new: true, upsert: true }
        ); 

        // Now update user with loginPermission ID
        await UserModel.findByIdAndUpdate(
            newUser._id,
            {
            $set: {
                loginPermission: loginPermissionDoc._id,
            },
            }
        );

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
        const query = { type: { $ne: 'admin' } };
        const users = await UserModel
            .find(query)
            .populate("loginPermission", "emailVerification googleAuthVerification");
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
                const logdt = { 
                    user: req.user.username, 
                    action: 'User Status', 
                    remarks: 'User Status Changed by ' + req.user.username + '. UserName: ' + doc.userId, 
                    ip: req.clientIp 
                }
                await LogController.insertLog(logdt);
            });

        res.send({ status: 'success', message: 'Status Changed successfully!' });
    } catch (error) {
        console.log(error)
        res.status(500).send({ status: 'error', message: 'Something went wrong.' })
    }
}


exports.UpdateUser = async (req, res, next) => {
    
    // add validation
    const { error } = updateUserValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'error', message: error.details[0].message });
    }

    try {

        const { _id, data } = req.body;
        if (!(_id)) return res.status(400).send({ status: 'error', message: 'Invalid request.' });
        const googleAuthVerification = data.hasOwnProperty('googleAuthVerification') ? data.googleAuthVerification : true;
        const emailVerification = data.hasOwnProperty('emailVerification') ? data.emailVerification : true;
        
        const query = {_id: _id}
        const userRow = await UserModel.findOne(query);
        if (!userRow){
            res.status(400).send({ status: 'Bad-Request', message: 'Invalid user _id.' })
        }

        // update user
        const updated = await UserModel.findByIdAndUpdate(_id, {
            name: data.user_name, email: data.user_email, userId: data.userId.toLowerCase(), number: data.number
        })

        // Update login permission in the loginPermission collection
        const updatedLoginPermission = await loginPermissionModel.findOneAndUpdate(
            { user: userRow._id },
            { $set: {user: userRow._id, emailVerification, googleAuthVerification} },
            { new: true, upsert: true }
        );

        
        // ✅ Update user document with loginPermission ID  
        if (!userRow.loginPermission) {
            await UserModel.findByIdAndUpdate(
            userRow._id,
            {
                $set: {
                loginPermission: updatedLoginPermission._id
                }
            }
            );
        }

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
    let main_body;

    // Check if payload is encrypted or plain
    if (req.body.body_data) {
        console.log("Encrypted payload detected");
      main_body = JSON.parse(decrypt(req.body.body_data)); // old way
    } else {
        console.log("Plain payload detected");
        console.log(req.body);
      main_body = req.body; // new plain way (frontend sends decrypted JSON directly)
    }

    const { _id, data, googleOtp } = main_body; // include googleOtp here
    if (!_id) return res.status(400).send({ status: 'error', message: 'Invalid request.' });

    const check_admin = await UserModel.findOne({ userId: 'admin' });
    if (!check_admin)
      return res.status(403).send({ status: 'error', message: 'You are not allowed' });

    const check_admin_pass = await bcrypt.compare(data.password, check_admin.password);
    if (!check_admin_pass)
      return res.status(401).send({ status: 'error', message: 'Your Password Not Match' });

    const new_password = await bcrypt.hash(data.newpassword, 12);
    await UserModel.findByIdAndUpdate(_id, { password: new_password });

    const logdt = {
      user: req.user.username,
      action: 'User Update',
      remarks: 'User Updated by ' + req.user.username + '. Username: ' + data.userId,
      ip: req.clientIp,
    };

    await LogController.insertLog(logdt);
    res.send({ status: 'success', message: 'Successfully changed.' });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: 'error', message: 'Something went wrong.' });
  }
};


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


