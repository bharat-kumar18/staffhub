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