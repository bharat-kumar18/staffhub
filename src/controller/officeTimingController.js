const express = require("express");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
// =====================================================
// ADD / SET OFFICE TIMING
// =====================================================

exports.addOfficeTiming = async (req, res) => {

    try {

        const {
            office_start_time,
            office_end_time,
            late_after
        } = req.body;


        const adminId = req.user.id;


        // -----------------------------------------
        // Validation
        // -----------------------------------------

        if (
            !office_start_time ||
            !office_end_time ||
            !late_after
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Office start time, office end time and late after are required"

            });

        }


        // -----------------------------------------
        // Check Admin
        // -----------------------------------------

        const adminResult = await pool.query(
            `
            SELECT
                id,
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
        // Check existing timing
        // -----------------------------------------

        const existingTiming = await pool.query(
            `
            SELECT id

            FROM office_timings

            WHERE admin_id = $1
            `,
            [adminId]
        );


        if (existingTiming.rows.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Office timing already exists. Please update it."

            });

        }


        // -----------------------------------------
        // Insert timing
        // -----------------------------------------

        const result = await pool.query(
            `
            INSERT INTO office_timings
            (
                admin_id,
                office_start_time,
                office_end_time,
                late_after
            )

            VALUES
            ($1, $2, $3, $4)

            RETURNING
                id,
                admin_id,
                office_start_time,
                office_end_time,
                late_after,
                is_active,
                created_at,
                updated_at
            `,
            [
                adminId,
                office_start_time,
                office_end_time,
                late_after
            ]
        );


        return res.status(201).json({

            success: true,

            message:
                "Office timing created successfully",

            company:
                adminResult.rows[0].company_name,

            addedBy: {
                admin_id: adminId
            },

            officeTiming:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Add Office Timing Error:",
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
// GET OFFICE TIMING
// =====================================================

exports.getOfficeTiming = async (req, res) => {

    try {

        const adminId = req.user.id;


        const result = await pool.query(
            `
            SELECT
                ot.id,
                ot.admin_id,
                u.company_name,
                ot.office_start_time,
                ot.office_end_time,
                ot.late_after,
                ot.is_active,
                ot.created_at,
                ot.updated_at

            FROM office_timings ot

            JOIN users u
                ON ot.admin_id = u.id

            WHERE ot.admin_id = $1

            AND ot.is_active = TRUE
            `,
            [adminId]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Office timing not found"

            });

        }


        return res.status(200).json({

            success: true,

            officeTiming:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Get Office Timing Error:",
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
// UPDATE OFFICE TIMING
// =====================================================

exports.updateOfficeTiming = async (req, res) => {

    try {

        const {
            office_start_time,
            office_end_time,
            late_after
        } = req.body;


        const adminId = req.user.id;


        if (
            !office_start_time ||
            !office_end_time ||
            !late_after
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Office start time, office end time and late after are required"

            });

        }


        const result = await pool.query(
            `
            UPDATE office_timings

            SET
                office_start_time = $1,
                office_end_time = $2,
                late_after = $3,
                updated_at = CURRENT_TIMESTAMP

            WHERE admin_id = $4

            AND is_active = TRUE

            RETURNING
                id,
                admin_id,
                office_start_time,
                office_end_time,
                late_after,
                is_active,
                updated_at
            `,
            [
                office_start_time,
                office_end_time,
                late_after,
                adminId
            ]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "Office timing not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Office timing updated successfully",

            updatedBy: {
                admin_id: adminId
            },

            officeTiming:
                result.rows[0]

        });


    } catch (error) {

        console.error(
            "Update Office Timing Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }
};