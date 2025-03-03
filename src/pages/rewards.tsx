import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Custom Cocktail Icon (Replace with actual Lucide icon if available)
const CocktailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="w-8 h-8 text-yellow-500"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 6.75 12 10.5m0 0 3.75-3.75m-3.75 3.75V18m0 4.5h7.5m-15 0h7.5m6.75-18-7.5 7.5m0 0-7.5-7.5m15 0H3.75"
    />
  </svg>
);

const RewardsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-sm mx-auto min-h-screen bg-white p-4 relative">
      {/* Back Button */}
      <button
        className="absolute top-4 left-4 text-gray-600"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={24} />
      </button>

      {/* Title Section */}
      <div className="text-center mt-10">
        <h2 className="text-4xl font-bold text-gray-900 leading-tight">
          You have
        </h2>
        <h2 className="text-4xl font-bold text-red-600 leading-tight">
          740 Points
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          Choose a perk—we'll automatically apply your reward when you scan this
          at our restaurant.
        </p>
      </div>

      {/* Points Progress Bar */}
      <div className="mt-6 mx-4">
        <div className="relative w-full h-2 bg-gray-200 rounded-full">
          <div
            className="absolute top-0 left-0 h-2 bg-red-500 rounded-full"
            style={{ width: "74%" }}
          ></div>
          <div className="absolute top-1/2 left-[74%] transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
        </div>
        <div className="flex justify-between text-gray-500 text-xs mt-1">
          <span>200</span>
          <span>400</span>
          <span>600</span>
          <span>800</span>
          <span>1000</span>
        </div>
      </div>

      {/* Reward Items */}
      <div className="mt-6 space-y-4">
        {[1, 2].map((_, index) => (
          <div
            key={index}
            className="bg-gray-100 p-4 rounded-lg flex justify-between items-center"
          >
            <div className="flex items-center space-x-4">
              <CocktailIcon />
              <div>
                <p className="text-gray-700 font-semibold">Drinks</p>
                <p className="text-red-600 font-bold">400 Points</p>
              </div>
            </div>
            <button className="bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">
              Redeem
            </button>
          </div>
        ))}
      </div>

      {/* Make a Drink Button */}
      <div className="fixed bottom-4 left-0 right-0 px-4">
        <button className="bg-red-600 text-white w-full py-3 rounded-lg flex items-center justify-center space-x-2 text-lg font-semibold">
          <CocktailIcon />
          <span>Make A Drink</span>
        </button>
      </div>

      {/* Floating Profile Image */}
    </div>
  );
};

export default RewardsPage;
