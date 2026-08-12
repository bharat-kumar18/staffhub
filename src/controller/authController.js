const express = require("express");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {
    sendWelcomeEmail,
    sendOTPEmail,
} = require("../utils/sendMail");



exports.signup = async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            companyName
        } = req.body;


        // -------------------------------------------------
        // 1. Check required fields
        // -------------------------------------------------

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });

        }


        // -------------------------------------------------
        // 2. Check if user already exists
        // -------------------------------------------------

        const existingUser = await pool.query(
            `SELECT id
             FROM users
             WHERE email = $1`,
            [email]
        );


        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "User already exists"
            });

        }


        // -------------------------------------------------
        // 3. Hash password
        // -------------------------------------------------

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // -------------------------------------------------
        // 4. Get ADMIN role
        // -------------------------------------------------

        const roleResult = await pool.query(
            `SELECT id, role_name
             FROM roles
             WHERE role_name = $1`,
            ["admin"]
        );


        // -------------------------------------------------
        // 5. Check ADMIN role exists
        // -------------------------------------------------

        if (roleResult.rows.length === 0) {

            return res.status(500).json({
                success: false,
                message: "Admin role not found"
            });

        }


        // -------------------------------------------------
        // 6. Get ADMIN role ID
        // -------------------------------------------------

        const roleId = roleResult.rows[0].id;


        // -------------------------------------------------
        // 7. Insert user
        // -------------------------------------------------

        const result = await pool.query(
            `INSERT INTO users
    (
        name,
        email,
        password,
        role_id,
        company_name
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
        id,
        name,
        email,
        company_name,
        role_id,
        created_at`,
            [
                name,
                email,
                hashedPassword,
                roleId,
                companyName
            ]
        );


        // -------------------------------------------------
        // 8. Send welcome email
        // -------------------------------------------------

        await sendWelcomeEmail(
            name,
            email
        );


        // -------------------------------------------------
        // 9. Send response
        // -------------------------------------------------

        return res.status(201).json({

            success: true,

            message: "User registered successfully",

            user: result.rows[0]

        });


    } catch (error) {

        console.error(
            "Signup Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Internal server error"

        });

    }

};



// Login Code here-------------------------------------

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        // 1. Check fields
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });

        }


        // 2. Get user + role
        const result = await pool.query(
            `
    SELECT
        users.id,
        users.name,
        users.email,
        users.password,
        users.role_id,
        users.company_name,
        roles.role_name
    FROM users
    JOIN roles
        ON users.role_id = roles.id
    WHERE users.email = $1
    AND users.is_active = TRUE
    `,
            [email]
        );


        // 3. User not found
        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }


        const user = result.rows[0];


        // 4. Check password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );


        if (!isPasswordCorrect) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }


        // 5. Create JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role_id: user.role_id,
                role: user.role_name,
                company_name: user.company_name
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );


        // 6. Response
        return res.status(200).json({

            success: true,

            message: "Login successful",

            token: token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role_id: user.role_id,
                role: user.role_name
            }

        });


    } catch (error) {

        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

};


// FORGOT PASSWORD-------------------------------------

exports.forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;


        // 1. Check email

        if (!email) {

            return res.status(400).json({
                success: false,
                message: "Email is required"
            });

        }


        // 2. Find user

        const result = await pool.query(
            "SELECT id, email FROM users WHERE email = $1",
            [email]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User with this email does not exist"
            });

        }


        const user = result.rows[0];


        // 3. Generate 6 digit OTP

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();


        // 4. OTP expires after 10 minutes

        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000
        );


        // 5. Delete previous OTPs

        await pool.query(
            "DELETE FROM password_reset_otps WHERE user_id = $1",
            [user.id]
        );


        // 6. Store new OTP

        await pool.query(
            `INSERT INTO password_reset_otps
            (user_id, otp, expires_at)
            VALUES ($1, $2, $3)`,
            [
                user.id,
                otp,
                expiresAt
            ]
        );


        // 7. Send OTP to email

        await sendOTPEmail(
            user.email,
            otp
        );


        // 8. Response

        res.status(200).json({

            success: true,

            message: "OTP sent successfully"

        });


    } catch (error) {

        console.error(
            "Forgot Password Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

};

// VERIFY OTP--------------------------------------------

exports.verifyOTP = async (req, res) => {

    try {

        const {
            email,
            otp
        } = req.body;


        // 1. Check fields

        if (!email || !otp) {

            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });

        }


        // 2. Find user

        const userResult = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );


        if (userResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        const userId = userResult.rows[0].id;


        // 3. Find OTP

        const otpResult = await pool.query(
            `SELECT *
             FROM password_reset_otps
             WHERE user_id = $1
             AND verified = FALSE
             ORDER BY created_at DESC
             LIMIT 1`,
            [userId]
        );


        if (otpResult.rows.length === 0) {

            return res.status(400).json({
                success: false,
                message: "OTP not found or already used"
            });

        }


        const otpRecord = otpResult.rows[0];


        // 4. Check OTP expiration

        if (new Date() > new Date(otpRecord.expires_at)) {

            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });

        }


        // 5. Compare OTP

        if (otpRecord.otp !== otp) {

            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });

        }


        // 6. Mark OTP as verified

        await pool.query(
            `UPDATE password_reset_otps
             SET verified = TRUE
             WHERE id = $1`,
            [otpRecord.id]
        );


        // 7. Generate temporary reset token

        const resetToken = jwt.sign(

            {
                userId: userId,
                purpose: "password_reset"
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "10m"
            }

        );


        // 8. Send reset token to frontend

        res.status(200).json({

            success: true,

            message: "OTP verified successfully",

            resetToken: resetToken

        });


    } catch (error) {

        console.error(
            "Verify OTP Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

};


// RESET PASSWORD-----------------------------------------

exports.resetPassword = async (req, res) => {

    try {

        const {
            resetToken,
            newPassword
        } = req.body;


        // 1. Check fields
        if (!resetToken || !newPassword) {

            return res.status(400).json({
                success: false,
                message: "Reset token and new password are required"
            });

        }


        // 2. Verify reset token
        const decoded = jwt.verify(
            resetToken,
            process.env.JWT_SECRET
        );


        // 3. Check token purpose
        if (decoded.purpose !== "password_reset") {

            return res.status(401).json({
                success: false,
                message: "Invalid reset token"
            });

        }


        // 4. Get user's current password from database
        const result = await pool.query(
            "SELECT id, password FROM users WHERE id = $1",
            [decoded.userId]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        const user = result.rows[0];


        // 5. Check whether new password is same as old password
        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
        );


        if (isSamePassword) {

            return res.status(400).json({
                success: false,
                message: "Your password is same as old password. Please enter a new password"
            });

        }


        // 6. Hash new password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );


        // 7. Update password
        await pool.query(
            `UPDATE users
             SET password = $1
             WHERE id = $2`,
            [
                hashedPassword,
                decoded.userId
            ]
        );


        // 8. Delete OTP record
        await pool.query(
            `DELETE FROM password_reset_otps
             WHERE user_id = $1`,
            [decoded.userId]
        );


        // 9. Response
        return res.status(200).json({

            success: true,

            message: "Password reset successfully"

        });


    } catch (error) {

        console.error(
            "Reset Password Error:",
            error
        );


        // Token expired
        if (error.name === "TokenExpiredError") {

            return res.status(401).json({

                success: false,

                message: "Reset token has expired"

            });

        }


        // Invalid token
        if (error.name === "JsonWebTokenError") {

            return res.status(401).json({

                success: false,

                message: "Invalid reset token"

            });

        }


        return res.status(500).json({

            success: false,

            message: "Internal server error"

        });

    }

};

// CHANGE PASSWORD-----------------------------------------

exports.changePassword = async (req, res) => {

    try {

        const { oldPassword, newPassword } = req.body;


        // 1. Check input fields
        if (!oldPassword || !newPassword) {

            return res.status(400).json({
                success: false,
                message: "Old password and new password are required"
            });

        }


        // 2. Check whether old and new password are same
        if (oldPassword === newPassword) {

            return res.status(400).json({
                success: false,
                message: "New password must be different from old password"
            });

        }


        // 3. Get user ID from JWT
        const userId = req.user.id;


        // 4. Find user in database
        const result = await pool.query(
            "SELECT id, password FROM users WHERE id = $1",
            [userId]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        const user = result.rows[0];


        // 5. Compare old password with hashed password
        const isPasswordCorrect = await bcrypt.compare(
            oldPassword,
            user.password
        );


        if (!isPasswordCorrect) {

            return res.status(401).json({
                success: false,
                message: "Old password is incorrect"
            });

        }


        // 6. Hash new password
        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );


        // 7. Update password
        await pool.query(
            `UPDATE users
             SET password = $1
             WHERE id = $2`,
            [
                hashedPassword,
                userId
            ]
        );


        // 8. Success response
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });


    } catch (error) {

        console.error(
            "Change Password Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

};





// Get User API ONLY by SUPERADMIN
exports.getAdmins = async (req, res) => {

    try {

        // =====================================================
        // 1. Get pagination, sorting and filters from BODY
        // =====================================================

       let {
            page = 1,
            limit = 10,
            sortedBy = "created_at",
            sortOrder = "DESC",
            searchByKeyword = "",
            isActive
        } = req.body;


        // =====================================================
        // 2. Convert pagination values to numbers
        // =====================================================

        page = parseInt(page);
        limit = parseInt(limit);


        // =====================================================
        // 3. Validate page
        // =====================================================

        if (isNaN(page) || page < 1) {

            return res.status(400).json({
                success: false,
                message: "Page must be a positive number"
            });

        }


        // =====================================================
        // 4. Validate limit
        // =====================================================

        if (isNaN(limit) || limit < 1) {

            return res.status(400).json({
                success: false,
                message: "Limit must be a positive number"
            });

        }


        // Maximum 100 users per page

        if (limit > 100) {
            limit = 100;
        }


        // =====================================================
        // 5. Calculate OFFSET
        // =====================================================

        const offset = (page - 1) * limit;


        // =====================================================
        // 6. Allowed sorting columns
        // =====================================================

        const allowedSortColumns = {

            id: "users.id",

            name: "users.name",

            email: "users.email",

            company_name: "users.company_name",

            created_at: "users.created_at",

            role_id: "users.role_id"

        };


        // =====================================================
        // 7. Validate sortedBy
        // =====================================================

        if (!allowedSortColumns[sortedBy]) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid sortedBy. Allowed values: id, name, email, created_at, role_id"

            });

        }


        const sortColumn = allowedSortColumns[sortedBy];


        // =====================================================
        // 8. Validate sortOrder
        // =====================================================

        sortOrder = sortOrder.toUpperCase();


        if (!["ASC", "DESC"].includes(sortOrder)) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid sortOrder. Use ASC or DESC"

            });

        }


        // =====================================================
        // 9. Create WHERE conditions
        // =====================================================

        const conditions = [

            "users.role_id = 2"

        ];


        const queryParams = [];



        // =====================================================
        // 10. Search by keyword
        // =====================================================

        if (
            searchByKeyword &&
            searchByKeyword.trim() !== ""
        ) {

            queryParams.push(
                `%${searchByKeyword.trim()}%`
            );

            conditions.push(
                `(
                    users.name ILIKE $${queryParams.length}
                    OR users.email ILIKE $${queryParams.length}
                )`
            );

        }


        // =====================================================
        // 11. Active / Inactive filter
        //
        // By default:
        // isActive = undefined
        // → show BOTH active and inactive users
        //
        // If true:
        // → show only active users
        //
        // If false:
        // → show only inactive users
        // =====================================================

        if (isActive !== undefined && isActive !== "") {

            // Convert string "true"/"false" into boolean

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
                `users.is_active = $${queryParams.length}`
            );

        }


        // =====================================================
        // 12. Create WHERE clause
        // =====================================================

        const whereClause =
            conditions.join(" AND ");



        // =====================================================
        // 13. Get TOTAL users
        // =====================================================

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM users
            WHERE ${whereClause}
        `;


        const countResult = await pool.query(
            countQuery,
            queryParams
        );


        const totalUsers = parseInt(
            countResult.rows[0].total
        );



        // =====================================================
        // 14. Pagination parameters
        // =====================================================

        queryParams.push(limit);

        const limitIndex = queryParams.length;


        queryParams.push(offset);

        const offsetIndex = queryParams.length;



        // =====================================================
        // 15. Get Admin users
        // =====================================================

        const usersQuery = `
            SELECT
                users.id,
                users.name,
                users.email,
                company_name,
                users.role_id,
                roles.role_name,
                users.is_active,
                users.created_at

            FROM users

            JOIN roles
                ON users.role_id = roles.id

            WHERE ${whereClause}

            ORDER BY ${sortColumn} ${sortOrder}

            LIMIT $${limitIndex}

            OFFSET $${offsetIndex}
        `;


        const result = await pool.query(
            usersQuery,
            queryParams
        );



        // =====================================================
        // 16. Calculate total pages
        // =====================================================

        const totalPages = Math.ceil(
            totalUsers / limit
        );



        // =====================================================
        // 17. Response
        // =====================================================

        return res.status(200).json({

            success: true,

            message: "Admin users fetched successfully",


            pagination: {

                currentPage: page,

                limit: limit,

                totalUsers: totalUsers,

                totalPages: totalPages,

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


            users: result.rows

        });


    } catch (error) {

        console.error(
            "Get Admins Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Internal server error"

        });

    }

};

// ADD ADMIN USER
// ONLY SUPER ADMIN CAN USE THIS API

exports.addUser = async (req, res) => {

    try {

        const {
            name,
            email,
            companyName,
            password
        } = req.body;


        // 1. Check required fields

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });

        }


        // 2. Check whether email already exists

        const existingUser = await pool.query(
            `SELECT id
             FROM users
             WHERE email = $1`,
            [email]
        );


        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "User with this email already exists"
            });

        }


        // 3. Find ADMIN role

        const roleResult = await pool.query(
            `SELECT id
             FROM roles
             WHERE role_name = $1`,
            ["admin"]
        );


        if (roleResult.rows.length === 0) {

            return res.status(500).json({
                success: false,
                message: "Admin role not found"
            });

        }


        const adminRoleId = roleResult.rows[0].id;


        // 4. Hash password

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // 5. Insert Admin

        const result = await pool.query(
            `INSERT INTO users
            (
                name,
                email,
                company_name,
                password,
                role_id
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
                id,
                name,
                email,
                company_name,
                role_id,
                created_at`,
            [
                name,
                email,
                companyName,
                hashedPassword,
                adminRoleId
            ]
        );


        // 6. Response

        return res.status(201).json({

            success: true,

            message: "Admin created successfully",

            user: result.rows[0]

        });


    } catch (error) {

        console.error(
            "Add User Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Internal server error"

        });

    }

};

// UPDATE ADMIN USER
// ONLY SUPER ADMIN CAN UPDATE ADMIN

exports.updateUser = async (req, res) => {

    try {

        // -----------------------------------------
        // 1. Get data from request body
        // -----------------------------------------

        const {
            id,
            name,
            email
        } = req.body;


        // -----------------------------------------
        // 2. Validate ID
        // -----------------------------------------

        if (!id) {

            return res.status(400).json({
                success: false,
                message: "Admin ID is required"
            });

        }


        // -----------------------------------------
        // 3. Validate name and email
        // -----------------------------------------

        if (!name || !email) {

            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });

        }


        // -----------------------------------------
        // 4. Check whether target user is an Admin
        // -----------------------------------------

        const userResult = await pool.query(
            `SELECT
                id,
                name,
                email,
                role_id
             FROM users
             WHERE id = $1
             AND role_id = 2
             AND is_active = TRUE`,
            [id]
        );


        // -----------------------------------------
        // 5. Admin not found
        // -----------------------------------------

        if (userResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });

        }


        // -----------------------------------------
        // 6. Check whether email already exists
        // -----------------------------------------

        const emailResult = await pool.query(
            `SELECT id
             FROM users
             WHERE email = $1
             AND id != $2`,
            [
                email,
                id
            ]
        );


        // -----------------------------------------
        // 7. Email already exists
        // -----------------------------------------

        if (emailResult.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "This email is already registered"
            });

        }


        // -----------------------------------------
        // 8. Update Admin
        // -----------------------------------------

        const result = await pool.query(
            `UPDATE users
             SET
                name = $1,
                email = $2
             WHERE id = $3
             AND role_id = 2
             AND is_active = TRUE
             RETURNING
                id,
                name,
                email,
                role_id,
                is_active,
                created_at`,
            [
                name,
                email,
                id
            ]
        );


        // -----------------------------------------
        // 9. Response
        // -----------------------------------------

        return res.status(200).json({

            success: true,

            message: "Admin updated successfully",

            user: result.rows[0]

        });


    } catch (error) {

        console.error(
            "Update User Error:",
            error
        );


        // PostgreSQL unique constraint
        if (error.code === "23505") {

            return res.status(409).json({

                success: false,

                message: "This email is already registered"

            });

        }


        return res.status(500).json({

            success: false,

            message: "Internal server error"

        });

    }

};

// SOFT DELETE USER
exports.softDeleteUser = async (req, res) => {

    try {

        const { id } = req.body;

        // 1. Check ID
        if (!id) {

            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });

        }

        // 2. Check that target user exists
        const userResult = await pool.query(
            `SELECT
                id,
                name,
                email,
                role_id,
                is_active
             FROM users
             WHERE id = $1`,
            [id]
        );

        if (userResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        const user = userResult.rows[0];

        // 3. Super Admin cannot delete himself
        if (user.role_id === 1) {

            return res.status(403).json({
                success: false,
                message: "Super Admin cannot be deleted"
            });

        }

        // 4. Only Admin can be soft deleted
        if (user.role_id !== 2) {

            return res.status(403).json({
                success: false,
                message: "Only Admin users can be soft deleted"
            });

        }

        // 5. Already inactive
        if (!user.is_active) {

            return res.status(400).json({
                success: false,
                message: "User is already inactive"
            });

        }

        // 6. Soft delete
        await pool.query(
            `UPDATE users
             SET is_active = FALSE
             WHERE id = $1`,
            [id]
        );

        // 7. Response
        return res.status(200).json({

            success: true,

            message: "Admin soft deleted successfully",

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role_id: user.role_id,
                is_active: false
            }

        });

    } catch (error) {

        console.error(
            "Soft Delete User Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

};