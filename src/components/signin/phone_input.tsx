import React, { useState } from "react";
import { ChevronDown, QrCode } from "lucide-react";

export function PhoneInput({
  onSubmit,
  onClose,
}: {
  onSubmit: (phone: string) => void;
  onClose: () => void;
}) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(phoneNumber);
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
            <div className="flex items-center bg-[#FFFFFF] rounded-xl p-4 border border-[#F5B14C]">
              <div className="flex items-center gap-2 pr-3 border-r border-gray-600">
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAABmJLR0QA/wD/AP+gvaeTAAAA50lEQVRIie3WMQ6CMRQG4B8TB2/gIcTVG+jkETyFMTExunoWJyfv4eAF3JwcXGBQByeeSUhoGgptGejwJ09I0/Z7/0BeA/+WM1QnVnmCU5RHuEWHD3xzPEeHt5YbvEeHn1tu8YwGl+jwDg8NnqLDB7y2eMB9dHiPpxbvsMUcmwT4BjfYxL6Td7jFY+qbzrBKhK/xkPqmU6wT4Bs8pr7pBJsE+Br3qW86xjYBvsZd6puO8JIA3+Ih9U2H2CXAnxLhu9Q3HeBc7v/6G3yR+qYDXEWG/0Uq3P0C/JtZZIafM8PzM8PPM8PPvgAHQElZXVw6lQAAAABJRU5ErkJggg=="
                  alt="US flag"
                  className="w-6 h-4"
                />
                <span>+1</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 bg-transparent ml-3 outline-none placeholder-gray-600"
                placeholder="(409) 487-1935"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#F5B14C] text-black py-4 rounded-full text-lg font-medium hover:bg-[#E4A43B] transition-colors"
          >
            Continue
          </button>
        </form>

        <div className="absolute bottom-12 left-0 right-0 text-center">
          <button onClick={onClose} className="text-gray-600 underline">
            Browse as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
