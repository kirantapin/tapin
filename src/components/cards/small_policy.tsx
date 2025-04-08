import type React from "react";
import { BadgeCheck, Check, Plus, Ticket } from "lucide-react";
import { Policy } from "@/types";
import { Restaurant } from "@/types";
import { truncate } from "fs/promises";
import { sentenceCase } from "@/utils/parse";
import { titleCase } from "title-case";

interface DealCardProps {
  policy: Policy;
  restaurant: Restaurant;
  setPolicy: (policy: Policy) => void;
  setIsOpen: (isOpen: boolean) => void;
}

const DealCard: React.FC<DealCardProps> = ({
  policy,
  restaurant,
  setPolicy,
  setIsOpen,
}) => {
  return (
    <div
      className="flex-shrink-0 w-80"
      onClick={() => {
        setPolicy(policy);
        setIsOpen(true);
      }}
    >
      <div className="mx-auto w-full px-2 sm:px-4 sm:max-w-sm md:max-w-md">
        <div className="bg-white rounded-xl p-4  border border-gray-300 flex flex-col">
          {false && (
            <div className="self-start mb-2">
              <div className="bg-gray-700 text-amber-300 text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 border border-amber-300">
                <BadgeCheck size={14} className="text-amber-300" />
                <span>Bar Members Only</span>
              </div>
            </div>
          )}

          {/* Title Row */}
          <div className="flex items-center gap-2 mb-1">
            <Ticket size={20} className="text-gray-800" />
            <h3 className="text-lg font-bold text-gray-800">
              {titleCase(policy.name)}
            </h3>
          </div>

          {/* Button Row */}
          <div className="flex justify-between items-center mt-1">
            <p className=" whitespace-normal text-sm text-gray-500 max-w-[80%] line-clamp-2 overflow-hidden text-ellipsis">
              {sentenceCase(policy.header)}
            </p>
            <button
              className="text-white p-1 rounded-full text-sm font-medium transition-colors ml-2 whitespace-nowrap"
              style={{ backgroundColor: restaurant?.metadata.primaryColor }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealCard;
