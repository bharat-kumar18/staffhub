const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    Admin
} = require("../middleware/roleMiddleware");

const {
    checkIn,
    checkOut,
    getAttendance
} = require("../controller/attendanceController");

// Employee check-in
router.post(
    "/attendance/check-in",
    authMiddleware,
    checkIn
);

// Employee check-out
router.post(
    "/attendance/check-out",
    authMiddleware,
    checkOut
);

// Get Attendence
router.post(
    "/attendance",
    authMiddleware,
    Admin,
    getAttendance
);


module.exports = router;