const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {SuperAdmin} = require("../middleware/roleMiddleware");

const {
    addEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = require("../controller/employeeController");


router.post(
    "/employees",
    authMiddleware,
    addEmployee
);


router.get(
    "/employees",
    authMiddleware,
    getEmployees
);


router.get(
    "/employees/:id",
    authMiddleware,
    getEmployeeById
);


router.put(
    "/employees/:id",
    authMiddleware,
    updateEmployee
);


router.delete(
    "/employees/:id",
    authMiddleware,
    deleteEmployee
);


module.exports = router;