const express = require('express');

const router = express.Router();

const  authMiddleware  = require("../middleware/authMiddleware");
const  { SuperAdmin } = require("../middleware/roleMiddleware");
const { signup, login, forgotPassword, verifyOTP, resetPassword, changePassword, getAdmins, addUser, updateUser, softDeleteUser } = require("../controller/authController");
// const {getEmployees} = require("../controller/employeeController");


// SignUp Swagger and Signup
/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Register a new Admin
 *     description: Creates a new Admin user account.
 *     tags:
 *       - Authentication
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
 *                 example: Bharat Kumar
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 example: bharat@example.com
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *
 *               companyName:
 *                 type: string
 *                 example: StaffHUB Technologies
 *
 *     responses:
 *       201:
 *         description: User registered successfully
 *
 *       400:
 *         description: Required fields are missing
 *
 *       409:
 *         description: User already exists
 *
 *       500:
 *         description: Internal server error
 */
router.post("/signup", signup);

// Login swagger and Login
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     description: |
 *       Login API for Super Admin, Admin and Employee.
 *
 *       The API first checks the users table for Super Admin/Admin.
 *       If the user is not found, it checks the employees table.
 *
 *       A JWT token is returned after successful authentication.
 *
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@gmail.com
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Admin@123
 *
 *     responses:
 *
 *       200:
 *         description: Login successful
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
 *                   example: Login successful
 *
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *
 *                     name:
 *                       type: string
 *                       example: Bharat Kumar
 *
 *                     email:
 *                       type: string
 *                       example: admin@gmail.com
 *
 *                     role_id:
 *                       type: integer
 *                       example: 2
 *
 *                     role:
 *                       type: string
 *                       example: admin
 *
 *                     company_name:
 *                       type: string
 *                       example: StaffHUB
 *
 *       400:
 *         description: Email or password missing
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
 *                   example: Email and password are required
 *
 *       401:
 *         description: Invalid credentials
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
 *                   example: Invalid email or password
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
router.post("/login", login);

// ForgetPassword Swagger and ForgetPassword
/**
 * @swagger
 * /api/forgotPassword:
 *   post:
 *     summary: Send OTP for password reset
 *     description: Generates a 6-digit OTP and sends it to the user's registered email address. The OTP is valid for 10 minutes.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: employee@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
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
 *                   example: OTP sent successfully
 *
 *       400:
 *         description: Email is required
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
 *                   example: Email is required
 *
 *       404:
 *         description: User with this email does not exist
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
 *                   example: User with this email does not exist
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
 *                   example: Internal server error
 */
router.post("/forgotPassword", forgotPassword);

// VerifyOTP swagger and VerifyOPT
/**
 * @swagger
 * /api/verifyOtp:
 *   post:
 *     summary: Verify OTP for password reset
 *     description: Verifies the OTP sent to the user's email and returns a temporary reset token if the OTP is valid.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: Email address of the user
 *               otp:
 *                 type: string
 *                 example: "123456"
 *                 description: 6-digit OTP received by email
 *     responses:
 *       200:
 *         description: OTP verified successfully
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
 *                   example: OTP verified successfully
 *                 resetToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *       400:
 *         description: Bad request
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
 *                   example: Email and OTP are required
 *
 *       404:
 *         description: User not found
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
 *                   example: User not found
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
 *                   example: Internal server error
 */
router.post("/verifyOtp", verifyOTP);


/**
 * @swagger
 * /api/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Resets the user's password using the temporary reset token received after successful OTP verification.
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *                 description: Temporary reset token received after OTP verification
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password for the user
 *                 example: NewPassword@123
 *
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: Password reset successfully
 *
 *       400:
 *         description: Bad request
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
 *                   examples:
 *                     missingFields:
 *                       value: Reset token and new password are required
 *                     samePassword:
 *                       value: Your password is same as old password. Please enter a new password
 *
 *       401:
 *         description: Invalid or expired reset token
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
 *                   examples:
 *                     expired:
 *                       value: Reset token has expired
 *                     invalid:
 *                       value: Invalid reset token
 *
 *       404:
 *         description: User not found
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
 *                   example: User not found
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
 *                   example: Internal server error
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/change-password:
 *   post:
 *     summary: Change user password
 *     description: Allows an authenticated user to change their password by providing their current password and a new password.
 *     tags:
 *       - Authentication
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
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 description: User's current password
 *                 example: OldPassword@123
 *
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password. Must be different from the old password.
 *                 example: NewPassword@123
 *
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: Password changed successfully
 *
 *       400:
 *         description: Invalid request or new password is same as old password
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
 *                   examples:
 *                     missingFields:
 *                       value: Old password and new password are required
 *                     samePassword:
 *                       value: New password must be different from old password
 *
 *       401:
 *         description: Unauthorized or old password is incorrect
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
 *                   example: Old password is incorrect
 *
 *       404:
 *         description: User not found
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
 *                   example: User not found
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
 *                   example: Internal server error
 */
router.post("/change-password", authMiddleware, changePassword);


// SUPER ADMIN ONLY

// Get all Admin users
/**
 * @swagger
 * /api/admins:
 *   post:
 *     summary: Get all Admin users
 *     description: Fetches a paginated list of Admin users. Only authenticated Super Admin users can access this API. Supports pagination, sorting, keyword search, and active/inactive filtering.
 *     tags:
 *       - Super Admin
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
 *                 description: Page number
 *
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 10
 *                 example: 10
 *                 description: Number of users per page. Maximum value is 100.
 *
 *               sortedBy:
 *                 type: string
 *                 enum:
 *                   - id
 *                   - name
 *                   - email
 *                   - company_name
 *                   - created_at
 *                   - role_id
 *                 default: created_at
 *                 example: name
 *                 description: Column by which the Admin users should be sorted
 *
 *               sortOrder:
 *                 type: string
 *                 enum:
 *                   - ASC
 *                   - DESC
 *                 default: DESC
 *                 example: ASC
 *                 description: Sorting order
 *
 *               searchByKeyword:
 *                 type: string
 *                 default: ""
 *                 example: john
 *                 description: Search Admin users by name or email
 *
 *               isActive:
 *                 type: boolean
 *                 example: true
 *                 description: Filter users by active status. Omit this field to return both active and inactive users.
 *
 *     responses:
 *       200:
 *         description: Admin users fetched successfully
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
 *                   example: "Admin users fetched successfully"
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
 *                     totalUsers:
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
 *                       example: john
 *                     isActive:
 *                       oneOf:
 *                         - type: boolean
 *                         - type: string
 *                           example: all
 *                       example: true
 *
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: john@example.com
 *                       company_name:
 *                         type: string
 *                         example: ABC Technologies
 *                       role_id:
 *                         type: integer
 *                         example: 2
 *                       role_name:
 *                         type: string
 *                         example: admin
 *                       is_active:
 *                         type: boolean
 *                         example: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-08-27T10:30:00.000Z"
 *
 *       400:
 *         description: Invalid request parameters
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
 *                   examples:
 *                     invalidPage:
 *                       value: "Page must be a positive number"
 *                     invalidLimit:
 *                       value: "Limit must be a positive number"
 *                     invalidSortedBy:
 *                       value: "Invalid sortedBy. Allowed values: id, name, email, company_name, created_at, role_id"
 *                     invalidSortOrder:
 *                       value: "Invalid sortOrder. Use ASC or DESC"
 *                     invalidIsActive:
 *                       value: "isActive must be true or false"
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
 *         description: Forbidden - Only Super Admin can access this API
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
 *                   example: "Access denied. Super Admin only."
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
router.post("/admins",authMiddleware,SuperAdmin,getAdmins);



// Add User-API

/**
 * @swagger
 * /api/add-user:
 *   post:
 *     summary: Add a new Admin user
 *     description: Creates a new Admin user. Only an authenticated Super Admin can access this API.
 *     tags:
 *       - Super Admin
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
 *                 description: Full name of the Admin
 *                 example: John Doe
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the Admin
 *                 example: john@example.com
 *
 *               companyName:
 *                 type: string
 *                 description: Company name associated with the Admin
 *                 example: ABC Technologies
 *
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password for the Admin account
 *                 example: Admin@12345
 *
 *     responses:
 *       201:
 *         description: Admin created successfully
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
 *                   example: "Admin created successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 10
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john@example.com
 *                     company_name:
 *                       type: string
 *                       example: ABC Technologies
 *                     role_id:
 *                       type: integer
 *                       example: 2
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-08-27T10:30:00.000Z"
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
 *         description: Forbidden - Only Super Admin can add Admin users
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
 *                   example: "Access denied. Super Admin only."
 *
 *       409:
 *         description: Email already exists
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
 *                   example: "User with this email already exists"
 *
 *       500:
 *         description: Internal server error or Admin role not found
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
 *                   examples:
 *                     roleNotFound:
 *                       value: "Admin role not found"
 *                     serverError:
 *                       value: "Internal server error"
 */
router.post("/add-user",authMiddleware,SuperAdmin,addUser);

// Update User API

/**
 * @swagger
 * /api/update-user:
 *   put:
 *     summary: Update an Admin user
 *     description: Updates the name, email, and company name of an existing active Admin user. Only an authenticated Super Admin can use this API.
 *     tags:
 *       - Super Admin
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
 *                 description: ID of the Admin user to update
 *                 example: 10
 *
 *               name:
 *                 type: string
 *                 description: Updated name of the Admin
 *                 example: John Smith
 *
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated email address of the Admin
 *                 example: john.smith@example.com
 *
 *               companyName:
 *                 type: string
 *                 description: Updated company name
 *                 example: XYZ Technologies
 *
 *     responses:
 *       200:
 *         description: Admin updated successfully
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
 *                   example: "Admin updated successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 10
 *                     name:
 *                       type: string
 *                       example: John Smith
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john.smith@example.com
 *                     company_name:
 *                       type: string
 *                       example: XYZ Technologies
 *                     role_id:
 *                       type: integer
 *                       example: 2
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-08-27T10:30:00.000Z"
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
 *                   examples:
 *                     missingId:
 *                       value: "Admin ID is required"
 *                     missingFields:
 *                       value: "Name and email are required"
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
 *         description: Forbidden - Only Super Admin can update Admin users
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
 *                   example: "Access denied. Super Admin only."
 *
 *       404:
 *         description: Admin not found or Admin is inactive
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
 *                   example: "Admin not found"
 *
 *       409:
 *         description: Email is already registered
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
 *                   example: "This email is already registered"
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
router.put("/update-user",authMiddleware,SuperAdmin,updateUser);

// Soft - Delete API

/**
 * @swagger
 * /api/users/soft-delete:
 *   patch:
 *     summary: Soft delete an Admin user
 *     description: Deactivates an Admin user by setting is_active to false. The user is not permanently removed from the database. Only an authenticated Super Admin can use this API.
 *     tags:
 *       - Super Admin
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
 *                 description: ID of the Admin user to soft delete
 *                 example: 10
 *
 *     responses:
 *       200:
 *         description: Admin soft deleted successfully
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
 *                   example: "Admin soft deleted successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 10
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john@example.com
 *                     role_id:
 *                       type: integer
 *                       example: 2
 *                     is_active:
 *                       type: boolean
 *                       example: false
 *
 *       400:
 *         description: Invalid request or user is already inactive
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
 *                   examples:
 *                     missingId:
 *                       value: "User ID is required"
 *                     alreadyInactive:
 *                       value: "User is already inactive"
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
 *         description: Forbidden - User cannot be soft deleted
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
 *                   examples:
 *                     superAdmin:
 *                       value: "Super Admin cannot be deleted"
 *                     invalidRole:
 *                       value: "Only Admin users can be soft deleted"
 *
 *       404:
 *         description: User not found
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
 *                   example: "User not found"
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
router.patch("/users/soft-delete",authMiddleware,SuperAdmin,softDeleteUser);



module.exports = router;