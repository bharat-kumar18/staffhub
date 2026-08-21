import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";

import {
    FaEye,
    FaEyeSlash,
    FaUserAlt,
    FaLock
} from "react-icons/fa";

import { assets } from "../../assets/assets.js";
import { LoginUser } from "../../Services/api.js";

// Toastify
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Login = () => {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    // ==========================================
    // LOGIN
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            // ==========================================
            // LOGIN API
            // ==========================================

            const res = await LoginUser({
                email: email.trim(),
                password: password
            });

            console.log("Login Response:", res.data);


            // ==========================================
            // SAVE JWT TOKEN
            // ==========================================

            localStorage.setItem(
                "token",
                res.data.token
            );


            // ==========================================
            // SAVE USER
            // ==========================================

            localStorage.setItem(
                "user",
                JSON.stringify(res.data.user)
            );


            // ==========================================
            // RESET SIDEBAR TAB
            // ==========================================

            sessionStorage.removeItem("activePage");


            // ==========================================
            // GET USER ROLE
            // ==========================================

            const role = res.data.user?.role;

            console.log("User Role:", role);


            // ==========================================
            // INVALID ROLE
            // ==========================================

            if (
                role !== "superadmin" &&
                role !== "admin" &&
                role !== "employee"
            ) {

                toast.error("Invalid user role");

                return;
            }


            // ==========================================
            // SUCCESS TOAST
            // ==========================================

            toast.success("Login successful!", {
                autoClose: 800,
            });


            // ==========================================
            // ROLE BASED NAVIGATION
            // ==========================================

            setTimeout(() => {

                // SUPER ADMIN

                if (role === "superadmin") {

                    navigate("/superadmindashboard");

                }

                // ADMIN

                else if (role === "admin") {

                    navigate("/dashboard");

                }

                // EMPLOYEE

                else if (role === "employee") {

                    navigate("/employee-dashboard");

                }

            }, 800);


        } catch (err) {

            console.error("Login Error:", err);


            // ==========================================
            // ERROR TOAST
            // ==========================================

            toast.error(
                err.response?.data?.message ||
                "Invalid email or password"
            );
        }
    };


    return (

        <div className="login-container">


            {/* ==========================================
                LOGIN BOX
            ========================================== */}

            <div className="login-box">


                {/* ==========================================
                    LOGO
                ========================================== */}

                <div className="logo">

                    <img
                        src={assets.logo}
                        alt="StaffHub Logo"
                    />

                </div>


                {/* ==========================================
                    WELCOME TEXT
                ========================================== */}

                <p>Welcome</p>


                {/* ==========================================
                    LOGIN FORM
                ========================================== */}

                <form onSubmit={handleSubmit}>


                    {/* ==========================================
                        EMAIL
                    ========================================== */}

                    <div className="input-box">

                        <FaUserAlt className="icon" />

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />

                    </div>


                    {/* ==========================================
                        PASSWORD
                    ========================================== */}

                    <div className="input-box">

                        <FaLock className="icon" />

                        <input
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />


                        {/* PASSWORD SHOW / HIDE */}

                        <span
                            className="eye"
                            onClick={() =>
                                setShowPassword(
                                    !showPassword
                                )
                            }
                        >

                            {showPassword
                                ? <FaEyeSlash />
                                : <FaEye />
                            }

                        </span>

                    </div>


                    {/* ==========================================
                        LOGIN OPTIONS
                    ========================================== */}

                    <div className="login-options">

                        <label>

                            <input
                                type="checkbox"
                            />

                            Remember Me

                        </label>


                        <Link to="/forgot-password">
                            Forgot Password?
                        </Link>

                    </div>


                    {/* ==========================================
                        LOGIN BUTTON
                    ========================================== */}

                    <button
                        type="submit"
                        className="login-btn"
                    >
                        Login
                    </button>

                </form>


                {/* ==========================================
                    SIGNUP
                ========================================== */}

                <div className="signup-link">

                    <p>

                        Don't have an account?

                        <Link to="/signup">
                            {" "}Sign Up
                        </Link>

                    </p>

                </div>


            </div>

        </div>
    );
};


export default Login;