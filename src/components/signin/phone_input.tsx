import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export function PhoneInputComponent({
  onSubmit,
}: {
  onSubmit: (phone: string) => void;
}) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [value, setValue] = useState<string>("+1"); //default to american dial code

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value + phoneNumber);
  };

  return (
    <div className="min-h-screen bg-blue text-black p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img
            src="/tapin_logo_black.png"
            alt="tap in logo"
            className="h-8 object-contain"
          />
        </div>
      </div>

      <div className="mt-10">
        <h1 className="text-4xl font-bold mb-4">Login or sign up</h1>
        <p className="text-xl text-gray-600 mb-12">
          New to Tap In? Log in to access exclusive deals and earn rewards, let
          the good times pour!
        </p>

        <form onSubmit={handleSubmit}>
          <label className="block text-lg mb-2">Phone Number</label>
          <div className="relative mb-4">
            <div className="flex items-center bg-[#FFFFFF] rounded-xl p-4 border border-[#CAA650]">
              {/* Country code selector */}
              <div className="flex items-center gap-2 pr-1 border-r border-gray-600 min-w-[90px]">
                <PhoneInput
                  country={"us"}
                  value={value}
                  onChange={(data) => {
                    setValue("+" + data);
                  }}
                  containerClass="font-[Gilroy]" // applies to whole component
                  inputClass="font-[Gilroy] text-base"
                  inputStyle={{
                    width: "100%", // ✅ let it expand in its container
                    minWidth: "50px", // ✅ still prevents shrinking too much
                    maxWidth: "80px",
                    border: "none",
                    background: "transparent",
                    fontSize: "16px",
                  }}
                  buttonStyle={{
                    backgroundColor: "transparent",
                    border: "none",
                    padding: 0,
                    marginRight: "10px",
                    transform: "scale(1.25)", // ⬅️ Make flag icon bigger
                    transformOrigin: "left center",
                  }}
                  containerStyle={{
                    width: "auto",
                  }}
                  dropdownStyle={{
                    zIndex: 1000,
                    borderRadius: "8px",
                  }}
                  disableCountryCode // prevents typing in code
                  disableDropdown={false} // keep dropdown enabled
                  countryCodeEditable={false}
                  placeholder=""
                />
              </div>

              {/* Phone number input */}
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 bg-transparent ml-3 outline-none placeholder-gray-600"
                placeholder="(409) 487-1935"
              />
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-4 text-center">
            By tapping SEND CODE, you consent to receive text messages from Tap
            In App (e.g., order updates). Text HELP for help or STOP to cancel.
            Message & data rates may apply.
          </p>

          <button
            type="submit"
            className="w-full bg-[linear-gradient(225deg,#CAA650,#F4E4A8)] text-white py-4 rounded-full text-lg font-semibold hover:bg-[#E4A43B] transition-colors"
          >
            Send Code
          </button>
        </form>
      </div>
    </div>
  );
}
