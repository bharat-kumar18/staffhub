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
        // 5. Find Employee
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
        // 6. Get Current Date
        // -----------------------------------------

        const now = new Date();

        const attendanceDate =
            new Intl.DateTimeFormat(
                "en-CA",
                {
                    timeZone: "Asia/Kolkata"
                }
            ).format(now);


        const currentTime =
            new Intl.DateTimeFormat(
                "en-GB",
                {
                    timeZone: "Asia/Kolkata",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                }
            ).format(now);


        console.log(
            "Attendance Date:",
            attendanceDate
        );

        console.log(
            "Current Time:",
            currentTime
        );


        // -----------------------------------------
        // 7. CHECK COMPANY HOLIDAY
        // -----------------------------------------

        const holidayResult = await pool.query(
            `
            SELECT
                id,
                holiday_name,
                holiday_date,
                description

            FROM holidays

            WHERE admin_id = $1

            AND holiday_date = $2
            `,
            [
                adminId,
                attendanceDate
            ]
        );


        // -----------------------------------------
        // 8. If Today is Holiday
        // -----------------------------------------

        if (holidayResult.rows.length > 0) {

            const holiday =
                holidayResult.rows[0];


            return res.status(200).json({

                success: true,

                message:
                    "Today is a company holiday. Attendance cannot be marked.",

                holiday: {

                    id: holiday.id,

                    holiday_name:
                        holiday.holiday_name,

                    holiday_date:
                        holiday.holiday_date,

                    description:
                        holiday.description

                }

            });

        }


        // -----------------------------------------
        // 9. Get Office Timing
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
        // 10. Check Already Marked Attendance
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
        // 11. Decide Attendance Status
        // -----------------------------------------

        let status = "present";


        if (
            currentTime >
            timing.late_after
        ) {

            status = "late";

        }


        // -----------------------------------------
        // 12. Insert Attendance
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
        // 13. Response
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
// EMPLOYEE GET MY ATTENDANCE
// =====================================================

exports.getMyAttendance = async (req, res) => {

    try {

        // -----------------------------------------
        // 1. Get Employee ID from JWT
        // -----------------------------------------

        const employeeId = req.user.id;


        // -----------------------------------------
        // 2. Pagination + Date Filters
        // -----------------------------------------

        let {
            page = 1,
            limit = 10,
            from_date,
            to_date
        } = req.query;


        page = parseInt(page);
        limit = parseInt(limit);


        // -----------------------------------------
        // 3. Validate Pagination
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
        // 4. Check Employee
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


        const adminId =
            employee.admin_id;


        // -----------------------------------------
        // 5. Date Conditions
        // -----------------------------------------

        let dateCondition = "";

        const queryParams = [
            employeeId,
            adminId
        ];


        if (from_date) {

            queryParams.push(from_date);

            dateCondition +=
                ` AND a.attendance_date >= $${queryParams.length}`;

        }


        if (to_date) {

            queryParams.push(to_date);

            dateCondition +=
                ` AND a.attendance_date <= $${queryParams.length}`;

        }


        // -----------------------------------------
        // 6. Get Attendance
        // -----------------------------------------

        const result = await pool.query(
            `
            SELECT

                a.id,

                a.attendance_date,

                a.check_in,

                a.check_out,

                a.status,

                a.remarks,

                a.latitude,

                a.longitude,

                a.created_at,

                a.updated_at,

                ot.late_after,

                l.leave_type,

                l.reason AS leave_reason,

                l.status AS leave_status,

                h.holiday_name


            FROM attendance a


            LEFT JOIN office_timings ot
                ON ot.admin_id = a.admin_id

                AND ot.is_active = TRUE


            LEFT JOIN leaves l
                ON l.employee_id = a.employee_id

                AND a.attendance_date
                    BETWEEN l.from_date
                    AND l.to_date

                AND l.status = 'approved'


            LEFT JOIN holidays h
                ON h.admin_id = a.admin_id

                AND h.holiday_date =
                    a.attendance_date


            WHERE a.employee_id = $1

            AND a.admin_id = $2

            ${dateCondition}


            ORDER BY
                a.attendance_date DESC


            LIMIT $${queryParams.length + 1}

            OFFSET $${queryParams.length + 2}
            `,
            [
                ...queryParams,
                limit,
                offset
            ]
        );


        // -----------------------------------------
        // 7. Format Attendance Data
        // -----------------------------------------

        const attendance =
            result.rows.map(row => {


                // -----------------------------
                // Worked Hours
                // -----------------------------

                let workedHours = "00:00";


                if (
                    row.check_in &&
                    row.check_out
                ) {

                    const checkIn =
                        new Date(
                            `1970-01-01T${row.check_in}`
                        );

                    const checkOut =
                        new Date(
                            `1970-01-01T${row.check_out}`
                        );


                    let difference =
                        checkOut - checkIn;


                    if (difference < 0) {

                        difference +=
                            24 * 60 * 60 * 1000;

                    }


                    const hours =
                        Math.floor(
                            difference /
                            (1000 * 60 * 60)
                        );


                    const minutes =
                        Math.floor(
                            (
                                difference %
                                (1000 * 60 * 60)
                            ) /
                            (1000 * 60)
                        );


                    workedHours =
                        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

                }


                // -----------------------------
                // Late Hours
                // -----------------------------

                let lateHours = "00:00";


                if (
                    row.check_in &&
                    row.late_after &&
                    row.check_in > row.late_after
                ) {

                    const checkIn =
                        new Date(
                            `1970-01-01T${row.check_in}`
                        );

                    const lateAfter =
                        new Date(
                            `1970-01-01T${row.late_after}`
                        );


                    const difference =
                        checkIn - lateAfter;


                    const hours =
                        Math.floor(
                            difference /
                            (1000 * 60 * 60)
                        );


                    const minutes =
                        Math.floor(
                            (
                                difference %
                                (1000 * 60 * 60)
                            ) /
                            (1000 * 60)
                        );


                    lateHours =
                        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

                }


                // -----------------------------
                // Status
                // -----------------------------

                let status =
                    row.status || "present";


                let remarks =
                    row.remarks || null;


                // Approved Leave
                if (
                    row.leave_status === "approved"
                ) {

                    status = "leave";

                    remarks =
                        row.leave_reason;

                }


                // Company Holiday
                if (
                    row.holiday_name
                ) {

                    status = "holiday";

                    remarks =
                        row.holiday_name;

                }


                return {

                    id:
                        row.id,

                    date:
                        row.attendance_date,

                    check_in:
                        row.check_in || null,

                    check_out:
                        row.check_out || null,

                    worked_hours:
                        workedHours,

                    late_hours:
                        lateHours,

                    status:
                        status,

                    remarks:
                        remarks

                };

            });


        // -----------------------------------------
        // 8. Count
        // -----------------------------------------

        const countParams = [
            employeeId,
            adminId
        ];


        let countDateCondition = "";


        if (from_date) {

            countParams.push(from_date);

            countDateCondition +=
                ` AND attendance_date >= $${countParams.length}`;

        }


        if (to_date) {

            countParams.push(to_date);

            countDateCondition +=
                ` AND attendance_date <= $${countParams.length}`;

        }


        const countResult =
            await pool.query(
                `
                SELECT COUNT(*) AS total

                FROM attendance

                WHERE employee_id = $1

                AND admin_id = $2

                ${countDateCondition}
                `,
                countParams
            );


        const totalAttendance =
            parseInt(
                countResult.rows[0].total
            );


        const totalPages =
            Math.ceil(
                totalAttendance / limit
            );


        // -----------------------------------------
        // 9. Response
        // -----------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "My attendance fetched successfully",

            employee: {

                id:
                    employee.id,

                name:
                    employee.name,

                email:
                    employee.email

            },

            pagination: {

                currentPage:
                    page,

                limit:
                    limit,

                totalAttendance:
                    totalAttendance,

                totalPages:
                    totalPages,

                hasNextPage:
                    page < totalPages,

                hasPreviousPage:
                    page > 1

            },

            attendance:
                attendance

        });


    } catch (error) {

        console.error(
            "Get My Attendance Error:",
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