const express = require("express");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
    sendWelcomeEmail,
    sendOTPEmail,
} = require("../utils/sendMail");

// Add Employees API

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
        // 3. Verify logged-in user is Admin
        // -----------------------------------------

        const adminResult = await pool.query(
            `
            SELECT
                id,
                name,
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
                message: "Only Admin can create employees"
            });

        }


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
        // 6. Insert into employees table
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
                created_at
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

            employee: result.rows[0]

        });


    } catch (error) {

        console.error(
            "Add Employee Error:",
            error
        );


        // PostgreSQL duplicate email
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
// GET ALL EMPLOYEES
// =====================================================

exports.getEmployees = async (req, res) => {

    try {

        // Logged-in Admin ID
        const adminId = req.user.id;


        // -----------------------------------------
        // Get Admin + Company
        // -----------------------------------------

        const adminResult = await pool.query(
            `
            SELECT
                id,
                name,
                company_name
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

                message: "Admin not found"

            });

        }


        const admin = adminResult.rows[0];


        // -----------------------------------------
        // Get ONLY this Admin's employees
        // -----------------------------------------

        const result = await pool.query(
            `
            SELECT
                id,
                admin_id,
                name,
                email,
                created_at
            FROM employees
            WHERE admin_id = $1
            ORDER BY created_at DESC
            `,
            [adminId]
        );


        return res.status(200).json({

            success: true,

            company: admin.company_name,

            admin: {
                id: admin.id,
                name: admin.name
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
// =====================================================

exports.getEmployeeById = async (req, res) => {

    try {

        const { id } = req.params;

        const adminId = req.user.id;


        const result = await pool.query(
            `
            SELECT
                id,
                admin_id,
                name,
                email,
                created_at
            FROM employees
            WHERE id = $1
            AND admin_id = $2
            `,
            [
                id,
                adminId
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Employee not found or access denied"

            });

        }


        return res.status(200).json({

            success: true,

            employee: result.rows[0]

        });


    } catch (error) {

        console.error(
            "Get Employee Error:",
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
// =====================================================

exports.updateEmployee = async (req, res) => {

    try {

        const { id } = req.params;

        const {
            name,
            email
        } = req.body;

        const adminId = req.user.id;


        // -----------------------------------------
        // Validate
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

                message: "Name and email are required"

            });

        }


        // -----------------------------------------
        // Check employee belongs to this Admin
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

                message: "Employee not found or access denied"

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

                message: "This email is already registered"

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
                email = $2
            WHERE id = $3
            AND admin_id = $4
            RETURNING
                id,
                admin_id,
                name,
                email,
                created_at
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

            message: "Employee updated successfully",

            employee: result.rows[0]

        });


    } catch (error) {

        console.error(
            "Update Employee Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Internal server error"

        });

    }

};


// =====================================================
// DELETE EMPLOYEE
// =====================================================

exports.deleteEmployee = async (req, res) => {

    try {

        const { id } = req.params;

        const adminId = req.user.id;


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

                message: "Employee not found or access denied"

            });

        }


        // -----------------------------------------
        // Delete employee
        // -----------------------------------------

        await pool.query(
            `
            DELETE FROM employees
            WHERE id = $1
            AND admin_id = $2
            `,
            [
                id,
                adminId
            ]
        );


        return res.status(200).json({

            success: true,

            message: "Employee deleted successfully"

        });


    } catch (error) {

        console.error(
            "Delete Employee Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Internal server error"

        });

    }

};