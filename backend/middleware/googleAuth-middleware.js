const User = require("../model/user");
const speakeasy = require("speakeasy");

module.exports = async function (req, res, next) {
  try {
    const userId = req.user.id; // coming from JWT payload (auth-middleware)
    const { googleOtp } = req.body; // OTP must be sent with each request

    const user = await User.findById(userId).select("googleAuth");
    if (!user?.googleAuth) return res.status(403).json({ message: "Google Auth not setup" });

    if (!googleOtp) return res.status(400).json({ message: "Google OTP required" });

    const googleAuth = JSON.parse(user.googleAuth);
    const verified = speakeasy.totp.verify({
      secret: googleAuth.base32,
      encoding: "base32",
      token: String(googleOtp).replace(/\s/g, ""),
      window: 2,
    });

    if (!verified) return res.status(401).json({ message: "Invalid Google OTP" });

    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
