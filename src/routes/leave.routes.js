const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    Admin
} = require("../middleware/roleMiddleware");

const {
    applyLeave,
    decideLeave
} = require("../controller/leaveController");

// =====================================================
// Employee Apply Leave
// =====================================================

router.post("/leave/apply", authMiddleware, applyLeave );

// =====================================================
// Admin Approve / Reject Leave
// =====================================================

router.patch("/leave/decision", authMiddleware, Admin, decideLeave );

module.exports = router;