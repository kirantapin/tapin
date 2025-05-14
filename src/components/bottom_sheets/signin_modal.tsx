import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PhoneInputComponent } from "../signin/phone_input";
import { Verification } from "../signin/verification";
import { supabase } from "../../utils/supabase_client";
import { X } from "lucide-react";
import { useBottomSheet } from "@/context/bottom_sheet_context";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { triggerToast } = useBottomSheet();
  // Handle phone number submission
  const handlePhoneSubmit = async (phone: string) => {
    // Optional: format phone number, e.g. +1
    setPhoneNumber(phone);

    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (error) {
      console.error("Error sending OTP:", error.message);
      triggerToast("Failed to send OTP. Please try again.", "error");
    } else {
      setStep("verify");
    }
  };

  // Handle OTP verification
  const handleVerify = async (code: string) => {
    const { data: session, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: code,
      type: "sms",
    });

    if (error) {
      console.error("Error verifying OTP:", error.message);
      triggerToast("We couldn't verify your code. Please try again.", "error");
    } else if (session) {
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-3xl [&>button]:hidden p-0"
      >
        <div className="flex flex-col">
          <SheetHeader className="flex-none px-6 pt-6 pb-4">
            <div className="flex justify-between items-start">
              <SheetTitle className="text-2xl font-bold">Sign In</SheetTitle>
              <button
                onClick={() => {
                  onClose();
                  setStep("phone");
                }}
                className="text-gray-500 bg-gray-200 rounded-full p-2 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {step === "phone" ? (
              <PhoneInputComponent
                onClose={onClose}
                onSubmit={handlePhoneSubmit}
              />
            ) : (
              <Verification
                phoneNumber={phoneNumber}
                onBack={() => setStep("phone")}
                onVerify={handleVerify}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SignInModal;
