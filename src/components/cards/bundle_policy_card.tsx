import React from "react";
import { Tag } from "lucide-react";

interface BundlePolicyCardProps {
  imageUrl: string;
  addItemsText: string;
  title: string;
  subtitle: string;
  usesLeftText: string;
  onRedeem: () => void;
}

export const BundlePolicyCard: React.FC<BundlePolicyCardProps> = ({
  imageUrl,
  addItemsText,
  title,
  subtitle,
  usesLeftText,
  onRedeem,
}) => {
  return (
    <div className="w-full flex justify-center my-4">
      <div className="w-full max-w-screen-md p-5 rounded-2xl bg-white flex items-stretch gap-5 shadow">
        {/* Left Image */}
        <img
          src={imageUrl}
          alt="Deal Icon"
          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
        />

        {/* Center Text and Bottom Row */}
        <div className="flex flex-col justify-between flex-grow h-20">
          <div>
            <p className="text-sm text-yellow-600 font-semibold mb-1">
              {addItemsText}
            </p>
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            </div>
            <p className="text-base text-gray-500 break-words">{subtitle}</p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-base text-gray-700 font-semibold">
              {usesLeftText}
            </p>
            <button
              onClick={onRedeem}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-sm px-6 py-2 rounded-full ml-4"
            >
              Redeem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
