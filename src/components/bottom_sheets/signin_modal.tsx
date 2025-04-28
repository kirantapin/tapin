import React, { useState, useEffect } from "react";
import { Sheet } from "react-modal-sheet";
import { PhoneInput } from "../signin/phone_input";
import { Verification } from "../signin/verification";
import { supabase } from "../../utils/supabase_client";
import { X } from "lucide-react";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Handle phone number submission
  const handlePhoneSubmit = async (phone: string) => {
    setErrorMessage(""); // clear any previous errors

    // Optional: format phone number, e.g. +1
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
    setErrorMessage(""); // clear any previous errors

    const { data: session, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: code,
      type: "sms",
    });

    if (error) {
      console.error("Error verifying OTP:", error.message);
      setErrorMessage("We couldn't verify your code. Please try again.");
    } else if (session) {
      console.log("User authenticated:", session.user);
      // When the user is authenticated, just close the modal
      onClose();
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.8, 0]} // 60% of screen height at top, 0% closed
      initialSnap={0} // Start at the first snapPoint (60%)
    >
      {/* Use a custom border radius and max-height on the container */}
      <Sheet.Container className="rounded-t-3xl h-fit overflow-hidden">
        {/* Remove <Sheet.Header /> to get rid of the default header */}
        <Sheet.Content>
          {/* Your sign-in logic goes inside the content */}
          <div className="p-6 relative">
            {/* Close button at the top right */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-gray-500 hover:text-black bg-gray-100 rounded-full p-2"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Sign In</h2>
            {errorMessage && (
              <p className="text-red-500 mb-2">{errorMessage}</p>
            )}

            {step === "phone" ? (
              <PhoneInput onClose={onClose} onSubmit={handlePhoneSubmit} />
            ) : (
              <Verification
                phoneNumber={phoneNumber}
                onBack={() => setStep("phone")}
                onVerify={handleVerify}
              />
            )}
          </div>
        </Sheet.Content>
      </Sheet.Container>

      {/* The translucent backdrop */}
      <Sheet.Backdrop />
    </Sheet>
  );
};

export default SignInModal;
