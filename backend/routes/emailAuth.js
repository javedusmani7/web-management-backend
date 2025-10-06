const express = require("express");
const router = express.Router();
const { sendEmailOtp, verifyEmailOtp, resendEmailOtp } = require("../controller/emailAuth");

// send OTP to user's email
router.post("/email/send-otp", sendEmailOtp);

// verify OTP
router.post("/email/verify-otp", verifyEmailOtp);

// resend OTP
router.post("/email/resend-otp", resendEmailOtp);

module.exports = router;
