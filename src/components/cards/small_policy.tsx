import type React from "react";
import { BadgeCheck, Check, Plus, Tag, Ticket } from "lucide-react";
import { Bundle, Cart, DealEffectPayload, Policy } from "@/types";
import { Restaurant } from "@/types";
import { truncate } from "fs/promises";
import { getPolicyFlair, sentenceCase } from "@/utils/parse";
import { titleCase } from "title-case";
import { getMissingItemsForPolicy } from "@/utils/item_recommender";
import { GradientIcon } from "@/utils/gradient";
import { PolicyManager } from "@/utils/policy_manager";
import { BUNDLE_MENU_TAG, MY_SPOT_PATH } from "@/constants";
import { useNavigate } from "react-router-dom";
import { BundleUtils } from "@/utils/bundle_utils";
import { useRestaurant } from "@/context/restaurant_context";
import { toast } from "react-toastify";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { PolicyUtils } from "@/utils/policy_utils";
interface DealCardProps {
  cart: Cart;
  policy: Policy;
  restaurant: Restaurant;
  dealEffect: DealEffectPayload;
}

const DealCard: React.FC<DealCardProps> = ({
  cart,
  policy,
  restaurant,
  dealEffect,
}) => {
  const { userOwnershipMap } = useRestaurant();
  const { handlePolicyClick } = useBottomSheet();
  const policyIsActive = PolicyManager.getActivePolicyIds(dealEffect).has(
    policy.policy_id
  );
  const missingItems = getMissingItemsForPolicy(
    policy,
    cart,
    restaurant,
    dealEffect
  );
  const flair = PolicyUtils.getPolicyFlair(policy);
  const totalMissingQuantity = missingItems.reduce(
    (sum, item) => sum + item.quantityNeeded,
    0
  );
  const missingItemsText =
    totalMissingQuantity > 0
      ? `Add ${totalMissingQuantity} ${
          totalMissingQuantity === 1 ? "item" : "items"
        } to get ${flair}`
      : "";

  return (
    <div
      className="flex-shrink-0 w-80"
      onClick={() => {
        handlePolicyClick(policy, userOwnershipMap);
      }}
    >
      <div className="mx-auto w-full px-2 sm:px-4 sm:max-w-sm md:max-w-md">
        <div className="bg-white rounded-xl p-4  border border-gray-400 flex flex-col">
          {policy.locked ? (
            <div className="self-start mb-2">
              <div className="bg-white/70 text-black text-xs font-medium px-3 py-2 rounded-full flex items-center gap-1 border border-gray-300">
                <img
                  src="/tapin_icon_black.png"
                  alt="Tap In Icon"
                  className="w-4 h-4"
                />
                <span>Requires Bundle</span>
              </div>
            </div>
          ) : (
            <div className="self-start mb-2">
              <div className="bg-white/70 text-black text-xs font-medium px-3 py-2 rounded-full flex items-center gap-1 border border-gray-300">
                <span>Open to All</span>
              </div>
            </div>
          )}
          {/* Title Row */}
          <div className="flex items-center gap-2 mb-1">
            <GradientIcon
              icon={Tag}
              primaryColor={restaurant?.metadata.primaryColor as string}
              size={20}
            />
            <h3 className="text-lg font-bold text-gray-800 truncate">
              {titleCase(policy.name)}
            </h3>
          </div>

          <p
            className={`text-sm ${
              !policyIsActive && totalMissingQuantity > 0
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {policyIsActive
              ? `Deal Applied`
              : totalMissingQuantity > 0
              ? missingItemsText
              : `Apply to cart for ${flair}`}
          </p>

          {/* Button Row */}
          <div className="flex justify-between items-start mt-1 min-h-10">
            <p className="whitespace-normal text-sm text-gray-500 max-w-[80%] line-clamp-2 overflow-hidden text-ellipsis">
              {sentenceCase(policy.header ?? "")}
            </p>
            <button
              className="text-white p-1 rounded-full text-sm font-medium transition-colors ml-2 whitespace-nowrap"
              style={{
                backgroundColor: restaurant?.metadata.primaryColor || undefined,
              }}
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
