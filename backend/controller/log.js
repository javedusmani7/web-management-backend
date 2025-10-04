const Log = require("../models/logs");

exports.insertLog = async(data) => {
  await Log.create({
    user: data.user,
    action: data.action,
    remarks: data.remarks,
    ip: data.ip,
  })
}

exports.getLogs = async() => {
  return await Log.find({}).sort({createdAt: -1}).limit(700).lean();
}