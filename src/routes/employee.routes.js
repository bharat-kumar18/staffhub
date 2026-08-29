const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const { Admin } = require("../middleware/roleMiddleware");

const {addEmployee, getEmployees, getEmployeeById, updateEmployee, deleteEmployee} = require("../controller/employeeController");


// Add Employee
/**
 * @swagger
 * /api/employees:
 *   post:
 *     summary: Add a new employee
 *     description: Allows an authenticated Admin to create an employee under their company. The Admin ID is obtained from the JWT token.
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: Employee full name
 *                 example: "John Doe"
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Employee email address
 *                 example: "john.doe@example.com"
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Employee login password
 *                 example: "John@12345"
 *
 *               department:
 *                 type: string
 *                 description: Employee department
 *                 example: "Development"
 *
 *               designation:
 *                 type: string
 *                 description: Employee designation
 *                 example: "Software Developer"
 *
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Employee date of birth
 *                 example: "1998-05-15"
 *
 *               phone:
 *                 type: string
 *                 description: Employee phone number
 *                 example: "9876543210"
 *
 *               address:
 *                 type: string
 *                 description: Employee address
 *                 example: "Lucknow, Uttar Pradesh, India"
 *
 *           example:
 *             name: "John Doe"
 *             email: "john.doe@example.com"
 *             password: "John@12345"
 *             department: "Development"
 *             designation: "Software Developer"
 *             dob: "1998-05-15"
 *             phone: "9876543210"
 *             address: "Lucknow, Uttar Pradesh, India"
 *
 *     responses:
 *
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: "Employee created successfully"
 *
 *                 company:
 *                   type: string
 *                   example: "ABC Technologies"
 *
 *                 addedBy:
 *                   type: object
 *                   properties:
 *                     admin_id:
 *                       type: integer
 *                       example: 2
 *
 *                 employee:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 15
 *
 *                     admin_id:
 *                       type: integer
 *                       example: 2
 *
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john.doe@example.com"
 *
 *                     department:
 *                       type: string
 *                       example: "Development"
 *
 *                     designation:
 *                       type: string
 *                       example: "Software Developer"
 *
 *                     dob:
 *                       type: string
 *                       format: date
 *                       example: "1998-05-15"
 *
 *                     phone:
 *                       type: string
 *                       example: "9876543210"
 *
 *                     address:
 *                       type: string
 *                       example: "Lucknow, Uttar Pradesh, India"
 *
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-08-27T10:30:00.000Z"
 *
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *
 *       400:
 *         description: Required fields are missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Name, email and password are required"
 *
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *
 *       403:
 *         description: Admin not found, inactive, or access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Admin not found or inactive"
 *
 *       409:
 *         description: Employee email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Employee email already exists"
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/employees",authMiddleware,Admin,addEmployee);

// Get Employees
/**
 * @swagger
 * /api/employees-get:
 *   post:
 *     summary: Get all employees
 *     description: |
 *       Fetch employees belonging to the logged-in Admin.
 *       Supports pagination, sorting, keyword search and active/inactive filtering.
 *     tags:
 *       - Employees
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               page:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 example: 1
 *
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 10
 *                 example: 10
 *
 *               sortedBy:
 *                 type: string
 *                 default: created_at
 *                 enum:
 *                   - id
 *                   - name
 *                   - email
 *                   - department
 *                   - designation
 *                   - phone
 *                   - dob
 *                   - created_at
 *                   - is_active
 *                 example: name
 *
 *               sortOrder:
 *                 type: string
 *                 default: DESC
 *                 enum:
 *                   - ASC
 *                   - DESC
 *                 example: ASC
 *
 *               searchByKeyword:
 *                 type: string
 *                 default: ""
 *                 description: Search by employee name, email, department, designation or phone
 *                 example: John
 *
 *               isActive:
 *                 type: boolean
 *                 description: Filter employees by active/inactive status. Leave empty to get all employees.
 *                 example: true
 *
 *     responses:
 *
 *       200:
 *         description: Employees fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Employees fetched successfully
 *
 *                 company:
 *                   type: string
 *                   nullable: true
 *                   example: ABC Technologies Pvt Ltd
 *
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalEmployees:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPreviousPage:
 *                       type: boolean
 *                       example: false
 *
 *                 sorting:
 *                   type: object
 *                   properties:
 *                     sortedBy:
 *                       type: string
 *                       example: name
 *                     sortOrder:
 *                       type: string
 *                       example: ASC
 *
 *                 filters:
 *                   type: object
 *                   properties:
 *                     searchByKeyword:
 *                       type: string
 *                       example: John
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *
 *                 count:
 *                   type: integer
 *                   example: 10
 *
 *                 employees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       admin_id:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: john@example.com
 *                       department:
 *                         type: string
 *                         example: IT
 *                       designation:
 *                         type: string
 *                         example: Software Developer
 *                       phone:
 *                         type: string
 *                         example: "9876543210"
 *                       address:
 *                         type: string
 *                         example: Lucknow, Uttar Pradesh
 *                       dob:
 *                         type: string
 *                         format: date
 *                         example: 1998-05-15
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       company_name:
 *                         type: string
 *                         example: ABC Technologies Pvt Ltd
 *
 *       400:
 *         description: Invalid pagination, sorting or filter parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Page must be a positive number
 *
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *
 *       403:
 *         description: Forbidden - Only Admin can access this API
 *
 *       500:
 *         description: Internal server error
 */
router.post("/employees-get",authMiddleware,Admin,getEmployees);

// Get Single Employee
/**
 * @swagger
 * /api/employeesById:
 *   post:
 *     summary: Get employee by ID
 *     description: Fetch a specific employee belonging to the currently logged-in Admin.
 *     tags:
 *       - Employees
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the employee to fetch
 *                 example: 5
 *
 *     responses:
 *
 *       200:
 *         description: Employee fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Employee fetched successfully
 *
 *                 employee:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *
 *                     admin_id:
 *                       type: integer
 *                       example: 2
 *
 *                     name:
 *                       type: string
 *                       example: John Doe
 *
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john@example.com
 *
 *                     department:
 *                       type: string
 *                       example: IT
 *
 *                     designation:
 *                       type: string
 *                       example: Software Developer
 *
 *                     phone:
 *                       type: string
 *                       example: "9876543210"
 *
 *                     dob:
 *                       type: string
 *                       format: date
 *                       example: 1998-05-15
 *
 *                     address:
 *                       type: string
 *                       example: Lucknow, Uttar Pradesh
 *
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *
 *                     company_name:
 *                       type: string
 *                       example: ABC Technologies Pvt Ltd
 *
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-08-27T10:30:00.000Z
 *
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2026-08-27T11:30:00.000Z
 *
 *       400:
 *         description: Employee ID is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Employee ID is required
 *
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *
 *       403:
 *         description: Forbidden - Only Admin can access this API
 *
 *       404:
 *         description: Employee not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Employee not found or access denied
 *
 *       500:
 *         description: Internal server error
 */
router.post("/employeesById",authMiddleware,Admin,getEmployeeById);

// Update Employee
/**
 * @swagger
 * /api/employees-update:
 *   put:
 *     summary: Update an employee
 *     description: Update employee details. Only the Admin who owns the employee can update that employee.
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - email
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 5
 *                 description: Employee ID
 *
 *               name:
 *                 type: string
 *                 example: Rahul Kumar
 *                 description: Employee name
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: rahul@gmail.com
 *                 description: Employee email
 *
 *               designation:
 *                 type: string
 *                 example: Software Developer
 *                 description: Employee designation
 *
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *                 description: Employee phone number
 *
 *               department:
 *                 type: string
 *                 example: Development
 *                 description: Employee department
 *
 *               address:
 *                 type: string
 *                 example: Lucknow, Uttar Pradesh
 *                 description: Employee address
 *
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Employee updated successfully
 *                 updatedBy:
 *                   type: object
 *                   properties:
 *                     admin_id:
 *                       type: integer
 *                       example: 2
 *                 employee:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *                     admin_id:
 *                       type: integer
 *                       example: 2
 *                     name:
 *                       type: string
 *                       example: Rahul Kumar
 *                     email:
 *                       type: string
 *                       example: rahul@gmail.com
 *                     designation:
 *                       type: string
 *                       example: Software Developer
 *                     phone:
 *                       type: string
 *                       example: "9876543210"
 *                     department:
 *                       type: string
 *                       example: Development
 *                     address:
 *                       type: string
 *                       example: Lucknow, Uttar Pradesh
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Name and email are required
 *
 *       401:
 *         description: Unauthorized - JWT token missing or invalid
 *
 *       403:
 *         description: Forbidden - Admin access required
 *
 *       404:
 *         description: Employee not found or access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Employee not found or access denied
 *
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: This email is already registered
 *
 *       500:
 *         description: Internal server error
 */
router.put("/employees-update",authMiddleware,Admin,updateEmployee);


// Delete Employee
/**
 * @swagger
 * /api/employees-delete:
 *   patch:
 *     summary: Delete an employee
 *     description: Soft delete an employee by setting is_active to false. Only the Admin who owns the employee can delete the employee.
 *     tags:
 *       - Employees
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 5
 *                 description: Employee ID to delete
 *
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: Employee deleted successfully
 *
 *                 deletedBy:
 *                   type: object
 *                   properties:
 *                     admin_id:
 *                       type: integer
 *                       example: 2
 *
 *                 employee:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *
 *                     admin_id:
 *                       type: integer
 *                       example: 2
 *
 *                     name:
 *                       type: string
 *                       example: Rahul Kumar
 *
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: rahul@gmail.com
 *
 *                     is_active:
 *                       type: boolean
 *                       example: false
 *
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-08-27T10:30:00.000Z"
 *
 *       400:
 *         description: Employee ID is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *
 *                 message:
 *                   type: string
 *                   example: Employee ID is required
 *
 *       401:
 *         description: Unauthorized - JWT token is missing or invalid
 *
 *       403:
 *         description: Forbidden - Admin access required
 *
 *       404:
 *         description: Employee not found, already deleted, or access denied
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *
 *                 message:
 *                   type: string
 *                   example: Employee not found, already deleted, or access denied
 *
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.patch("/employees-delete",authMiddleware,Admin,deleteEmployee);

module.exports = router;