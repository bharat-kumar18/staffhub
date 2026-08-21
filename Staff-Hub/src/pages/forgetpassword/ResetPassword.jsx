import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import "./ResetPassword.css";
import { resetPassword} from "../../Services/api";
import { ToastContainer,toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const getResponseMessage = (data) => {
    if (!data) return "Password reset successful.";
    if (typeof data === "string") return data;
    return data.message || data.msg || data.error || data.details || "Password reset successful.";
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    const resetToken = localStorage.getItem("resetToken");

    setError("");

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      setError(
        "Password must contain 8 characters, uppercase, lowercase, number & special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!resetToken) {
      setError("Reset session expired. Please request a new OTP.");
      return;
    }

    try{
      const response = await resetPassword({
        newPassword,
        resetToken,
      });

      const successMessage = getResponseMessage(response?.data);
      toast.success(successMessage);
      localStorage.removeItem("resetToken");
      navigate("/login");
    }
    catch (error) {
      setError(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-box">

        <h2>Reset Password</h2>

        <p>
          Create a new password for your account.
        </p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>

          <div className="password-box">

            <FaLock className="icon" />

            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <span
              className="eye"
              onClick={() =>
                setShowNewPassword(!showNewPassword)
              }
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>

          </div>

          <div className="password-box">

            <FaLock className="icon" />

            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
            />

            <span
              className="eye"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>

          </div>

          <button type="submit">
            Reset Password
          </button>

        </form>

        <Link to="/login">
          Back to Login
        </Link>

      </div>
    </div>
  );
};

export default ResetPassword;