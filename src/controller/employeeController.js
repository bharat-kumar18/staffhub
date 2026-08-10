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

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });

        }

        // Logged-in Admin
        const adminId = req.user.id;

        // Admin information
        const adminResult = await pool.query(
            `
            SELECT id, company_name
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

        // Check duplicate email
        const existingUser = await pool.query(
            `
            SELECT id
            FROM users
            WHERE email = $1
            `,
            [email]
        );

        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });

        }

        // Employee role
        const roleResult = await pool.query(
            `
            SELECT id
            FROM roles
            WHERE role_name = 'employee'
            `
        );

        const employeeRoleId = roleResult.rows[0].id;

        // Password hash
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // Create employee
        const result = await pool.query(
            `
            INSERT INTO users
            (
                name,
                email,
                password,
                role_id,
                company_name,
                created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                id,
                name,
                email,
                role_id,
                company_name,
                created_by,
                created_at
            `,
            [
                name,
                email,
                hashedPassword,
                employeeRoleId,
                admin.company_name,
                admin.id
            ]
        );

        return res.status(201).json({

            success: true,

            message: "Employee created successfully",

            employee: result.rows[0]

        });

    } catch (error) {

        console.error("Add Employee Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

};
// Get Employees API
exports.getEmployees = async (req, res) => {

    try {

        const adminId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                company_name,
                role_id,
                created_by,
                is_active,
                created_at
            FROM users
            WHERE role_id = 3
            AND created_by = $1
            AND is_active = TRUE
            ORDER BY created_at DESC
            `,
            [adminId]
        );

        return res.status(200).json({

            success: true,

            company: req.user.company_name,

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
// Get Single Employees 
exports.getEmployeeById = async (req, res) => {

    try {

        const { id } = req.params;

        const adminId = req.user.id;

        const result = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                company_name,
                role_id,
                created_by,
                created_at
            FROM users
            WHERE id = $1
            AND role_id = 3
            AND created_by = $2
            AND is_active = TRUE
            `,
            [id, adminId]
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
// Update Employees 
exports.updateEmployee = async (req, res) => {

    try {

        const { id } = req.params;

        const { name, email } = req.body;

        const adminId = req.user.id;

        if (!name || !email) {

            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });

        }

        // Check email belongs to another user
        const emailCheck = await pool.query(
            `
            SELECT id
            FROM users
            WHERE email = $1
            AND id != $2
            `,
            [email, id]
        );

        if (emailCheck.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });

        }

        const result = await pool.query(
            `
            UPDATE users
            SET
                name = $1,
                email = $2
            WHERE id = $3
            AND role_id = 3
            AND created_by = $4
            AND is_active = TRUE
            RETURNING
                id,
                name,
                email,
                company_name,
                role_id,
                created_by,
                created_at
            `,
            [
                name,
                email,
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
// Soft Delete Employees API
exports.deleteEmployee = async (req, res) => {

    try {

        const { id } = req.params;

        const adminId = req.user.id;

        const result = await pool.query(
            `
            UPDATE users
            SET is_active = FALSE
            WHERE id = $1
            AND role_id = 3
            AND created_by = $2
            AND is_active = TRUE
            RETURNING id, name, email
            `,
            [id, adminId]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Employee not found or access denied"
            });

        }

        return res.status(200).json({

            success: true,

            message: "Employee deleted successfully",

            employee: result.rows[0]

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