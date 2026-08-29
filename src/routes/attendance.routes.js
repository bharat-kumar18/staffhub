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
/**
 * @swagger
 * /api/attendance/check-in:
 *   post:
 *     summary: Mark employee attendance
 *     description: Marks the authenticated employee's check-in attendance using the current date, time, and location. The employee ID is obtained from the JWT token. Attendance cannot be marked on company holidays, and an employee can mark attendance only once per day.
 *     tags:
 *       - Attendance
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
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 format: double
 *                 minimum: -90
 *                 maximum: 90
 *                 description: Current latitude of the employee
 *                 example: 26.8467
 *
 *               longitude:
 *                 type: number
 *                 format: double
 *                 minimum: -180
 *                 maximum: 180
 *                 description: Current longitude of the employee
 *                 example: 80.9462
 *
 *     responses:
 *       201:
 *         description: Attendance marked successfully
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
 *                   example: "Attendance marked successfully"
 *                 attendance:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 25
 *                     employee_id:
 *                       type: integer
 *                       example: 12
 *                     admin_id:
 *                       type: integer
 *                       example: 5
 *                     attendance_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-08-27"
 *                     check_in:
 *                       type: string
 *                       example: "09:15:30"
 *                     status:
 *                       type: string
 *                       enum:
 *                         - present
 *                         - late
 *                       example: present
 *                     latitude:
 *                       type: number
 *                       format: double
 *                       example: 26.8467
 *                     longitude:
 *                       type: number
 *                       format: double
 *                       example: 80.9462
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-08-27T03:45:30.000Z"
 *
 *       200:
 *         description: Today is a company holiday
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
 *                   example: "Today is a company holiday. Attendance cannot be marked."
 *                 holiday:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 3
 *                     holiday_name:
 *                       type: string
 *                       example: "Independence Day"
 *                     holiday_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-08-27"
 *                     description:
 *                       type: string
 *                       example: "Company holiday"
 *
 *       400:
 *         description: Invalid location data
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
 *                     locationRequired:
 *                       value: "Current location is required. Please provide latitude and longitude"
 *                     invalidLatitude:
 *                       value: "Invalid latitude"
 *                     invalidLongitude:
 *                       value: "Invalid longitude"
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
 *         description: Employee not found or inactive
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
 *                   example: "Employee not found or inactive"
 *
 *       404:
 *         description: Office timing is not configured
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
 *                   example: "Office timing has not been configured by Admin"
 *
 *       409:
 *         description: Attendance has already been marked for today
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
 *                   example: "Attendance already marked for today"
 *                 attendance:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 25
 *                     check_in:
 *                       type: string
 *                       example: "09:15:30"
 *                     status:
 *                       type: string
 *                       example: present
 *                     latitude:
 *                       type: number
 *                       example: 26.8467
 *                     longitude:
 *                       type: number
 *                       example: 80.9462
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
router.post("/attendance/check-in",authMiddleware,checkIn);

// Employee check-out
/**
 * @swagger
 * /api/attendance/check-out:
 *   post:
 *     summary: Mark employee check-out
 *     description: Marks the check-out time for the authenticated employee's active attendance record for today. The employee ID is obtained from the JWT token.
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Check-out successful
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
 *                   example: "Check-out successful"
 *                 attendance:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 25
 *                     employee_id:
 *                       type: integer
 *                       example: 12
 *                     admin_id:
 *                       type: integer
 *                       example: 5
 *                     attendance_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-08-27"
 *                     check_in:
 *                       type: string
 *                       example: "09:15:30"
 *                     check_out:
 *                       type: string
 *                       example: "18:05:20"
 *                     status:
 *                       type: string
 *                       enum:
 *                         - present
 *                         - late
 *                       example: present
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-08-27T12:35:20.000Z"
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
 *       404:
 *         description: No active attendance found for today
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
 *                   example: "No active attendance found for today"
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
router.post("/attendance/check-out",authMiddleware,checkOut);

// EMPLOYEE MY ATTENDANCE
/**
 * @swagger
 * /api/myAttendance:
 *   post:
 *     summary: Get my attendance
 *     description: Fetches the authenticated employee's attendance records with pagination and optional date filters. The employee ID is obtained from the JWT token.
 *     tags:
 *       - Attendance
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *         example: 1
 *
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of attendance records per page. Maximum is 100.
 *         example: 10
 *
 *       - in: query
 *         name: from_date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering attendance records
 *         example: "2026-08-01"
 *
 *       - in: query
 *         name: to_date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering attendance records
 *         example: "2026-08-27"
 *
 *     responses:
 *       200:
 *         description: My attendance fetched successfully
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
 *                   example: "My attendance fetched successfully"
 *
 *                 employee:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 12
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: john@example.com
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
 *                     totalAttendance:
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
 *                 attendance:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 101
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2026-08-27"
 *                       check_in:
 *                         type: string
 *                         nullable: true
 *                         example: "09:15:30"
 *                       check_out:
 *                         type: string
 *                         nullable: true
 *                         example: "18:05:20"
 *                       worked_hours:
 *                         type: string
 *                         example: "08:49"
 *                       late_hours:
 *                         type: string
 *                         example: "00:15"
 *                       status:
 *                         type: string
 *                         enum:
 *                           - present
 *                           - late
 *                           - leave
 *                           - holiday
 *                         example: present
 *                       remarks:
 *                         type: string
 *                         nullable: true
 *                         example: "Late arrival"
 *
 *       400:
 *         description: Invalid pagination parameters
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
 *         description: Employee not found or inactive
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
 *                   example: "Employee not found or inactive"
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
router.post("/myAttendance",authMiddleware,getMyAttendance);

// Get Attendence
/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Get employee attendance
 *     description: Fetch attendance records of employees belonging to the authenticated Admin. Supports pagination, sorting, employee search, and attendance status filtering.
 *     tags:
 *       - Attendance
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
 *
 *               page:
 *                 type: integer
 *                 minimum: 1
 *                 default: 1
 *                 description: Page number
 *                 example: 1
 *
 *               limit:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 10
 *                 description: Number of attendance records per page. Maximum 100.
 *                 example: 10
 *
 *               sortedBy:
 *                 type: string
 *                 enum:
 *                   - id
 *                   - employee_id
 *                   - name
 *                   - attendance_date
 *                   - check_in
 *                   - check_out
 *                   - status
 *                   - created_at
 *                 default: attendance_date
 *                 description: Column by which attendance records should be sorted
 *                 example: attendance_date
 *
 *               sortOrder:
 *                 type: string
 *                 enum:
 *                   - ASC
 *                   - DESC
 *                 default: DESC
 *                 description: Sorting order
 *                 example: DESC
 *
 *               searchByKeyword:
 *                 type: string
 *                 description: Search employee by name or email
 *                 example: "John"
 *
 *               status:
 *                 type: string
 *                 enum:
 *                   - present
 *                   - late
 *                   - absent
 *                 description: Filter attendance by status
 *                 example: present
 *
 *     responses:
 *
 *       200:
 *         description: Attendance fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: "Attendance fetched successfully"
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
 *                     totalAttendance:
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
 *                       example: attendance_date
 *                     sortOrder:
 *                       type: string
 *                       example: DESC
 *
 *                 filters:
 *                   type: object
 *                   properties:
 *                     searchByKeyword:
 *                       type: string
 *                       example: John
 *                     status:
 *                       type: string
 *                       example: present
 *
 *                 count:
 *                   type: integer
 *                   example: 10
 *
 *                 attendance:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *
 *                       id:
 *                         type: integer
 *                         example: 101
 *
 *                       employee_id:
 *                         type: integer
 *                         example: 15
 *
 *                       employee_name:
 *                         type: string
 *                         example: John Doe
 *
 *                       employee_email:
 *                         type: string
 *                         format: email
 *                         example: john@example.com
 *
 *                       admin_id:
 *                         type: integer
 *                         example: 2
 *
 *                       company_name:
 *                         type: string
 *                         example: ABC Technologies
 *
 *                       attendance_date:
 *                         type: string
 *                         format: date
 *                         example: "2026-08-27"
 *
 *                       check_in:
 *                         type: string
 *                         nullable: true
 *                         example: "09:15:30"
 *
 *                       check_out:
 *                         type: string
 *                         nullable: true
 *                         example: "18:05:20"
 *
 *                       status:
 *                         type: string
 *                         enum:
 *                           - present
 *                           - late
 *                           - absent
 *                         example: present
 *
 *                       remarks:
 *                         type: string
 *                         nullable: true
 *                         example: "Late arrival"
 *
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-08-27T09:15:30.000Z"
 *
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-08-27T18:05:20.000Z"
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
 *                       value: "Invalid sortedBy"
 *                     invalidSortOrder:
 *                       value: "Invalid sortOrder. Use ASC or DESC"
 *                     invalidStatus:
 *                       value: "Invalid status. Use present, late or absent"
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
 *         description: Access denied - Admin role required
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
 *                   example: "Access denied"
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
router.post("/attendance",authMiddleware,Admin,getAttendance);

// Modify the Attendence
/**
 * @swagger
 * /api/attendance/modify:
 *   patch:
 *     summary: Modify employee attendance
 *     description: Allows an authenticated Admin to modify an employee's attendance record. The Admin can update status, check-in time, check-out time, or any combination of these fields. Fields not provided will retain their existing values.
 *     tags:
 *       - Attendance
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
 *                 description: Attendance record ID
 *                 example: 101
 *
 *               status:
 *                 type: string
 *                 enum:
 *                   - present
 *                   - absent
 *                   - late
 *                 description: New attendance status
 *                 example: present
 *
 *               check_in:
 *                 type: string
 *                 description: Employee check-in time in HH:mm:ss format
 *                 example: "09:15:30"
 *
 *               check_out:
 *                 type: string
 *                 description: Employee check-out time in HH:mm:ss format
 *                 example: "18:05:20"
 *
 *           example:
 *             id: 101
 *             status: present
 *             check_in: "09:15:30"
 *             check_out: "18:05:20"
 *
 *     responses:
 *
 *       200:
 *         description: Attendance modified successfully
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
 *                   example: "Attendance modified successfully"
 *
 *                 modifiedBy:
 *                   type: object
 *                   properties:
 *                     admin_id:
 *                       type: integer
 *                       example: 2
 *
 *                 attendance:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 101
 *
 *                     employee_id:
 *                       type: integer
 *                       example: 15
 *
 *                     admin_id:
 *                       type: integer
 *                       example: 2
 *
 *                     attendance_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-08-27"
 *
 *                     check_in:
 *                       type: string
 *                       nullable: true
 *                       example: "09:15:30"
 *
 *                     check_out:
 *                       type: string
 *                       nullable: true
 *                       example: "18:05:20"
 *
 *                     status:
 *                       type: string
 *                       enum:
 *                         - present
 *                         - absent
 *                         - late
 *                       example: present
 *
 *                     latitude:
 *                       type: number
 *                       format: double
 *                       nullable: true
 *                       example: 26.8467
 *
 *                     longitude:
 *                       type: number
 *                       format: double
 *                       nullable: true
 *                       example: 80.9462
 *
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-08-27T09:15:30.000Z"
 *
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-08-27T18:05:20.000Z"
 *
 *       400:
 *         description: Invalid request data
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
 *                       value: "Attendance ID is required"
 *                     invalidStatus:
 *                       value: "Invalid status. Use present, absent or late"
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
 *         description: Forbidden - Admin access required
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
 *                   example: "Access denied"
 *
 *       404:
 *         description: Attendance not found or access denied
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
 *                   example: "Attendance not found or access denied"
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
router.patch("/attendance/modify",authMiddleware,Admin,modifyAttendance);


module.exports = router;