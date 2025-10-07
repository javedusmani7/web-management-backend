const User = require("../models/user");
const speakeasy = require("speakeasy");

module.exports = async function (req, res, next) {
  try {
    const adminUserId = req.user.id; // the logged-in admin
    let googleOtp;

    // Get OTP from decrypted body
    if (req.body.body_data) {
      const main_body = JSON.parse(req.body.body_data);
      googleOtp = main_body.googleOtp;
    } else {
      googleOtp = req.body.googleOtp;
    }

    if (!googleOtp) return res.status(400).json({ message: "Google OTP required" });

    // Fetch the logged-in admin's Google Auth setup
    const adminUser = await User.findById(adminUserId).select("googleAuth");
    if (!adminUser?.googleAuth)
      return res.status(403).json({ message: "Google Auth not setup for admin" });

    const googleAuth = JSON.parse(adminUser.googleAuth);

    const verified = speakeasy.totp.verify({
      secret: googleAuth.base32,
      encoding: "base32",
      token: String(googleOtp).replace(/\s/g, ""),
      window: 2,
    });

    if (!verified) return res.status(401).json({ message: "Invalid Google OTP" });

    // OTP is valid → continue to controller
    next();
  } catch (err) {
    console.error("Google OTP middleware error:", err);
    return res.status(500).json({ message: err.message });
  }
};
