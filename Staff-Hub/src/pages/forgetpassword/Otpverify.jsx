
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Otpverify.css";
import { verifyOTP, forgetPassword } from "../../Services/api";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ToastContainer ,toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Otpverify = () => {
  const [otp, setOtp] = useState("");

  const [error, setError] = useState("");

  const location = useLocation();

  const email = location.state?.email;

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpRegex = /^[0-9]{6}$/;

    if (!otpRegex.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }
    setError("");

    try {
      const response = await verifyOTP({
        email,
        otp: otp.trim(),
      });

      const newResetToken = response?.data?.resetToken || response?.data?.token;

      if (!newResetToken) {
        setError("OTP verified, but no reset token was returned. Please try again.");
        return;
      }

      localStorage.setItem("resetToken", newResetToken);
      const successMessage = response?.data?.message || response?.data?.msg || "OTP verified successfully.";
      toast.success(successMessage);
      navigate("/resetpassword");
    }
    catch (error) {
      setError(
        error.response?.data?.message || "Invalid OTP"

      );
    }
  };


  const handleResendOtp = async () => {
    setError("");
    try {
      const response = await forgetPassword({
        email: email,
      })
      toast.success(response.data.message);
    }
    catch (error) {
      setError(
        error.response?.data?.message || "Failed to resend OTP"
      );


    }
  }

  return (
    <div className="otp-container">
      <div className="otp-box">

        <h2>Verify</h2>

        <p>
          the code was sent to email
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Enter 6 Digit OTP"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}

          <button type="submit">
            Verify OTP
          </button>

        </form>

        <div className="otp-links">

          <button className="resend-btn" onClick={handleResendOtp} type="button">
            Resend OTP
          </button>

          <Link to="/login">
            Back to Login
          </Link>

        </div>

      </div>
    </div>
  );
};

export default Otpverify;