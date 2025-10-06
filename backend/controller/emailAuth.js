const User = require("../models/user");
const LoginPermission = require("../models/loginPermission");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { generateAuthResponse } = require("../../helper/authResponse");

// In-memory OTP store (fallback when Redis is not used)
const otpStore = {};

// OTP settings
const OTP_EXPIRY = 2 * 60 * 1000; // 2 minutes in milliseconds
const OTP_DIGITS = 4;

// Helper: Generate random OTP
function generateOtp() {
  const min = Math.pow(10, OTP_DIGITS - 1);
  const max = Math.pow(10, OTP_DIGITS) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Send email using Nodemailer
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
    let loginPermission = await LoginPermission.findOne({ user: user._id });
    let requireEmailVerification = true;
    if (loginPermission) {
      requireEmailVerification = loginPermission.emailVerification;
    }

    if (!requireEmailVerification) {
      return res.status(403).json({ message: "Email verification not required for this user" });
    }

    // Generate OTP and store it in memory
    const otp = generateOtp();
    otpStore[userId] = { otp: String(otp), expiresAt: Date.now() + OTP_EXPIRY };

    // Send email
    await sendOtpMail(user.email, otp);

    return res.status(200).json({
      message: "OTP sent successfully to registered email",
      email: user.email,
    });
  } catch (err) {
    console.error(err);
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

    // Verify OTP
    const stored = otpStore[userId];
    if (!stored) return res.status(401).json({ message: "OTP expired or not found" });
    if (Date.now() > stored.expiresAt) {
      delete otpStore[userId];
      return res.status(401).json({ message: "OTP expired" });
    }
    if (stored.otp !== String(otp)) {
      return res.status(403).json({ message: "Invalid OTP" });
    }
    delete otpStore[userId]; // remove OTP after use

    // Fetch login permissions
    const loginPermission = await LoginPermission.findOne({ user: user._id });
    const requireGoogleAuth = loginPermission?.googleAuthVerification || false;

    // 1️⃣ If Google Auth required → continue to next step
    if (requireGoogleAuth) {
      return res.status(200).send({
        message: "Email OTP verified successfully. Google OTP required next.",
        otp_required: true,
        userId: user._id,
        steps: {
          emailVerification: false,
          google2FAVerification: true,
        },
      });
    }

    // 2️⃣ Else → generate final token and login success
   return res.status(200).send({
  message: "Email verified successfully",
  ...generateAuthResponse(user),
});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to verify OTP", error: err.message });
  }
};


/**
 * 🔄 Resend OTP to user's email
 */
exports.resendEmailOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const user = await User.findById(userId).select("email");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check login permission
    let loginPermission = await LoginPermission.findOne({ user: user._id });
    let requireEmailVerification = true;
    if (loginPermission) requireEmailVerification = loginPermission.emailVerification;

    if (!requireEmailVerification) {
      return res.status(403).json({ message: "Email verification not required for this user" });
    }

    // Generate new OTP and overwrite previous OTP
    const otp = generateOtp();
    otpStore[userId] = { otp: String(otp), expiresAt: Date.now() + OTP_EXPIRY };

    // Send email
    await sendOtpMail(user.email, otp);

    return res.status(200).json({
      message: "OTP resent successfully to registered email",
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to resend OTP", error: err.message });
  }
};

