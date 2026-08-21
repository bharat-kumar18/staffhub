import React, { useState } from "react";

import "./Forgetemail.css";
import { Link, useNavigate } from "react-router-dom";
import { forgetPassword } from "../../Services/api";
import { ToastContainer ,toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Forgetemail = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.trim() === "") {
      setError("Email is required");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    console.log(email);
    try {
      const response = await forgetPassword({
        email: email.trim(),
      })

      console.log(response.data);
      navigate("/otp-verify",{
        state:{
          email:email.trim(),
        },
      });

    }
    catch (error) {
      setError(
        error.response?.data?.message || "Something went wrong"
      );
    }

  };

  return (
    <div className="forget-container">
      <div className="forget-box">

        <h2>Forgot Password</h2>

        <p>
          Enter your registered email address.
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}

          <button type="submit">
            Send OTP
          </button>

        </form>

        <Link to="/login">
          Back to Login
        </Link>

      </div>
    </div>
  );
};

export default Forgetemail;