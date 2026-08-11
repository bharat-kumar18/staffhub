const express = require("express");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {sendWelcomeEmail,sendOTPEmail,} = require("../utils/sendMail");

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
            password
        } = req.body;


        // -----------------------------------------
        // 1. Validate fields
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
                password
            )
            VALUES
            ($1, $2, $3, $4)

            RETURNING
                id,
                admin_id,
                name,
                email,
                created_at,
                is_active
            `,
            [
                adminId,
                name,
                email,
                hashedPassword
            ]
        );


        // -----------------------------------------
        // 7. Response
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

        // -----------------------------------------
        // 1. Get Admin ID from JWT
        // -----------------------------------------

        const adminId = req.user.id;


        // -----------------------------------------
        // 2. Pagination
        // -----------------------------------------

        let page = parseInt(req.query.page) || 1;

        let limit = parseInt(req.query.limit) || 10;


        if (page < 1) {
            page = 1;
        }

        if (limit < 1) {
            limit = 10;
        }

        if (limit > 100) {
            limit = 100;
        }


        const offset = (page - 1) * limit;


        // -----------------------------------------
        // 3. Search
        // -----------------------------------------

        const search = req.query.search || "";


        // -----------------------------------------
        // 4. is_active filter
        //
        // all      -> all employees
        // true     -> active only
        // false    -> inactive only
        // -----------------------------------------

        const isActive = req.query.is_active;


        let activeCondition = "";

        let queryParams = [
            adminId
        ];


        if (isActive === "true") {

            activeCondition = `
                AND e.is_active = TRUE
            `;

        }
        else if (isActive === "false") {

            activeCondition = `
                AND e.is_active = FALSE
            `;

        }


        // -----------------------------------------
        // 5. Search condition
        // -----------------------------------------

        let searchCondition = "";

        if (search) {

            queryParams.push(`%${search}%`);

            searchCondition = `
                AND (
                    e.name ILIKE $${queryParams.length}
                    OR e.email ILIKE $${queryParams.length}
                )
            `;

        }


        // -----------------------------------------
        // 6. Sorting
        // -----------------------------------------

        const allowedSortColumns = {

            id: "e.id",

            name: "e.name",

            email: "e.email",

            created_at: "e.created_at",

            is_active: "e.is_active"

        };


        const sortBy = req.query.sortBy || "created_at";

        const sortOrder =
            req.query.sortOrder?.toUpperCase() === "ASC"
                ? "ASC"
                : "DESC";


        const sortColumn =
            allowedSortColumns[sortBy] ||
            "e.created_at";


        // -----------------------------------------
        // 7. Count total employees
        // -----------------------------------------

        const countParams = [...queryParams];


        const countResult = await pool.query(
            `
            SELECT COUNT(*) AS total

            FROM employees e

            WHERE e.admin_id = $1

            ${activeCondition}

            ${searchCondition}
            `,
            countParams
        );


        const totalEmployees =
            parseInt(countResult.rows[0].total);


        // -----------------------------------------
        // 8. Get employees
        // -----------------------------------------

        queryParams.push(limit);

        const limitIndex = queryParams.length;


        queryParams.push(offset);

        const offsetIndex = queryParams.length;


        const result = await pool.query(
            `
            SELECT
                e.id,
                e.admin_id,
                e.name,
                e.email,
                e.created_at,
                e.updated_at,
                e.is_active,

                u.company_name

            FROM employees e

            JOIN users u
                ON e.admin_id = u.id

            WHERE e.admin_id = $1

            ${activeCondition}

            ${searchCondition}

            ORDER BY ${sortColumn} ${sortOrder}

            LIMIT $${limitIndex}

            OFFSET $${offsetIndex}
            `,
            queryParams
        );


        // -----------------------------------------
        // 9. Pagination information
        // -----------------------------------------

        const totalPages =
            Math.ceil(totalEmployees / limit);


        // -----------------------------------------
        // 10. Response
        // -----------------------------------------

        return res.status(200).json({

            success: true,

            message: "Employees fetched successfully",

            company: result.rows.length > 0
                ? result.rows[0].company_name
                : null,

            pagination: {

                currentPage: page,

                limit: limit,

                totalEmployees: totalEmployees,

                totalPages: totalPages,

                hasNextPage: page < totalPages,

                hasPreviousPage: page > 1

            },

            sorting: {

                sortBy: sortBy,

                sortOrder: sortOrder

            },

            filters: {

                search: search,

                is_active:
                    isActive === undefined
                        ? "all"
                        : isActive

            },

            count: result.rows.length,

            employees: result.rows

        });


    } catch (error) {

        console.error(
            "Get Employees Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Internal server error"

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

                message: "Employee ID is required"

            });

        }


        // -----------------------------------------
        // Fetch employee
        // -----------------------------------------

        const result = await pool.query(
            `
            SELECT
                e.id,
                e.admin_id,
                e.name,
                e.email,
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


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee not found or access denied"

            });

        }


        return res.status(200).json({

            success: true,

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
            email
        } = req.body;


        const adminId = req.user.id;


        // -----------------------------------------
        // Validation
        // -----------------------------------------

        if (!id) {

            return res.status(400).json({

                success: false,

                message: "Employee ID is required"

            });

        }


        if (!name || !email) {

            return res.status(400).json({

                success: false,

                message:
                    "Name and email are required"

            });

        }


        // -----------------------------------------
        // Check employee belongs to Admin
        // -----------------------------------------

        const employeeResult = await pool.query(
            `
            SELECT id
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
        // Check duplicate email
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
        // Update employee
        // -----------------------------------------

        const result = await pool.query(
            `
            UPDATE employees

            SET
                name = $1,
                email = $2,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $3

            AND admin_id = $4

            RETURNING
                id,
                admin_id,
                name,
                email,
                created_at,
                updated_at,
                is_active
            `,
            [
                name,
                email,
                id,
                adminId
            ]
        );


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


        if (error.code === "23505") {

            return res.status(409).json({

                success: false,

                message:
                    "This email is already registered"

            });

        }


        return res.status(500).json({

            success: false,

            message: "Internal server error"

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