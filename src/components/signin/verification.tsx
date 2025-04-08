import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";

interface VerificationProps {
  phoneNumber: string;
  onBack: () => void;
  onVerify: (code: string) => void;
}

export function Verification({
  phoneNumber,
  onBack,
  onVerify,
}: VerificationProps) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <h1 className="text-4xl font-bold mb-4">Verify it's you</h1>
      <p className="text-xl text-gray-600 mb-2">
        Please enter 6 digit verification code that have been sent to your
        mobile phone
      </p>
      <p className="text-xl text-gray-600 mb-8">{phoneNumber}</p>

      <div className="flex gap-3 mb-8 justify-center">
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
                ${digit ? "border-[#F5B14C] bg-gray-800" : "border-gray-700"}
                focus:outline-none focus:border-[#F5B14C] focus:ring-1 focus:ring-[#F5B14C]`}
              aria-label={`Digit ${index + 1} of verification code`}
            />
          </div>
        ))}
      </div>

      <div className="text-gray-600 mb-4 text-center">
        You can resend the code in {timeLeft} seconds
      </div>
      <div className="text-center">
        <button
          className="text-[#F5B14C] mb-8"
          disabled={timeLeft > 0}
          onClick={() => setTimeLeft(60)}
        >
          Resend Code
        </button>
      </div>

      {/* <button
        className="w-full bg-[#8B7355] text-black py-4 rounded-full text-lg font-medium"
        onClick={() => onVerify(code.join(""))}
      >
        Submit
      </button> */}
    </div>
  );
}
