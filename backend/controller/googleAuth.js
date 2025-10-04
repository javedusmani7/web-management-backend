const User = require("../models/user");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const mongoose = require("mongoose");

// Generate QR and secret for Google Authenticator
exports.setupGoogle2FA = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(id).select("email googleAuth");
    if (!user) return res.status(404).json({ message: "User not found" });

    const issuer = "AdminPanel:3FA"; // Include issuer

    // If already setup → return existing QR
    if (user.googleAuth) {
      const userSecret = JSON.parse(user.googleAuth);
      const qrCode = await QRCode.toDataURL(userSecret.otpauth_url);

      return res.status(200).send({
        message: "Already setup",
        data: {
          email: user.email,
          issuer,
          otpauth: userSecret.otpauth_url,
          secret: userSecret.base32,
          qrCode,
        },
      });
    }

    // Otherwise → generate new secret
    const secret = speakeasy.generateSecret({
      name: `${issuer} (${user.email})`,
      issuer,
      length: 20,
    });

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

    const user = await User.findById(id).select("googleAuth");
    if (!user) return res.status(404).json({ message: "User not found" });

    const googleAuth = user.googleAuth ? JSON.parse(user.googleAuth) : null;

    // FIX: use secret string directly
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

    if (!verified) {
      return res.status(403).json({ message: "Invalid OTP" });
    }

    // Save permanently if first time setup
    if (!googleAuth && secret) {
      await User.updateOne({ _id: id }, { $set: { googleAuth: JSON.stringify({ base32: secret }) } });
    }

    return res.status(200).send({ message: "OTP verified successfully", verified: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

