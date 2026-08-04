const express = require('express');

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { signup, login, forgotPassword, verifyOTP, resetPassword, changePassword } = require("../controller/authController");

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

// Change Password
router.post("/change-password",authMiddleware,changePassword);


module.exports = router;