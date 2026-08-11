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
router.post(
    "/employeesById",
    authMiddleware,
    Admin,
    getEmployeeById
);


// Update Employee
router.put(
    "/employees-update",
    authMiddleware,
    Admin,
    updateEmployee
);


// Delete Employee
router.patch(
    "/employees-delete",
    authMiddleware,
    Admin,
    deleteEmployee
);


module.exports = router;