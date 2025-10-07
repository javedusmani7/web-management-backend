const User = require("../models/user");
const LoginPermission = require("../models/loginPermission");
const EmailOtp = require("../models/emailOtp");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { generateAuthResponse } = require("../../helper/authResponse");

// OTP settings
const OTP_EXPIRY = 2 * 60 * 1000; // 2 minutes
const OTP_DIGITS = 4;

// Generate random OTP
function generateOtp() {
  const min = Math.pow(10, OTP_DIGITS - 1);
  const max = Math.pow(10, OTP_DIGITS) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Send OTP mail
async function sendOtpMail(to, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Admin Panel" <${process.env.GMAIL_EMAIL}>`,
    to,
    subject: "Your Email Verification OTP",
    html: `<p>Your OTP is <b>${otp}</b>. It is valid for 2 minutes.</p>`,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * 📩 Send OTP to user's email
 */
exports.sendEmailOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const user = await User.findById(userId).select("email");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check login permission
    const loginPermission = await LoginPermission.findOne({ user: user._id });
    const requireEmailVerification = loginPermission?.emailVerification ?? true;

    if (!requireEmailVerification) {
      return res.status(403).json({ message: "Email verification not required for this user" });
    }

    // Generate OTP
    const otp = generateOtp();

    // Save OTP in MongoDB
    await EmailOtp.findOneAndUpdate(
      { userId },
      { otp: String(otp), expiresAt: new Date(Date.now() + OTP_EXPIRY) },
      { upsert: true, new: true }
    );

    // Send email
    await sendOtpMail(user.email, otp);

    return res.status(200).json({
      message: "OTP sent successfully to registered email",
      email: user.email,
      otp: otp, // ⚠️ remove in production
    });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};

/**
 * ✅ Verify Email OTP
 */
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({ message: "userId and otp required" });
    }

    const user = await User.findById(userId).select("userId email type permissions status");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find OTP record in MongoDB
    const record = await EmailOtp.findOne({ userId });
    if (!record) return res.status(401).json({ message: "OTP expired or not found" });

    // Check expiry
    if (Date.now() > record.expiresAt.getTime()) {
      await EmailOtp.deleteOne({ _id: record._id });
      return res.status(401).json({ message: "OTP expired" });
    }

    // Check value
    if (record.otp !== String(otp)) {
      return res.status(403).json({ message: "Invalid OTP" });
    }

    // Delete OTP after verification
    await EmailOtp.deleteOne({ _id: record._id });

    // Fetch login permissions
    const loginPermission = await LoginPermission.findOne({ user: user._id });
    const requireGoogleAuth = loginPermission?.googleAuthVerification || false;

    if (requireGoogleAuth) {
      return res.status(200).json({
        message: "Email OTP verified successfully. Google OTP required next.",
        otp_required: true,
        userId: user._id,
        steps: {
          emailVerification: false,
          google2FAVerification: true,
        },
      });
    }

    // Generate final token
    return res.status(200).json({
      message: "Email verified successfully",
      ...generateAuthResponse(user),
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res.status(500).json({ message: "Failed to verify OTP", error: err.message });
  }
};

/**
 * 🔄 Resend OTP
 */
exports.resendEmailOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const user = await User.findById(userId).select("email");
    if (!user) return res.status(404).json({ message: "User not found" });

    const loginPermission = await LoginPermission.findOne({ user: user._id });
    const requireEmailVerification = loginPermission?.emailVerification ?? true;

    if (!requireEmailVerification) {
      return res.status(403).json({ message: "Email verification not required for this user" });
    }

    const otp = generateOtp();

    // Overwrite old OTP
    await EmailOtp.findOneAndUpdate(
      { userId },
      { otp: String(otp), expiresAt: new Date(Date.now() + OTP_EXPIRY) },
      { upsert: true, new: true }
    );

    await sendOtpMail(user.email, otp);

    return res.status(200).json({
      message: "OTP resent successfully to registered email",
      email: user.email,
      otp: otp, // ⚠️ remove in production
    });
  } catch (err) {
    console.error("Error resending OTP:", err);
    return res.status(500).json({ message: "Failed to resend OTP", error: err.message });
  }
};
