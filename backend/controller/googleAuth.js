const User = require("../models/user");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const LoginPermission = require("../models/loginPermission");
const { generateAuthResponse } = require("../../helper/authResponse");

// Generate QR and secret for Google Authenticator
exports.setupGoogle2FA = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("email googleAuth");
    if (!user) return res.status(404).json({ message: "User not found" });

    const issuer = "AdminPanel:3FA";

    // If already setup → return existing QR
    let otpauthUrl;

if (user.googleAuth) {
  const userSecret = JSON.parse(user.googleAuth);
  otpauthUrl = userSecret.otpauth_url;
  if (!otpauthUrl) {
    // Reset invalid googleAuth
    user.googleAuth = null;
    await user.save();
    // Generate new secret below
  } else {
    const qrCode = await QRCode.toDataURL(otpauthUrl);
    return res.status(200).send({
      message: "Already setup",
      data: {
        email: user.email,
        issuer,
        otpauth: otpauthUrl,
        secret: userSecret.base32,
        qrCode,
      },
    });
  }
}

// Generate new secret if missing or invalid
const secret = speakeasy.generateSecret({
  name: `${issuer} (${user.email})`,
  issuer,
  length: 20,
});

// Save secret
user.googleAuth = JSON.stringify({
  base32: secret.base32,
  otpauth_url: secret.otpauth_url,
});
await user.save();

// Generate QR code
const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

return res.status(200).send({
  message: "Google Authenticator QR generated",
  data: {
    email: user.email,
    issuer,
    otpauth: secret.otpauth_url,
    secret: secret.base32,
    qrCode: qrCodeDataURL,
  },
});
  } catch (err) {
    return res.status(500).json({ message: "Failed to generate QR", error: err.message });
  }
};


// Check if user has setup Google Auth
exports.hasGoogleAuthSetup = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("googleAuth").lean();
    return res.status(200).send({ setup: !!user?.googleAuth });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Verify OTP
exports.verifyGoogleAuthOtp = async (req, res) => {
  try {
    const { otp, id, secret } = req.body;
    if (!otp || !id) {
      return res.status(400).json({ message: "OTP and userId required" });
    }

    const user = await User.findById(id).select("userId email type permissions status googleAuth");
    if (!user) return res.status(404).json({ message: "User not found" });

    const googleAuth = user.googleAuth ? JSON.parse(user.googleAuth) : null;
    const base32Secret = googleAuth?.base32 || secret;

    if (!base32Secret) {
      return res.status(400).json({ message: "Google Authenticator secret missing" });
    }

    const verified = speakeasy.totp.verify({
      secret: base32Secret,
      encoding: "base32",
      token: String(otp).replace(/\s/g, ""),
      window: 2,
    });

    if (!verified) return res.status(403).json({ message: "Invalid OTP" });

    // Save permanently if first time setup
    if (!googleAuth && secret) {
      await User.updateOne({ _id: id }, { $set: { googleAuth: JSON.stringify({ base32: secret }) } });
    }

    // Check if email verification was required but already done
    const loginPermission = await LoginPermission.findOne({ user: user._id });
    const requireEmailVerification = loginPermission?.emailVerification || false;

    //If email verification is required but not yet done
    if (requireEmailVerification) {
      return res.status(200).send({
        message: "Google OTP verified. Email OTP required next.",
        otp_required: true,
        userId: user._id,
        steps: {
          emailVerification: true,
          google2FAVerification: false,
        },
      });
    }

    // 2️⃣ Else → final login success
    return res.status(200).send({
  message: "Google OTP verified successfully",
  ...generateAuthResponse(user),
});
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


