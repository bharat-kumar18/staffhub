const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { Admin } = require("../middleware/roleMiddleware");

const {
    addEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = require("../controller/employeeController");


// Add Employee
router.post(
    "/employees",
    authMiddleware,
    Admin,
    addEmployee
);


// Get Employees
router.get(
    "/employees",
    authMiddleware,
    Admin,
    getEmployees
);


// Get Single Employee
router.get(
    "/employees/:id",
    authMiddleware,
    Admin,
    getEmployeeById
);


// Update Employee
router.put(
    "/employees/:id",
    authMiddleware,
    Admin,
    updateEmployee
);


// Delete Employee
router.delete(
    "/employees/:id",
    authMiddleware,
    Admin,
    deleteEmployee
);


module.exports = router;