"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Gift } from "lucide-react";

const RewardsComponent = () => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const currentPoints = 740;
  const nextRewardThreshold = 1000;
  const pointsUntilNextReward = nextRewardThreshold - currentPoints;
  const progressPercentage = (currentPoints / nextRewardThreshold) * 100;

  // Using the provided image URL for all rewards
  const drinkImageUrl =
    "https://s-sdistributing.com/wp-content/uploads/Bud-Light-2.png";

  const rewards = [
    { points: 200, description: "Drink", imageUrl: drinkImageUrl },
    {
      points: 400,
      description: "Free 6 shots of tequila",
      imageUrl: drinkImageUrl,
    },
    {
      points: 800,
      description: "Customize your drink",
      imageUrl: drinkImageUrl,
    },
  ];

  const toggleOptions = () => {
    setIsOptionsOpen(!isOptionsOpen);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-6 font-sans">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Rewards</h2>
        <button
          onClick={toggleOptions}
          className="flex items-center text-red-500 font-medium"
        >
          Reward Options{" "}
          {isOptionsOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-5xl font-bold text-red-500 mb-1">
          {currentPoints} Points
        </h1>
        <p className="text-gray-700">
          {pointsUntilNextReward} points until your next reward
        </p>
      </div>

      <div className="mb-8">
        <div className="relative h-3 bg-gray-200 rounded-full mb-2">
          <div
            className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute -right-3 -top-1.5 w-6 h-6 bg-red-500 rounded-full border-2 border-white"></div>
          </div>

          {/* Milestone markers */}
          <div className="absolute top-0 left-[20%] w-1 h-3 bg-white"></div>
          <div className="absolute top-0 left-[40%] w-1 h-3 bg-white"></div>
          <div className="absolute top-0 left-[60%] w-1 h-3 bg-white"></div>
          <div className="absolute top-0 left-[80%] w-1 h-3 bg-white flex items-center justify-center">
            <div className="absolute -top-1 -ml-3 text-white">
              <Gift size={16} className="text-gray-300" />
            </div>
          </div>
        </div>

        <div className="flex justify-between text-gray-600 text-sm">
          <span>200</span>
          <span>400</span>
          <span>600</span>
          <span>800</span>
          <span>1000</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-gray-800 font-medium mb-4">Rewards you can get</h3>
        <div className="space-y-4">
          {rewards.map((reward) => (
            <div key={reward.points} className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={reward.imageUrl || "/placeholder.svg"}
                  alt={reward.description}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="ml-4 font-medium text-gray-800">
                {reward.points}
              </div>
              <div className="ml-8 text-gray-700">{reward.description}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-md transition-colors">
        Redeem Rewards
      </button>
    </div>
  );
};

export default RewardsComponent;
