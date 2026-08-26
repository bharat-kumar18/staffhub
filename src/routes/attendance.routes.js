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
    getMyAttendance,
    getAttendance,
    modifyAttendance
} = require("../controller/attendanceController");

// Employee check-in
router.post("/attendance/check-in",authMiddleware,checkIn);

// Employee check-out
router.post("/attendance/check-out",authMiddleware,checkOut);

// EMPLOYEE MY ATTENDANCE
router.post("/myAttendance",authMiddleware,getMyAttendance);

// Get Attendence
router.post("/attendance",authMiddleware,Admin,getAttendance);

// Modify the Attendence
router.patch("/attendance/modify",authMiddleware,Admin,modifyAttendance);


module.exports = router;