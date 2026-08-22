const pool = require("../config/db");
const fs = require("fs");
const path = require("path");


// =====================================================
// GET MY PROFILE
// =====================================================

exports.getMyProfile = async (req, res) => {

    try {

        // Employee ID comes from JWT

        const employeeId = req.user.id;


        const result = await pool.query(
            `
            SELECT

                e.id,
                e.name,
                e.email,
                e.department,
                e.designation,
                e.phone,
                e.dob,
                e.address,
                e.profile_picture,
                e.created_at,
                e.updated_at,
                e.is_active,

                u.company_name

            FROM employees e

            JOIN users u
                ON e.admin_id = u.id

            WHERE e.id = $1

            AND e.is_active = TRUE
            `,
            [employeeId]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Employee profile not found"

            });

        }


        return res.status(200).json({

            success: true,

            message: "Profile fetched successfully",

            employee: result.rows[0]

        });


    } catch (error) {

        console.error(
            "Get My Profile Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Internal server error"

        });

    }

};



// =====================================================
// UPLOAD / CHANGE PROFILE PICTURE
// =====================================================

exports.uploadProfilePicture = async (req, res) => {

    try {

        // Employee ID from JWT

        const employeeId = req.user.id;


        // -----------------------------------------
        // Check file
        // -----------------------------------------

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "Profile picture is required"

            });

        }


        // -----------------------------------------
        // Get old profile picture
        // -----------------------------------------

        const employeeResult = await pool.query(
            `
            SELECT
                id,
                profile_picture

            FROM employees

            WHERE id = $1

            AND is_active = TRUE
            `,
            [employeeId]
        );


        if (employeeResult.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Employee not found"

            });

        }


        const employee =
            employeeResult.rows[0];


        // -----------------------------------------
        // Delete old picture
        // -----------------------------------------

        if (employee.profile_picture) {

            const oldImagePath = path.join(
                __dirname,
                "../../",
                employee.profile_picture
            );


            if (fs.existsSync(oldImagePath)) {

                fs.unlinkSync(oldImagePath);

            }

        }


        // -----------------------------------------
        // New picture path
        // -----------------------------------------

        const profilePicture =
            `/uploads/employees/${req.file.filename}`;


        // -----------------------------------------
        // Update database
        // -----------------------------------------

        const result = await pool.query(
            `
            UPDATE employees

            SET
                profile_picture = $1,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $2

            RETURNING
                id,
                name,
                email,
                profile_picture,
                updated_at
            `,
            [
                profilePicture,
                employeeId
            ]
        );


        return res.status(200).json({

            success: true,

            message:
                "Profile picture uploaded successfully",

            employee:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Upload Profile Picture Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Internal server error"

        });

    }

};