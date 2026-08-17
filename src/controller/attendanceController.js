const express = require("express");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
// =====================================================
// EMPLOYEE CHECK-IN
// =====================================================

exports.checkIn = async (req, res) => {

    try {

        const employeeId = req.user.id;


        // -----------------------------------------
        // 1. Get location from request body
        // -----------------------------------------

        const {
            latitude,
            longitude
        } = req.body;


        // -----------------------------------------
        // 2. Validate location
        // -----------------------------------------

        if (
            latitude === undefined ||
            longitude === undefined ||
            latitude === null ||
            longitude === null
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Current location is required. Please provide latitude and longitude"

            });

        }


        // -----------------------------------------
        // 3. Validate latitude
        // -----------------------------------------

        if (
            isNaN(latitude) ||
            Number(latitude) < -90 ||
            Number(latitude) > 90
        ) {

            return res.status(400).json({

                success: false,

                message: "Invalid latitude"

            });

        }


        // -----------------------------------------
        // 4. Validate longitude
        // -----------------------------------------

        if (
            isNaN(longitude) ||
            Number(longitude) < -180 ||
            Number(longitude) > 180
        ) {

            return res.status(400).json({

                success: false,

                message: "Invalid longitude"

            });

        }


        // -----------------------------------------
        // 5. Find employee
        // -----------------------------------------

        const employeeResult = await pool.query(
            `
            SELECT
                id,
                admin_id,
                name,
                email,
                is_active

            FROM employees

            WHERE id = $1

            AND is_active = TRUE
            `,
            [employeeId]
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

        const adminId =
            employee.admin_id;


        // -----------------------------------------
        // 6. Get office timing
        // -----------------------------------------

        const timingResult = await pool.query(
            `
            SELECT
                office_start_time,
                office_end_time,
                late_after

            FROM office_timings

            WHERE admin_id = $1

            AND is_active = TRUE
            `,
            [adminId]
        );


        if (timingResult.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Office timing has not been configured by Admin"

            });

        }


        const timing =
            timingResult.rows[0];


        // -----------------------------------------
        // 7. Current date/time
        // -----------------------------------------

        const now = new Date();


        const attendanceDate =
            now.toISOString().split("T")[0];


        const currentTime =
            now.toTimeString().split(" ")[0];


        // -----------------------------------------
        // 8. Check already marked
        // -----------------------------------------

        const existingAttendance =
            await pool.query(
                `
                SELECT
                    id,
                    check_in,
                    status,
                    latitude,
                    longitude

                FROM attendance

                WHERE employee_id = $1

                AND attendance_date = $2
                `,
                [
                    employeeId,
                    attendanceDate
                ]
            );


        if (existingAttendance.rows.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Attendance already marked for today",

                attendance:
                    existingAttendance.rows[0]

            });

        }


        // -----------------------------------------
        // 9. Decide attendance status
        // -----------------------------------------

        let status = "present";


        if (
            currentTime >
            timing.late_after
        ) {

            status = "late";

        }


        // -----------------------------------------
        // 10. Insert attendance
        // -----------------------------------------

        const result = await pool.query(
            `
            INSERT INTO attendance
            (
                employee_id,
                admin_id,
                attendance_date,
                check_in,
                status,
                latitude,
                longitude
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7
            )

            RETURNING
                id,
                employee_id,
                admin_id,
                attendance_date,
                check_in,
                status,
                latitude,
                longitude,
                created_at
            `,
            [
                employeeId,
                adminId,
                attendanceDate,
                currentTime,
                status,
                Number(latitude),
                Number(longitude)
            ]
        );


        // -----------------------------------------
        // 11. Response
        // -----------------------------------------

        return res.status(201).json({

            success: true,

            message:
                "Attendance marked successfully",

            attendance:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Check In Error:",
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
// EMPLOYEE CHECK-OUT
// =====================================================

exports.checkOut = async (req, res) => {

    try {

        const employeeId = req.user.id;


        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        const currentTime =
            new Date()
                .toTimeString()
                .split(" ")[0];


        const result = await pool.query(
            `
            UPDATE attendance

            SET
                check_out = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE employee_id = $2

            AND attendance_date = $3

            AND check_in IS NOT NULL

            AND check_out IS NULL

            RETURNING
                id,
                employee_id,
                admin_id,
                attendance_date,
                check_in,
                check_out,
                status,
                updated_at
            `,
            [
                currentTime,
                employeeId,
                today
            ]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "No active attendance found for today"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Check-out successful",

            attendance:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Check Out Error:",
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
// ADMIN GET ATTENDANCE
// =====================================================

exports.getAttendance = async (req, res) => {

    try {

        const adminId = req.user.id;


        let {
            page = 1,
            limit = 10,
            sortedBy = "attendance_date",
            sortOrder = "DESC",
            searchByKeyword = "",
            status
        } = req.body || {};


        page = parseInt(page);

        limit = parseInt(limit);


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
        // Allowed sorting
        // -----------------------------------------

        const allowedSortColumns = {

            id: "a.id",

            employee_id: "a.employee_id",

            name: "e.name",

            attendance_date:
                "a.attendance_date",

            check_in: "a.check_in",

            check_out: "a.check_out",

            status: "a.status",

            created_at: "a.created_at"

        };


        if (!allowedSortColumns[sortedBy]) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid sortedBy"

            });

        }


        const sortColumn =
            allowedSortColumns[sortedBy];


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
        // WHERE conditions
        // -----------------------------------------

        const conditions = [

            "a.admin_id = $1"

        ];


        const queryParams = [
            adminId
        ];


        // -----------------------------------------
        // Search employee
        // -----------------------------------------

        if (
            searchByKeyword &&
            searchByKeyword.trim() !== ""
        ) {

            queryParams.push(
                `%${searchByKeyword.trim()}%`
            );


            conditions.push(
                `(
                    e.name ILIKE $${queryParams.length}
                    OR
                    e.email ILIKE $${queryParams.length}
                )`
            );

        }


        // -----------------------------------------
        // Status filter
        // -----------------------------------------

        if (
            status &&
            status.trim() !== ""
        ) {

            const allowedStatus = [
                "present",
                "late",
                "absent"
            ];


            if (
                !allowedStatus
                    .includes(status.toLowerCase())
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid status. Use present, late or absent"

                });

            }


            queryParams.push(
                status.toLowerCase()
            );


            conditions.push(
                `a.status = $${queryParams.length}`
            );

        }


        const whereClause =
            conditions.join(" AND ");


        // -----------------------------------------
        // Count
        // -----------------------------------------

        const countResult =
            await pool.query(
                `
                SELECT COUNT(*) AS total

                FROM attendance a

                JOIN employees e
                    ON a.employee_id = e.id

                WHERE ${whereClause}
                `,
                queryParams
            );


        const totalAttendance =
            parseInt(
                countResult.rows[0].total
            );


        // -----------------------------------------
        // Pagination
        // -----------------------------------------

        queryParams.push(limit);

        const limitIndex =
            queryParams.length;


        queryParams.push(offset);

        const offsetIndex =
            queryParams.length;


        // -----------------------------------------
        // Get attendance
        // -----------------------------------------

        const result =
            await pool.query(
                `
                SELECT
                    a.id,
                    a.employee_id,
                    e.name AS employee_name,
                    e.email AS employee_email,

                    a.admin_id,

                    u.company_name,

                    a.attendance_date,

                    a.check_in,

                    a.check_out,

                    a.status,

                    a.remarks,

                    a.created_at,

                    a.updated_at

                FROM attendance a

                JOIN employees e
                    ON a.employee_id = e.id

                JOIN users u
                    ON a.admin_id = u.id

                WHERE ${whereClause}

                ORDER BY
                    ${sortColumn}
                    ${sortOrder}

                LIMIT $${limitIndex}

                OFFSET $${offsetIndex}
                `,
                queryParams
            );


        const totalPages =
            Math.ceil(
                totalAttendance / limit
            );


        return res.status(200).json({

            success: true,

            message:
                "Attendance fetched successfully",

            pagination: {

                currentPage: page,

                limit,

                totalAttendance,

                totalPages,

                hasNextPage:
                    page < totalPages,

                hasPreviousPage:
                    page > 1

            },

            sorting: {

                sortedBy,

                sortOrder

            },

            filters: {

                searchByKeyword,

                status:
                    status || "all"

            },

            count:
                result.rows.length,

            attendance:
                result.rows

        });


    } catch (error) {

        console.error(
            "Get Attendance Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }
};

// ADMIN CAN MODIFY ATTENDENCE 


exports.modifyAttendance = async (req, res) => {

    try {

        // -----------------------------------------
        // 1. Get data from BODY
        // -----------------------------------------

        const {
            id,
            status,
            check_in,
            check_out
        } = req.body;


        // -----------------------------------------
        // 2. Logged-in Admin
        // -----------------------------------------

        const adminId = req.user.id;


        // -----------------------------------------
        // 3. Validate Attendance ID
        // -----------------------------------------

        if (!id) {

            return res.status(400).json({

                success: false,

                message: "Attendance ID is required"

            });

        }


        // -----------------------------------------
        // 4. Validate status
        // -----------------------------------------

        if (
            status !== undefined &&
            !["present", "absent", "late"].includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid status. Use present, absent or late"

            });

        }


        // -----------------------------------------
        // 5. Check Attendance
        // -----------------------------------------

        const attendanceResult = await pool.query(
            `
            SELECT
                a.id,
                a.employee_id,
                a.admin_id,
                a.attendance_date,
                a.status,
                a.check_in,
                a.check_out,

                e.name AS employee_name,
                e.email AS employee_email

            FROM attendance a

            JOIN employees e
                ON a.employee_id = e.id

            WHERE a.id = $1

            AND a.admin_id = $2

            AND e.admin_id = $2
            `,
            [
                id,
                adminId
            ]
        );


        if (attendanceResult.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Attendance not found or access denied"

            });

        }


        // -----------------------------------------
        // 6. Keep old values if not provided
        // -----------------------------------------

        const oldAttendance =
            attendanceResult.rows[0];


        const newStatus =
            status !== undefined
                ? status
                : oldAttendance.status;


        const newCheckIn =
            check_in !== undefined
                ? check_in
                : oldAttendance.check_in;


        const newCheckOut =
            check_out !== undefined
                ? check_out
                : oldAttendance.check_out;


        // -----------------------------------------
        // 7. Update Attendance
        // -----------------------------------------

        const result = await pool.query(
            `
            UPDATE attendance

            SET
                status = $1,
                check_in = $2,
                check_out = $3,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $4

            AND admin_id = $5

            RETURNING
                id,
                employee_id,
                admin_id,
                attendance_date,
                check_in,
                check_out,
                status,
                latitude,
                longitude,
                created_at,
                updated_at
            `,
            [
                newStatus,
                newCheckIn,
                newCheckOut,
                id,
                adminId
            ]
        );


        // -----------------------------------------
        // 8. Response
        // -----------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Attendance modified successfully",

            modifiedBy: {

                admin_id: adminId

            },

            attendance:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Modify Attendance Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

};