const express = require("express");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendWelcomeEmail, sendOTPEmail, sendEmployeeWelcomeEmail } = require("../utils/sendMail");

// Add Employees API

// const pool = require("../config/db");
// const bcrypt = require("bcrypt");
// =====================================================
// ADD EMPLOYEE
// =====================================================

exports.addEmployee = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            department,
            designation,
            dob,
            phone,
            address
        } = req.body;


        // -----------------------------------------
        // 1. Validate required fields
        // -----------------------------------------

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });

        }


        // -----------------------------------------
        // 2. Get logged-in Admin ID from JWT
        // -----------------------------------------

        const adminId = req.user.id;


        // -----------------------------------------
        // 3. Check Admin
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
                message: "Admin not found or inactive"
            });

        }


        const admin = adminResult.rows[0];


        // -----------------------------------------
        // 4. Check duplicate email
        // -----------------------------------------

        const existingEmployee = await pool.query(
            `
            SELECT id

            FROM employees

            WHERE email = $1
            `,
            [email]
        );


        if (existingEmployee.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Employee email already exists"
            });

        }


        // -----------------------------------------
        // 5. Hash password
        // -----------------------------------------

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // -----------------------------------------
        // 6. Insert Employee
        // -----------------------------------------

        const result = await pool.query(
            `
            INSERT INTO employees
            (
                admin_id,
                name,
                email,
                password,
                department,
                designation,
                dob,
                phone,
                address
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9
            )

            RETURNING
                id,
                admin_id,
                name,
                email,
                department,
                designation,
                dob,
                phone,
                address,
                created_at,
                is_active
            `,
            [
                adminId,
                name,
                email,
                hashedPassword,
                department,
                designation,
                dob,
                phone,
                address
            ]
        );



        // -----------------------------------------
        // 7. Send Welcome Email
        // -----------------------------------------

        try {

            await sendEmployeeWelcomeEmail({

                employeeEmail:
                    email,

                employeeName:
                    name,

                companyName:
                    admin.company_name

            });

        } catch (mailError) {

            console.error(
                "Employee Welcome Email Error:",
                mailError
            );

            // Employee creation successful hai,
            // email fail hone par employee creation
            // fail nahi hogi.
        }





            // -----------------------------------------
            // 8. Response
            // -----------------------------------------

            return res.status(201).json({

                success: true,

                message: "Employee created successfully",

                company: admin.company_name,

                addedBy: {
                    admin_id: adminId
                },

                employee: result.rows[0]

            });


        } catch (error) {

            console.error(
                "Add Employee Error:",
                error
            );


            // PostgreSQL UNIQUE constraint
            if (error.code === "23505") {

                return res.status(409).json({

                    success: false,

                    message: "Employee email already exists"

                });

            }


            return res.status(500).json({

                success: false,

                message: "Internal server error"

            });

        }

    };

    // =====================================================
    // GET EMPLOYEES
    // Pagination + Sorting + Search + is_active Filter
    // =====================================================

    exports.getEmployees = async (req, res) => {

        try {

            // =====================================================
            // 1. Logged-in Admin ID
            // =====================================================

            const adminId = req.user.id;


            // =====================================================
            // 2. Get pagination, sorting and filters from BODY
            // =====================================================

            let {
                page = 1,
                limit = 10,
                sortedBy = "created_at",
                sortOrder = "DESC",
                searchByKeyword = "",
                isActive
            } = req.body || {};


            // =====================================================
            // 3. Convert page and limit into numbers
            // =====================================================

            page = parseInt(page);
            limit = parseInt(limit);


            // =====================================================
            // 4. Validate page
            // =====================================================

            if (isNaN(page) || page < 1) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Page must be a positive number"

                });

            }


            // =====================================================
            // 5. Validate limit
            // =====================================================

            if (isNaN(limit) || limit < 1) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Limit must be a positive number"

                });

            }


            // Maximum 100 employees per page

            if (limit > 100) {

                limit = 100;

            }


            // =====================================================
            // 6. Calculate OFFSET
            // =====================================================

            const offset =
                (page - 1) * limit;


            // =====================================================
            // 7. Allowed sorting columns
            // =====================================================

            const allowedSortColumns = {

                id: "employees.id",

                name: "employees.name",

                email: "employees.email",

                department: "employees.department",

                designation: "employees.designation",

                phone: "employees.phone",

                dob: "employees.dob",

                created_at: "employees.created_at",

                is_active: "employees.is_active"

            };


            // =====================================================
            // 8. Validate sortedBy
            // =====================================================

            if (!allowedSortColumns[sortedBy]) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid sortedBy. Allowed values: id, name, email, department, designation, phone, dob, created_at, is_active"

                });

            }


            const sortColumn =
                allowedSortColumns[sortedBy];


            // =====================================================
            // 9. Validate sortOrder
            // =====================================================

            sortOrder =
                sortOrder.toUpperCase();


            if (
                !["ASC", "DESC"].includes(sortOrder)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid sortOrder. Use ASC or DESC"

                });

            }


            // =====================================================
            // 10. Create WHERE conditions
            // =====================================================

            const conditions = [

                // VERY IMPORTANT:
                // Employee belongs to logged-in Admin

                "employees.admin_id = $1"

            ];


            // Admin ID is first parameter

            const queryParams = [

                adminId

            ];


            // =====================================================
            // 11. Search by keyword
            // =====================================================

            if (
                searchByKeyword &&
                searchByKeyword.trim() !== ""
            ) {

                queryParams.push(
                    `%${searchByKeyword.trim()}%`
                );


                const searchIndex =
                    queryParams.length;


                conditions.push(

                    `(
                    employees.name ILIKE $${searchIndex}
                    OR employees.email ILIKE $${searchIndex}
                    OR employees.department ILIKE $${searchIndex}
                    OR employees.designation ILIKE $${searchIndex}
                    OR employees.phone ILIKE $${searchIndex}
                )`

                );

            }


            // =====================================================
            // 12. Active / Inactive filter
            // =====================================================

            if (
                isActive !== undefined &&
                isActive !== ""
            ) {


                // Validate true / false

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


                // Convert string into boolean

                const activeValue =
                    isActive === true ||
                    isActive === "true";


                queryParams.push(
                    activeValue
                );


                conditions.push(

                    `employees.is_active = $${queryParams.length}`

                );

            }


            // =====================================================
            // 13. Create WHERE clause
            // =====================================================

            const whereClause =
                conditions.join(" AND ");


            // =====================================================
            // 14. Count total employees
            // =====================================================

            const countQuery = `

            SELECT COUNT(*) AS total

            FROM employees

            WHERE ${whereClause}

        `;


            const countResult =
                await pool.query(
                    countQuery,
                    queryParams
                );


            const totalEmployees =
                parseInt(
                    countResult.rows[0].total
                );


            // =====================================================
            // 15. Pagination parameters
            // =====================================================

            queryParams.push(limit);

            const limitIndex =
                queryParams.length;


            queryParams.push(offset);

            const offsetIndex =
                queryParams.length;


            // =====================================================
            // 16. Get Employees
            // =====================================================

            const employeesQuery = `

            SELECT

                employees.id,

                employees.admin_id,

                employees.name,

                employees.email,

                employees.department,

                employees.designation,

                employees.phone,

                employees.address,

                employees.dob,

                employees.is_active,

                employees.created_at,

                employees.updated_at,

                users.company_name

            FROM employees

            JOIN users

                ON employees.admin_id = users.id

            WHERE ${whereClause}

            ORDER BY
                ${sortColumn}
                ${sortOrder}

            LIMIT $${limitIndex}

            OFFSET $${offsetIndex}

        `;


            const result =
                await pool.query(
                    employeesQuery,
                    queryParams
                );


            // =====================================================
            // 17. Calculate total pages
            // =====================================================

            const totalPages =
                Math.ceil(
                    totalEmployees / limit
                );


            // =====================================================
            // 18. Company Name
            // =====================================================

            const companyName =
                result.rows.length > 0
                    ? result.rows[0].company_name
                    : null;


            // =====================================================
            // 19. Response
            // =====================================================

            return res.status(200).json({

                success: true,

                message:
                    "Employees fetched successfully",


                company:
                    companyName,


                pagination: {

                    currentPage:
                        page,

                    limit:
                        limit,

                    totalEmployees:
                        totalEmployees,

                    totalPages:
                        totalPages,

                    hasNextPage:
                        page < totalPages,

                    hasPreviousPage:
                        page > 1

                },


                sorting: {

                    sortedBy:
                        sortedBy,

                    sortOrder:
                        sortOrder

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


                employees:
                    result.rows

            });


        } catch (error) {

            console.error(
                "Get Employees Error:",
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
    // GET SINGLE EMPLOYEE
    // ID FROM BODY
    // =====================================================

    exports.getEmployeeById = async (req, res) => {

        try {

            // -----------------------------------------
            // 1. Employee ID from BODY
            // -----------------------------------------

            const { id } = req.body;


            // -----------------------------------------
            // 2. Logged-in Admin
            // -----------------------------------------

            const adminId = req.user.id;


            // -----------------------------------------
            // 3. Validate Employee ID
            // -----------------------------------------

            if (!id) {

                return res.status(400).json({

                    success: false,

                    message: "Employee ID is required"

                });

            }


            // -----------------------------------------
            // 4. Fetch Employee
            // -----------------------------------------

            const result = await pool.query(
                `
            SELECT

                e.id,
                e.admin_id,
                e.name,
                e.email,
                e.department,
                e.designation,
                e.phone,
                e.dob,
                e.address,
                e.created_at,
                e.updated_at,
                e.is_active,
                u.company_name

            FROM employees e

            JOIN users u
                ON e.admin_id = u.id

            WHERE e.id = $1

            AND e.admin_id = $2
            `,
                [
                    id,
                    adminId
                ]
            );


            // -----------------------------------------
            // 5. Employee Not Found
            // -----------------------------------------

            if (result.rows.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Employee not found or access denied"

                });

            }


            // -----------------------------------------
            // 6. Success Response
            // -----------------------------------------

            return res.status(200).json({

                success: true,

                message: "Employee fetched successfully",

                employee: result.rows[0]

            });


        } catch (error) {

            console.error(
                "Get Employee By ID Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message: "Internal server error"

            });

        }

    };

    // =====================================================
    // UPDATE EMPLOYEE
    // ID FROM BODY
    // =====================================================

    exports.updateEmployee = async (req, res) => {

        try {

            const {
                id,
                name,
                email,
                designation,
                phone,
                department,
                address
            } = req.body;


            const adminId = req.user.id;


            // -----------------------------------------
            // 1. Validate Employee ID
            // -----------------------------------------

            if (!id) {

                return res.status(400).json({

                    success: false,

                    message: "Employee ID is required"

                });

            }


            // -----------------------------------------
            // 2. Validate required fields
            // -----------------------------------------

            if (!name || !email) {

                return res.status(400).json({

                    success: false,

                    message: "Name and email are required"

                });

            }


            // -----------------------------------------
            // 3. Check employee belongs to logged-in Admin
            // -----------------------------------------

            const employeeResult = await pool.query(
                `
            SELECT
                id,
                admin_id,
                name,
                email,
                designation,
                phone,
                department,
                address,
                is_active

            FROM employees

            WHERE id = $1

            AND admin_id = $2
            `,
                [
                    id,
                    adminId
                ]
            );


            if (employeeResult.rows.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Employee not found or access denied"

                });

            }


            // -----------------------------------------
            // 4. Check duplicate email
            // -----------------------------------------

            const emailResult = await pool.query(
                `
            SELECT id

            FROM employees

            WHERE email = $1

            AND id != $2
            `,
                [
                    email,
                    id
                ]
            );


            if (emailResult.rows.length > 0) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This email is already registered"

                });

            }


            // -----------------------------------------
            // 5. Update Employee
            // -----------------------------------------

            const result = await pool.query(
                `
            UPDATE employees

            SET

                name = $1,

                email = $2,

                designation = $3,

                phone = $4,

                department = $5,

                address = $6,

                updated_at = CURRENT_TIMESTAMP

            WHERE id = $7

            AND admin_id = $8

            RETURNING

                id,

                admin_id,

                name,

                email,

                designation,

                phone,

                department,

                address,

                created_at,

                updated_at,

                is_active
            `,
                [
                    name,
                    email,
                    designation,
                    phone,
                    department,
                    address,
                    id,
                    adminId
                ]
            );


            // -----------------------------------------
            // 6. Response
            // -----------------------------------------

            return res.status(200).json({

                success: true,

                message:
                    "Employee updated successfully",

                updatedBy: {
                    admin_id: adminId
                },

                employee: result.rows[0]

            });


        } catch (error) {

            console.error(
                "Update Employee Error:",
                error
            );


            // PostgreSQL UNIQUE constraint
            if (error.code === "23505") {

                return res.status(409).json({

                    success: false,

                    message:
                        "This email is already registered"

                });

            }


            return res.status(500).json({

                success: false,

                message:
                    "Internal server error"

            });

        }

    };

    // =====================================================
    // SOFT DELETE EMPLOYEE
    // ID FROM BODY
    // =====================================================

    exports.deleteEmployee = async (req, res) => {

        try {

            // -----------------------------------------
            // Employee ID from BODY
            // -----------------------------------------

            const { id } = req.body;


            // -----------------------------------------
            // Logged-in Admin
            // -----------------------------------------

            const adminId = req.user.id;


            if (!id) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Employee ID is required"

                });

            }


            // -----------------------------------------
            // Soft delete
            // -----------------------------------------

            const result = await pool.query(
                `
            UPDATE employees

            SET
                is_active = FALSE,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $1

            AND admin_id = $2

            AND is_active = TRUE

            RETURNING
                id,
                admin_id,
                name,
                email,
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
                        "Employee not found, already deleted, or access denied"

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Employee deleted successfully",

                deletedBy: {
                    admin_id: adminId
                },

                employee: result.rows[0]

            });


        } catch (error) {

            console.error(
                "Delete Employee Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Internal server error"

            });

        }

    };