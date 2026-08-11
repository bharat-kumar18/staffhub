const express = require('express');

const router = express.Router();

const  authMiddleware  = require("../middleware/authMiddleware");
const  { SuperAdmin } = require("../middleware/roleMiddleware");
const { signup, login, forgotPassword, verifyOTP, resetPassword, changePassword, getAdmins, addUser, updateUser, softDeleteUser } = require("../controller/authController");
const {getEmployees} = require("../controller/employeeController");

// Signup
router.post("/signup", signup);


// Login
router.post("/login", login);


// Forgot password
router.post("/forgotPassword", forgotPassword);


// Verify OTP
router.post("/verifyOtp", verifyOTP);


// Reset password
router.post("/reset-password", resetPassword);

// Change Password
router.post("/change-password", authMiddleware, changePassword);


// SUPER ADMIN ONLY
// Get all Admin users
router.post(
    "/admins",
    authMiddleware,
    SuperAdmin,
    getAdmins,
    (req, res) => {

        res.status(200).json({
            success: true,
            message: "Super Admin access granted",
            user: req.user
        });

    }
);
// Add User-API

router.post(
    "/add-user",
    authMiddleware,
    SuperAdmin,
    addUser
);
// Update User API

router.put(
    "/update-user",
    authMiddleware,
    SuperAdmin,
    updateUser
);

// Soft - Delete API
router.patch(
    "/users/soft-delete",
    authMiddleware,
    SuperAdmin,
    softDeleteUser
);

// Employee 
// router.get(
//     "/employees",
//     authMiddleware,
//     getEmployees
// );






module.exports = router;