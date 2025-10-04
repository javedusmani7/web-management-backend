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

    const user = await User.findById(id).select("userId email type permissions status googleAuth");
    if (!user) return res.status(404).json({ message: "User not found" });

    const googleAuth = user.googleAuth ? JSON.parse(user.googleAuth) : null;

    // use secret string directly
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
      await User.updateOne(
        { _id: id },
        { $set: { googleAuth: JSON.stringify({ base32: secret }) } }
      );
    }

    // Generate JWT token (same as in login)
    const level = user.type === "admin" ? "1" : "2";
    const token = jwt.sign(
      {
        username: user.userId,
        email: user.email,
        id: user._id,
        level,
        permissions: user.permissions,
      },
      process.env.TOKEN_KEY,
      { expiresIn: "2h" }
    );

    // ✅ Send same response structure as login
    return res.status(200).send({
      message: "OTP verified successfully",
      token,
      expiresIn: 7200,
      userId: user._id,
      name: user.userId,
      email: user.email,
      level,
      permissions: user.permissions,
      users_status: user.status,
      steps: {
        emailVerification: false,
        google2FAVerification: false, // all done now
      },
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

