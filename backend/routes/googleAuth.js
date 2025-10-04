const express = require("express");
const { setupGoogle2FA, hasGoogleAuthSetup, verifyGoogleAuthOtp } = require("../controller/googleAuth.js");
const router = express.Router();

router.post("/google-2fa", setupGoogle2FA);           // generate QR
router.post("/has-setup", hasGoogleAuthSetup);        // check setup
router.post("/verify-google-otp", verifyGoogleAuthOtp); // verify OTP

module.exports = router;
