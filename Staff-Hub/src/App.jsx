import React from "react";

import "./App.css";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login";
import Signup from "./pages/login/Signup";
import Forgetemail from "./pages/forgetpassword/Forgetemail";
import Otpverify from "./pages/forgetpassword/Otpverify";
import ResetPassword from "./pages/forgetpassword/ResetPassword";

function App() {
  // console.log("APP COMPONENT LOADED");
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<Forgetemail />} />
      <Route path="/otp-verify" element={<Otpverify />} />
      <Route path="/resetpassword" element={<ResetPassword/>}/>


    </Routes>
  );
}

export default App;