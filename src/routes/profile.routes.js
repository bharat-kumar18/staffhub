const express = require("express");
const router = express.Router();

// -----------------------------------------
// Authentication Middleware
// -----------------------------------------
const authMiddleware = require("../middleware/authMiddleware");
// -----------------------------------------
// Multer
// -----------------------------------------
const upload = require("../middleware/uploadMiddleware");

// -----------------------------------------
// Controller
// -----------------------------------------

const {
    getMyProfile,
    uploadProfilePicture
} = require("../controller/profileController");


// =====================================================
// GET MY PROFILE
// =====================================================

router.get(
    "/myProfile",
    authMiddleware,
    getMyProfile
);

// =====================================================
// UPLOAD / CHANGE PROFILE PICTURE
// =====================================================
router.post(
    "/profilePicture",
    authMiddleware,
    upload.single("profile_picture"),
    uploadProfilePicture
);

module.exports = router;