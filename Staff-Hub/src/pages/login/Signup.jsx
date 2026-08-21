import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaUserAlt,
  FaLock,
  FaEnvelope,
} from "react-icons/fa";
import { assets } from "../../assets/assets";
import { SignupUser } from "../../Services/api";
import { ToastContainer ,toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (name.trim() === "") {
      toast.success("Enter Full Name");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Invalid Email");
      return;
    }

    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character."
      );
      return;
    }

    try {
      const data = {
        name,
        email,
        password,
      };

      const response = await SignupUser(data);
      console.log(response.data);

      toast.success("Signup Successful");
      navigate("/login");


    }
    catch (error) {
      console.log(error);
      toast.error("Signup Failed");

    }

  };

  return (
    <div className="login-container">
      <div className="login-box">

        <div className="logo">
          <img src={assets.logo} alt="StaffHub Logo" />
        </div>

        <p>Create Your Account</p>

        <form onSubmit={handleSubmit}>

          <div className="input-box">
            <FaUserAlt className="icon" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-box">
            <FaEnvelope className="icon" />
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

          <div className="input-box">
            <FaLock className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <span
              className="eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit" className="login-btn">
            Sign Up
          </button>

        </form>

        <div className="signup-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>

      </div>
    </div>
  );
};

export default Signup;