const pool = require("../config/db");
// const { sendMail } = require("../utils/sendMail");
const {
    sendLeaveRequestEmail,
    sendLeaveStatusEmail
} = require("../utils/sendMail");


// =====================================================
// EMPLOYEE APPLY LEAVE
// =====================================================

exports.applyLeave = async (req, res) => {

    try {

        // -----------------------------------------
        // 1. Get employee ID from JWT
        // -----------------------------------------

        const employeeId = req.user.id;


        // -----------------------------------------
        // 2. Get data from BODY
        // -----------------------------------------

        const {
            leave_type,
            from_date,
            to_date,
            reason
        } = req.body;


        // -----------------------------------------
        // 3. Validate fields
        // -----------------------------------------

        if (
            !leave_type ||
            !from_date ||
            !to_date ||
            !reason
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Leave type, from date, to date and reason are required"

            });

        }


        // -----------------------------------------
        // 4. Validate dates
        // -----------------------------------------

        if (new Date(from_date) > new Date(to_date)) {

            return res.status(400).json({

                success: false,

                message:
                    "From date cannot be greater than to date"

            });

        }


        // -----------------------------------------
        // 5. Find employee + Admin
        // -----------------------------------------

        const employeeResult = await pool.query(
            `
            SELECT
                e.id,
                e.admin_id,
                e.name,
                e.email,
                e.is_active,

                u.name AS admin_name,
                u.email AS admin_email,
                u.company_name

            FROM employees e

            JOIN users u
                ON e.admin_id = u.id

            WHERE e.id = $1

            AND e.is_active = TRUE

            AND u.is_active = TRUE
            `,
            [
                employeeId
            ]
        );


        if (employeeResult.rows.length === 0) {

            return res.status(403).json({

                success: false,

                message:
                    "Employee not found or inactive"

            });

        }


        const employee =
            employeeResult.rows[0];


        // -----------------------------------------
        // 6. Check overlapping pending/approved leave
        // -----------------------------------------

        const existingLeave = await pool.query(
            `
            SELECT
                id,
                from_date,
                to_date,
                status

            FROM leaves

            WHERE employee_id = $1

            AND status IN ('pending', 'approved')

            AND from_date <= $3

            AND to_date >= $2
            `,
            [
                employeeId,
                from_date,
                to_date
            ]
        );


        if (existingLeave.rows.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Employee already has a pending or approved leave for these dates",

                existingLeave:
                    existingLeave.rows[0]

            });

        }


        // -----------------------------------------
        // 7. Insert Leave
        // -----------------------------------------

        const result = await pool.query(
            `
            INSERT INTO leaves
            (
                employee_id,
                admin_id,
                leave_type,
                from_date,
                to_date,
                reason,
                status
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                'pending'
            )

            RETURNING
                id,
                employee_id,
                admin_id,
                leave_type,
                from_date,
                to_date,
                reason,
                status,
                created_at
            `,
            [
                employeeId,
                employee.admin_id,
                leave_type,
                from_date,
                to_date,
                reason
            ]
        );


        const leave =
            result.rows[0];


        // -----------------------------------------
        // 8. Send email to Admin
        // -----------------------------------------

        try {

            await sendLeaveRequestEmail(

                employee.admin_email,

                "New Leave Request - StaffHUB",

                `
                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                ">

                    <h2>New Leave Request</h2>

                    <p>
                        A new leave request has been submitted.
                    </p>

                    <hr>

                    <p>
                        <strong>Employee:</strong>
                        ${employee.name}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${employee.email}
                    </p>

                    <p>
                        <strong>Leave Type:</strong>
                        ${leave_type}
                    </p>

                    <p>
                        <strong>From:</strong>
                        ${from_date}
                    </p>

                    <p>
                        <strong>To:</strong>
                        ${to_date}
                    </p>

                    <p>
                        <strong>Reason:</strong>
                        ${reason}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        Pending
                    </p>

                    <hr>

                    <p>
                        Please login to StaffHUB to approve or reject this request.
                    </p>

                </div>
                `
            );

        } catch (mailError) {

            console.error(
                "Admin Leave Email Error:",
                mailError
            );

        }


        // -----------------------------------------
        // 9. Response
        // -----------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "Leave request submitted successfully",

            leave:
                leave

        });


    } catch (error) {

        console.error(
            "Apply Leave Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

};

// =====================================================
// GET MY LEAVES - EMPLOYEE
// =====================================================

exports.getMyLeaves = async (req, res) => {

    try {

        // -----------------------------------------
        // 1. Get Employee ID from JWT
        // -----------------------------------------

        const employeeId = req.user.id;


        // -----------------------------------------
        // 2. Check Employee
        // -----------------------------------------

        const employeeResult = await pool.query(
            `
            SELECT
                e.id,
                e.name,
                e.email,
                e.admin_id,
                e.is_active,

                u.company_name,
                u.name AS admin_name

            FROM employees e

            JOIN users u
                ON e.admin_id = u.id

            WHERE e.id = $1

            AND e.is_active = TRUE

            AND u.is_active = TRUE
            `,
            [
                employeeId
            ]
        );


        if (employeeResult.rows.length === 0) {

            return res.status(403).json({

                success: false,

                message:
                    "Employee not found or inactive"

            });

        }


        const employee =
            employeeResult.rows[0];


        // -----------------------------------------
        // 3. Get Employee Leaves
        // -----------------------------------------

        const result = await pool.query(
            `
            SELECT

                l.id AS leave_id,

                l.employee_id,

                l.admin_id,

                l.leave_type,

                l.from_date,

                l.to_date,

                (
                    l.to_date - l.from_date + 1
                ) AS duration_days,

                l.reason,

                l.status,

                l.rejection_reason,

                l.created_at,

                l.updated_at

            FROM leaves l

            WHERE l.employee_id = $1

            AND l.admin_id = $2

            ORDER BY
                l.created_at DESC
            `,
            [
                employeeId,
                employee.admin_id
            ]
        );


        // -----------------------------------------
        // 4. Prepare response data
        // -----------------------------------------

        const leaves = result.rows.map(leave => {

            let adminResponse = "";

            if (leave.status === "pending") {

                adminResponse =
                    "Waiting for admin response";

            }

            else if (leave.status === "approved") {

                adminResponse =
                    "Approved by Admin";

            }

            else if (leave.status === "rejected") {

                adminResponse =
                    leave.rejection_reason
                        ? `Rejected: ${leave.rejection_reason}`
                        : "Rejected by Admin";

            }


            return {

                leave_id:
                    leave.leave_id,

                leave_type:
                    leave.leave_type,

                duration: {

                    from_date:
                        leave.from_date,

                    to_date:
                        leave.to_date,

                    total_days:
                        Number(leave.duration_days)

                },

                reason:
                    leave.reason,

                date:
                    leave.created_at,

                status:
                    leave.status,

                admin_response:
                    adminResponse,

                rejection_reason:
                    leave.rejection_reason || null,

                updated_at:
                    leave.updated_at

            };

        });


        // -----------------------------------------
        // 5. Summary
        // -----------------------------------------

        const totalLeaves =
            leaves.length;


        const pendingLeaves =
            leaves.filter(
                leave => leave.status === "pending"
            ).length;


        const approvedLeaves =
            leaves.filter(
                leave => leave.status === "approved"
            ).length;


        const rejectedLeaves =
            leaves.filter(
                leave => leave.status === "rejected"
            ).length;


        // -----------------------------------------
        // 6. Response
        // -----------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "My leaves fetched successfully",

            employee: {

                employee_id:
                    employee.id,

                name:
                    employee.name,

                email:
                    employee.email,

                company_name:
                    employee.company_name

            },

            summary: {

                total:
                    totalLeaves,

                pending:
                    pendingLeaves,

                approved:
                    approvedLeaves,

                rejected:
                    rejectedLeaves

            },

            count:
                leaves.length,

            leaves:
                leaves

        });


    } catch (error) {

        console.error(
            "Get My Leaves Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

};


// =====================================================
// GET ALL LEAVE REQUESTS FOR ADMIN
// =====================================================

exports.getAdminLeaveRequests = async (req, res) => {

    try {

        // -----------------------------------------
        // 1. Get Admin ID from JWT
        // -----------------------------------------

        const adminId = req.user.id;


        // -----------------------------------------
        // 2. Check logged-in Admin
        // -----------------------------------------

        const adminResult = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                company_name,
                role_id,
                is_active

            FROM users

            WHERE id = $1

            AND role_id = 2

            AND is_active = TRUE
            `,
            [adminId]
        );


        if (adminResult.rows.length === 0) {

            return res.status(403).json({

                success: false,

                message:
                    "Admin not found or inactive"

            });

        }


        // -----------------------------------------
        // 3. Get all leave requests
        // -----------------------------------------

        const result = await pool.query(
            `
            SELECT

                l.id AS leave_id,

                l.employee_id,

                e.name AS employee_name,

                e.email AS employee_email,

                e.department,

                e.designation,

                e.phone,

                l.leave_type,

                l.from_date,

                l.to_date,

                l.reason,

                l.status,

                l.rejection_reason,

                l.created_at,

                l.updated_at

            FROM leaves l

            JOIN employees e
                ON l.employee_id = e.id

            WHERE l.admin_id = $1

            AND e.admin_id = $1

            ORDER BY
                l.created_at DESC
            `,
            [adminId]
        );


        // -----------------------------------------
        // 4. Count leave requests
        // -----------------------------------------

        const totalRequests =
            result.rows.length;


        const pendingRequests =
            result.rows.filter(
                leave => leave.status === "pending"
            ).length;


        const approvedRequests =
            result.rows.filter(
                leave => leave.status === "approved"
            ).length;


        const rejectedRequests =
            result.rows.filter(
                leave => leave.status === "rejected"
            ).length;


        // -----------------------------------------
        // 5. Response
        // -----------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Leave requests fetched successfully",

            summary: {

                total_requests:
                    totalRequests,

                pending:
                    pendingRequests,

                approved:
                    approvedRequests,

                rejected:
                    rejectedRequests

            },

            leaves:
                result.rows

        });


    } catch (error) {

        console.error(
            "Get Admin Leave Requests Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

};


// =====================================================
// ADMIN APPROVE / REJECT LEAVE
// =====================================================

exports.decideLeave = async (req, res) => {

    try {

        // -----------------------------------------
        // 1. Get Admin ID from JWT
        // -----------------------------------------

        const adminId = req.user.id;


        // -----------------------------------------
        // 2. Get data from BODY
        // -----------------------------------------

        const {
            leave_id,
            status,
            rejection_reason
        } = req.body;


        // -----------------------------------------
        // 3. Validate leave ID
        // -----------------------------------------

        if (!leave_id) {

            return res.status(400).json({

                success: false,

                message:
                    "Leave ID is required"

            });

        }


        // -----------------------------------------
        // 4. Validate status
        // -----------------------------------------

        if (
            !status ||
            !["approved", "rejected"].includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Status must be approved or rejected"

            });

        }


        // -----------------------------------------
        // 5. Rejection reason required
        // -----------------------------------------

        if (
            status === "rejected" &&
            (
                !rejection_reason ||
                rejection_reason.trim() === ""
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Rejection reason is required"

            });

        }


        // -----------------------------------------
        // 6. Find Leave
        // -----------------------------------------

        const leaveResult = await pool.query(
            `
            SELECT

                l.id,
                l.employee_id,
                l.admin_id,
                l.leave_type,
                l.from_date,
                l.to_date,
                l.reason,
                l.status,

                e.name AS employee_name,
                e.email AS employee_email

            FROM leaves l

            JOIN employees e
                ON l.employee_id = e.id

            WHERE l.id = $1

            AND l.admin_id = $2

            AND e.admin_id = $2
            `,
            [
                leave_id,
                adminId
            ]
        );


        if (leaveResult.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Leave request not found or access denied"

            });

        }


        const leave =
            leaveResult.rows[0];


        // -----------------------------------------
        // 7. Check current status
        // -----------------------------------------

        if (leave.status !== "pending") {

            return res.status(409).json({

                success: false,

                message:
                    `Leave has already been ${leave.status}`

            });

        }


        // -----------------------------------------
        // 8. Update Leave
        // -----------------------------------------

        const result = await pool.query(
            `
            UPDATE leaves

            SET

                status = $1,

                rejection_reason = $2,

                updated_at = CURRENT_TIMESTAMP

            WHERE id = $3

            AND admin_id = $4

            RETURNING

                id,
                employee_id,
                admin_id,
                leave_type,
                from_date,
                to_date,
                reason,
                status,
                rejection_reason,
                created_at,
                updated_at
            `,
            [
                status,
                status === "rejected"
                    ? rejection_reason
                    : null,
                leave_id,
                adminId
            ]
        );


        const updatedLeave =
            result.rows[0];


        // -----------------------------------------
        // 9. Send email to Employee
        // -----------------------------------------

        let emailSubject = "";

        let emailBody = "";


        if (status === "approved") {

            emailSubject =
                "Leave Approved - StaffHUB";


            emailBody = `

                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                ">

                    <h2>Leave Approved</h2>

                    <p>
                        Hello ${leave.employee_name},
                    </p>

                    <p>
                        Your leave request has been
                        <strong>approved</strong>.
                    </p>

                    <hr>

                    <p>
                        <strong>Leave Type:</strong>
                        ${leave.leave_type}
                    </p>

                    <p>
                        <strong>From:</strong>
                        ${leave.from_date}
                    </p>

                    <p>
                        <strong>To:</strong>
                        ${leave.to_date}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        Approved
                    </p>

                    <hr>

                    <p>
                        Regards,<br>
                        StaffHUB
                    </p>

                </div>

            `;

        } else {

            emailSubject =
                "Leave Rejected - StaffHUB";


            emailBody = `

                <div style="
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                ">

                    <h2>Leave Rejected</h2>

                    <p>
                        Hello ${leave.employee_name},
                    </p>

                    <p>
                        Your leave request has been
                        <strong>rejected</strong>.
                    </p>

                    <hr>

                    <p>
                        <strong>Leave Type:</strong>
                        ${leave.leave_type}
                    </p>

                    <p>
                        <strong>From:</strong>
                        ${leave.from_date}
                    </p>

                    <p>
                        <strong>To:</strong>
                        ${leave.to_date}
                    </p>

                    <p>
                        <strong>Reason for Rejection:</strong>
                        ${rejection_reason}
                    </p>

                    <hr>

                    <p>
                        Regards,<br>
                        StaffHUB
                    </p>

                </div>

            `;

        }


        try {
 

      


            await sendLeaveStatusEmail({
                employeeEmail: leave.employee_email,
                employeeName: leave.employee_name,
                fromDate: leave.from_date,
                toDate: leave.to_date,
                status: status,
                rejectionReason:
                    status === "rejected" ? rejection_reason : null
            });

        } catch (mailError) {

            console.error(
                "Employee Leave Email Error:",
                mailError
            );

        }


        // -----------------------------------------
        // 10. Response
        // -----------------------------------------

        return res.status(200).json({

            success: true,

            message:
                status === "approved"
                    ? "Leave approved successfully"
                    : "Leave rejected successfully",

            decisionBy: {

                admin_id: adminId

            },

            leave:
                updatedLeave

        });


    } catch (error) {

        console.error(
            "Decide Leave Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

};

// ADD HOLIDAY 

exports.addHoliday = async (req, res) => {

    try {

        const adminId = req.user.id;

        const {
            holiday_name,
            holiday_date,
            description
        } = req.body;


        // -----------------------------------------
        // 1. Validate
        // -----------------------------------------

        if (!holiday_name || !holiday_date) {

            return res.status(400).json({

                success: false,

                message:
                    "Holiday name and holiday date are required"

            });

        }


        // -----------------------------------------
        // 2. Check Admin
        // -----------------------------------------

        const adminResult = await pool.query(
            `
            SELECT
                id,
                company_name,
                is_active

            FROM users

            WHERE id = $1

            AND role_id = 2

            AND is_active = TRUE
            `,
            [adminId]
        );


        if (adminResult.rows.length === 0) {

            return res.status(403).json({

                success: false,

                message:
                    "Admin not found or inactive"

            });

        }


        // -----------------------------------------
        // 3. Check duplicate holiday
        // -----------------------------------------

        const existingHoliday = await pool.query(
            `
            SELECT id

            FROM holidays

            WHERE admin_id = $1

            AND holiday_date = $2
            `,
            [
                adminId,
                holiday_date
            ]
        );


        if (existingHoliday.rows.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Holiday already exists for this date"

            });

        }


        // -----------------------------------------
        // 4. Insert Holiday
        // -----------------------------------------

        const result = await pool.query(
            `
            INSERT INTO holidays
            (
                admin_id,
                holiday_name,
                holiday_date,
                description
            )

            VALUES
            ($1, $2, $3, $4)

            RETURNING
                id,
                admin_id,
                holiday_name,
                holiday_date,
                description,
                is_active,
                created_at,
                updated_at
            `,
            [
                adminId,
                holiday_name,
                holiday_date,
                description || null
            ]
        );


        // -----------------------------------------
        // 5. Response
        // -----------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "Holiday added successfully",

            addedBy: {

                admin_id: adminId

            },

            holiday:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Add Holiday Error:",
            error
        );


        if (error.code === "23505") {

            return res.status(409).json({

                success: false,

                message:
                    "Holiday already exists for this date"

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

};

// GET HOLIDAY

exports.getHolidays = async (req, res) => {

    try {

        const adminId = req.user.id;


        // -----------------------------------------
        // 1. Get data from BODY
        // -----------------------------------------

        let {
            page = 1,
            limit = 10,
            sortedBy = "holiday_date",
            sortOrder = "ASC",
            searchByKeyword = "",
            isActive
        } = req.body;


        page = parseInt(page);
        limit = parseInt(limit);


        // -----------------------------------------
        // 2. Validate pagination
        // -----------------------------------------

        if (isNaN(page) || page < 1) {

            return res.status(400).json({

                success: false,

                message:
                    "Page must be a positive number"

            });

        }


        if (isNaN(limit) || limit < 1) {

            return res.status(400).json({

                success: false,

                message:
                    "Limit must be a positive number"

            });

        }


        if (limit > 100) {

            limit = 100;

        }


        const offset =
            (page - 1) * limit;


        // -----------------------------------------
        // 3. Allowed sorting
        // -----------------------------------------

        const allowedSortColumns = {

            id: "h.id",

            holiday_name: "h.holiday_name",

            holiday_date: "h.holiday_date",

            created_at: "h.created_at",

            is_active: "h.is_active"

        };


        if (!allowedSortColumns[sortedBy]) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid sortedBy. Allowed values: id, holiday_name, holiday_date, created_at, is_active"

            });

        }


        const sortColumn =
            allowedSortColumns[sortedBy];


        // -----------------------------------------
        // 4. Sort order
        // -----------------------------------------

        sortOrder =
            sortOrder.toUpperCase();


        if (
            !["ASC", "DESC"]
                .includes(sortOrder)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid sortOrder. Use ASC or DESC"

            });

        }


        // -----------------------------------------
        // 5. Conditions
        // -----------------------------------------

        const conditions = [

            "h.admin_id = $1"

        ];


        const queryParams = [

            adminId

        ];


        // -----------------------------------------
        // 6. Search
        // -----------------------------------------

        if (
            searchByKeyword &&
            searchByKeyword.trim() !== ""
        ) {

            queryParams.push(
                `%${searchByKeyword.trim()}%`
            );


            conditions.push(
                `
                (
                    h.holiday_name ILIKE $${queryParams.length}

                    OR

                    h.description ILIKE $${queryParams.length}
                )
                `
            );

        }


        // -----------------------------------------
        // 7. Active filter
        // -----------------------------------------

        if (
            isActive !== undefined &&
            isActive !== ""
        ) {

            if (
                isActive !== true &&
                isActive !== false &&
                isActive !== "true" &&
                isActive !== "false"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "isActive must be true or false"

                });

            }


            const activeValue =
                isActive === true ||
                isActive === "true";


            queryParams.push(activeValue);


            conditions.push(
                `h.is_active = $${queryParams.length}`
            );

        }


        const whereClause =
            conditions.join(" AND ");


        // -----------------------------------------
        // 8. Count
        // -----------------------------------------

        const countResult =
            await pool.query(
                `
                SELECT COUNT(*) AS total

                FROM holidays h

                WHERE ${whereClause}
                `,
                queryParams
            );


        const totalHolidays =
            parseInt(
                countResult.rows[0].total
            );


        // -----------------------------------------
        // 9. Pagination parameters
        // -----------------------------------------

        queryParams.push(limit);

        const limitIndex =
            queryParams.length;


        queryParams.push(offset);

        const offsetIndex =
            queryParams.length;


        // -----------------------------------------
        // 10. Get holidays
        // -----------------------------------------

        const result =
            await pool.query(
                `
                SELECT

                    h.id,

                    h.admin_id,

                    u.company_name,

                    h.holiday_name,

                    h.holiday_date,

                    h.description,

                    h.is_active,

                    h.created_at,

                    h.updated_at

                FROM holidays h

                JOIN users u
                    ON h.admin_id = u.id

                WHERE ${whereClause}

                ORDER BY
                    ${sortColumn}
                    ${sortOrder}

                LIMIT $${limitIndex}

                OFFSET $${offsetIndex}
                `,
                queryParams
            );


        // -----------------------------------------
        // 11. Pagination
        // -----------------------------------------

        const totalPages =
            Math.ceil(
                totalHolidays / limit
            );


        // -----------------------------------------
        // 12. Response
        // -----------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Holidays fetched successfully",

            pagination: {

                currentPage: page,

                limit: limit,

                totalHolidays:

                    totalHolidays,

                totalPages:

                    totalPages,

                hasNextPage:
                    page < totalPages,

                hasPreviousPage:
                    page > 1

            },

            sorting: {

                sortedBy: sortedBy,

                sortOrder: sortOrder

            },

            filters: {

                searchByKeyword:
                    searchByKeyword,

                isActive:
                    isActive === undefined ||
                    isActive === ""
                        ? "all"
                        : (
                            isActive === true ||
                            isActive === "true"
                                ? true
                                : false
                        )

            },

            count:
                result.rows.length,

            holidays:
                result.rows

        });


    } catch (error) {

        console.error(
            "Get Holidays Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

};

// UPDATE HOLIDAY

exports.updateHoliday = async (req, res) => {

    try {

        const adminId = req.user.id;

        const {
            id,
            holiday_name,
            holiday_date,
            description
        } = req.body;


        if (!id) {

            return res.status(400).json({

                success: false,

                message:
                    "Holiday ID is required"

            });

        }


        if (!holiday_name || !holiday_date) {

            return res.status(400).json({

                success: false,

                message:
                    "Holiday name and holiday date are required"

            });

        }


        // Check holiday
        const holidayResult =
            await pool.query(
                `
                SELECT id

                FROM holidays

                WHERE id = $1

                AND admin_id = $2
                `,
                [
                    id,
                    adminId
                ]
            );


        if (holidayResult.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Holiday not found or access denied"

            });

        }


        // Check duplicate date
        const duplicate =
            await pool.query(
                `
                SELECT id

                FROM holidays

                WHERE admin_id = $1

                AND holiday_date = $2

                AND id != $3
                `,
                [
                    adminId,
                    holiday_date,
                    id
                ]
            );


        if (duplicate.rows.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Another holiday already exists on this date"

            });

        }


        const result =
            await pool.query(
                `
                UPDATE holidays

                SET

                    holiday_name = $1,

                    holiday_date = $2,

                    description = $3,

                    updated_at = CURRENT_TIMESTAMP

                WHERE id = $4

                AND admin_id = $5

                RETURNING

                    id,
                    admin_id,
                    holiday_name,
                    holiday_date,
                    description,
                    is_active,
                    created_at,
                    updated_at
                `,
                [
                    holiday_name,
                    holiday_date,
                    description || null,
                    id,
                    adminId
                ]
            );


        return res.status(200).json({

            success: true,

            message:
                "Holiday updated successfully",

            updatedBy: {

                admin_id: adminId

            },

            holiday:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Update Holiday Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

};

// DELETE HOLIDAY

exports.deleteHoliday = async (req, res) => {

    try {

        const adminId = req.user.id;

        const { id } = req.body;


        if (!id) {

            return res.status(400).json({

                success: false,

                message:
                    "Holiday ID is required"

            });

        }


        const result =
            await pool.query(
                `
                UPDATE holidays

                SET

                    is_active = FALSE,

                    updated_at =
                        CURRENT_TIMESTAMP

                WHERE id = $1

                AND admin_id = $2

                AND is_active = TRUE

                RETURNING

                    id,
                    admin_id,
                    holiday_name,
                    holiday_date,
                    is_active,
                    updated_at
                `,
                [
                    id,
                    adminId
                ]
            );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Holiday not found, already deleted, or access denied"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Holiday deleted successfully",

            deletedBy: {

                admin_id: adminId

            },

            holiday:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Delete Holiday Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

};