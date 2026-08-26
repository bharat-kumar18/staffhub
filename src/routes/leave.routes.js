const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    Admin
} = require("../middleware/roleMiddleware");

const {
    applyLeave,
    getMyLeaves,
    getAdminLeaveRequests,
    decideLeave,
    addHoliday,
    getHolidays,
    updateHoliday,
    deleteHoliday
} = require("../controller/leaveController");

// =====================================================
// Employee Apply Leave
// =====================================================

router.post("/leave/apply", authMiddleware, applyLeave);

// =====================================================
// EMPLOYEE GET MY LEAVES
// =====================================================
router.get("/myLeaves", authMiddleware, getMyLeaves);

// Get apply leave table

router.get("/admin/leaves", authMiddleware, Admin, getAdminLeaveRequests);

// =====================================================
// Admin Approve / Reject Leave
// =====================================================

router.patch("/leave/decision", authMiddleware, Admin, decideLeave);

// Add Holiday
router.post("/holidays", authMiddleware, Admin, addHoliday);


// Get Holidays
router.post("/holidays/list", authMiddleware, Admin, getHolidays);


// Update Holiday
router.put("/holidays/update", authMiddleware, Admin, updateHoliday);


// Delete Holiday
router.patch("/holidays/delete", authMiddleware, Admin, deleteHoliday);


module.exports = router;