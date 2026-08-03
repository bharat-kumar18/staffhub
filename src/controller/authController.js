const express = require("express");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");


exports.signup = async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // 1. Check required fields

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });

        }


        // 2. Check if user already exists

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );


        if (existingUser.rows.length > 0) {

            return res.status(404).json({
                success: false,
                message: "User already exists"
            });

        }


        // 3. Hash password

        const hashedPassword = await bcrypt.hash(password, 10);


        // 4. Insert user into database

        const result = await pool.query(
            `INSERT INTO users
            (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, name, email, role, created_at`,
            [
                name,
                email,
                hashedPassword
            ]
        );


        // 5. Send response

        res.status(201).json({

            success: true,

            message: "User registered successfully",

            user: result.rows[0]

        });


    } catch (error) {

        console.error("Signup Error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

};



// Login Code here-------------------------------------

exports.login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // 1. Check fields

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });

        }


        // 2. Find user by email

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
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


        // 4. Compare password

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );


        // 5. Wrong password

        if (!isPasswordCorrect) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }


        // 6. Generate JWT token

        const token = jwt.sign(

            {
                id: user.id,
                email: user.email,
                role: user.role
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "1d"
            }

        );


        // 7. Send response

        res.status(200).json({

            success: true,

            message: "Login successful",

            token: token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }

        });


    } catch (error) {

        console.error("Login Error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

};