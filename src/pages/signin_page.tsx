import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth_context";
import { TEST_USER } from "../constants";

export const SignIn: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();

  const redirectTo =
    (location.state as { redirectTo: string })?.redirectTo || "/";

  const handlePhoneSubmit = () => {
    // Simulate sending OTP
    if (phone) {
      console.log("Sending OTP to:", phone);
      setStep("otp");
    } else {
      alert("Please enter a valid phone number.");
    }
  };

  const handleOtpSubmit = () => {
    if (otp === "123") {
      // Simulate login
      login(TEST_USER);
      navigate(redirectTo); // Redirect back to the original page
    } else {
      alert("OTP is wrong");
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
      {step === "phone" && (
        <div>
          <label htmlFor="phone">Phone Number:</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={handlePhoneSubmit}>Send OTP</button>
        </div>
      )}
      {step === "otp" && (
        <div>
          <label htmlFor="otp">OTP:</label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleOtpSubmit}>Verify OTP</button>
        </div>
      )}
    </div>
  );
};
