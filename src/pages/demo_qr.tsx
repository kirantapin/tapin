import React, { useState } from "react";
import { ArrowLeft, QrCode, X } from "lucide-react";

export default function DemoQR({
  onBack,
  onSkip,
}: {
  onBack: () => void;
  onSkip: () => void;
}) {
  const [codeEntered, setCodeEntered] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically validate the code and proceed accordingly
    console.log("Code submitted:", codeEntered);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={onSkip}
          className="text-[#F5B14C] hover:text-[#E4A43B] transition-colors"
        >
          Redeem Later
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-4">Scan QR Code</h1>
      <p className="text-xl text-gray-300 mb-8">
        Scan the QR code at the restaurant to check in and unlock offers.
      </p>

      <div className="aspect-square w-full max-w-xs mx-auto bg-white flex items-center justify-center mb-8 rounded-xl">
        <QrCode className="w-32 h-32 text-black" />
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <label htmlFor="qr-code" className="block text-lg mb-2">
          Or enter code manually
        </label>
        <div className="relative">
          <input
            id="qr-code"
            type="text"
            value={codeEntered}
            onChange={(e) => setCodeEntered(e.target.value)}
            className="w-full bg-[#2A2F45] rounded-xl p-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5B14C]"
            placeholder="Enter QR code"
          />
          {codeEntered && (
            <button
              type="button"
              onClick={() => setCodeEntered("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-[#F5B14C] text-black py-4 rounded-full text-lg font-medium mt-4 hover:bg-[#E4A43B] transition-colors"
        >
          Submit Code
        </button>
      </form>

      <p className="text-center text-gray-400">
        Having trouble? Ask a staff member for assistance.
      </p>
    </div>
  );
}
