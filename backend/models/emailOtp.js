const mongoose = require("mongoose");

const emailOtpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// Automatically delete expired OTPs
emailOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("EmailOtp", emailOtpSchema);
