const express = require('express');

const router = express.Router();

const { signup, login, forgotPassword, verifyOTP, resetPassword } = require("../controller/authController");

// Signup
router.post("/signup", signup);
// Login
router.post("/login", login);
// Forgot password
router.post("/forgot-password", forgotPassword);


// Verify OTP
router.post("/verify-otp", verifyOTP);


// Reset password
router.post("/reset-password", resetPassword);


module.exports = router;