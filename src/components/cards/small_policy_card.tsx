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
}

const SmallPolicyCard: React.FC<SmallPolicyCardProps> = ({
  policy,
  restaurant,
  button = true,
}) => {
  const { userOwnershipMap } = useRestaurant();
  const { handlePolicyClick } = useBottomSheet();
  const flair = PolicyUtils.getPolicyFlair(policy);
  const primaryColor = restaurant.metadata.primaryColor as string;

  return (
    <div
      className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm"
      onClick={() => {
        handlePolicyClick(policy, userOwnershipMap);
      }}
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
  );
};

export default SmallPolicyCard;
