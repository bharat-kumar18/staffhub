import React, { useState } from "react";
import "./Login.css";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUserAlt, FaLock } from "react-icons/fa";
import { assets } from '../../assets/assets.js';
import { LoginUser } from "../../Services/api.js"
const Login = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    //     // validation of email and passward


   const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await LoginUser({
      email: email.trim(),
      password,
    });

    // JWT Token Save
    localStorage.setItem("token", res.data.token);

    // User Save
    localStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );

    alert(res.data.message);

    navigate("/dashboard");

  } catch (err) {
    alert(err.response?.data?.message || "Invalid email or password");
  }
};


    return (
        <div className="login-container">
            <div className="login-box">

                <div className="logo">
                    <img src={assets.logo} alt="StaffHub Logo" />
                </div>

                <p>Welcome</p>

                <form onSubmit={handleSubmit}>

                    <div className="input-box">
                        <FaUserAlt className="icon" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                    </div>

                    <div className="input-box">
                        <FaLock className="icon" />

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <span
                            className="eye"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>

                    </div>

                    <div className="login-options">
                        <label>
                            <input type="checkbox" />
                            Remember Me
                        </label>

                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>

                    <button className="login-btn">
                        Login
                    </button>

                </form>
                <div className="signup-link">
                    <p>
                        Don't have an account?
                        <Link to="/signup"> Sign Up</Link>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;