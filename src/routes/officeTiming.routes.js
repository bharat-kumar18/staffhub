const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    Admin
} = require("../middleware/roleMiddleware");

const {
    addOfficeTiming,
    getOfficeTiming,
    updateOfficeTiming
} = require("../controller/officeTimingController");


// Add office timing
router.post(
    "/office-timing",
    authMiddleware,
    Admin,
    addOfficeTiming
);


// Get office timing
router.get(
    "/getOffice-timing",
    authMiddleware,
    Admin,
    getOfficeTiming
);


// Update office timing
router.put(
    "/updateOffice-timing",
    authMiddleware,
    Admin,
    updateOfficeTiming
);


module.exports = router;