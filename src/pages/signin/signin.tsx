import React, { useState } from "react";
import { PhoneInput } from "./phone_input";
import { Verification } from "./verification";
import { supabase } from "../../utils/supabase_client";

export default function SignIn() {
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Handle phone number submission
  const handlePhoneSubmit = async (phone: string) => {
    setErrorMessage(""); // Clear previous errors
    const formattedPhoneNumber = `+1${phone}`;
    setPhoneNumber(formattedPhoneNumber);

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhoneNumber,
    });

    if (error) {
      console.error("Error sending OTP:", error.message);
      setErrorMessage("Failed to send OTP. Please try again.");
    } else {
      console.log("OTP sent successfully.");
      setStep("verify");
    }
  };

  // Handle OTP verification
  const handleVerify = async (code: string) => {
    setErrorMessage(""); // Clear previous errors
    console.log(code);
    const { data: session, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: code,
      type: "sms",
    });

    if (error) {
      console.error("Error verifying OTP:", error.message);
      setErrorMessage("Invalid OTP. Please try again.");
    } else if (session) {
      console.log("User authenticated:", session.user);
      // No need to manually handle the session here; `onAuthStateChange` in AuthProvider will handle it.
    }
  };

  return (
    <div>
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      {step === "phone" ? (
        <PhoneInput onSubmit={handlePhoneSubmit} />
      ) : (
        <Verification
          phoneNumber={phoneNumber}
          onBack={() => setStep("phone")}
          onVerify={handleVerify}
        />
      )}
    </div>
  );
}
