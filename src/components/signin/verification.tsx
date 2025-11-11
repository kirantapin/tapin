import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase_client";
import { useBottomSheet } from "@/context/bottom_sheet_context";
interface VerificationProps {
  phoneNumber: string;
  onVerify: (code: string) => void;
}

export function Verification({ phoneNumber, onVerify }: VerificationProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { triggerToast } = useBottomSheet();
  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleInput = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take only the last digit if multiple are pasted

    setCode(newCode);

    // If a digit was entered and there's a next input, focus it
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all digits are filled, trigger verification
    if (index === 5 && value) {
      onVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // If current input is empty and backspace is pressed, go to previous input
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newCode = [...code];

    pastedData.split("").forEach((digit, index) => {
      if (index < 6) newCode[index] = digit;
    });

    setCode(newCode);

    // Focus the next empty input or the last input if all are filled
    const nextEmptyIndex = newCode.findIndex((digit) => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    if (pastedData.length === 6) {
      onVerify(newCode.join(""));
    }
  };

  const handleResend = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });
    if (error) {
      triggerToast(
        "Sorry, we couldn't resend the code. Please try again shortly.",
        "error"
      );
      console.error("Error resending code", error);
    }
    setTimeLeft(60);
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="p-6 pb-3">
        <h1 className="text-4xl font-bold mb-4">Verify it's you</h1>
        <p className="text-xl text-gray-600 mb-2">
          Please enter 6 digit verification code that have been sent to your
          mobile phone
        </p>
        <p className="text-xl text-gray-600 mb-4">{phoneNumber}</p>
      </div>

      <div className="flex gap-2 mb-8 justify-center px-6">
        {code.map((digit, index) => (
          <div key={index} className="relative">
            <input
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`w-14 h-14 rounded-xl border text-center text-2xl bg-transparent
                ${digit ? "border-black bg-gray-800" : "border-gray-600"}
                focus:outline-none focus:border-black focus:ring-1 focus:ring-black`}
              aria-label={`Digit ${index + 1} of verification code`}
            />
          </div>
        ))}
      </div>

      <div className="px-6">
        <div className="text-gray-600 mb-4 text-center">
          {timeLeft > 0
            ? `You can resend the code in ${timeLeft} seconds`
            : "You can resend the code now"}
        </div>
        <div className="text-center">
          <button
            className={`mb-8 ${timeLeft > 0 ? "text-gray-400" : "text-black"}`}
            disabled={timeLeft > 0}
            onClick={handleResend}
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
}
