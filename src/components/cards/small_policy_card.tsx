import React from "react";
import { Tag } from "lucide-react";
import { Policy, Restaurant } from "@/types";
import { PolicyUtils } from "@/utils/policy_utils";
import CustomIcon from "../svg/custom_icon";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useRestaurant } from "@/context/restaurant_context";

interface SmallPolicyCardProps {
  policy: Policy;
  restaurant: Restaurant;
  button?: boolean;
  bottomTongueText?: string | null;
}

const SmallPolicyCard: React.FC<SmallPolicyCardProps> = ({
  policy,
  restaurant,
  button = true,
  bottomTongueText = null,
}) => {
  const { userOwnershipMap } = useRestaurant();
  const { handlePolicyClick } = useBottomSheet();
  const primaryColor = restaurant.metadata.primaryColor as string;

  return (
    <div className="relative w-full pb-6">
      <div
        className="relative z-10 flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-300 shadow-sm"
        onClick={() => handlePolicyClick(policy, userOwnershipMap)}
      >
        <div className="flex items-center gap-3">
          <Tag className="w-7 h-7 text-black flex-shrink-0" />
          <div className="flex flex-col">
            <h3 className="font-bold text-gray-900 line-clamp-1">
              {PolicyUtils.getPolicyName(policy, restaurant)}
            </h3>
            <span className="flex items-center gap-1 text-sm text-gray-500 max-w-[150px] truncate">
              {policy.locked ? (
                <>
                  Requires Bundle
                  <CustomIcon circleColor={primaryColor} size={12} />
                </>
              ) : (
                <>{policy.header}</>
              )}
            </span>
          </div>
        </div>

        {button && (
          <button
            className="px-4 py-2 text-xs rounded-full ml-1"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="text-white font-semibold">View&nbsp;Details</span>
          </button>
        )}
      </div>
      {bottomTongueText && (
        <div
          className="absolute left-0 bottom-0 w-full z-0 flex justify-center overflow-visible"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="h-[40px] rounded-b-3xl px-4"
            style={{
              backgroundColor: primaryColor,
              width: "100%",
              paddingTop: "20px",
            }}
          >
            <div className="text-center text-xs font-semibold text-white">
              {bottomTongueText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmallPolicyCard;
