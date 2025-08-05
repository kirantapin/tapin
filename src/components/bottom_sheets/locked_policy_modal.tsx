import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import { Policy, Restaurant, BundleItem } from "@/types";
import { getMissingItemsForPolicy } from "@/utils/item_recommender";
import { PolicyManager } from "@/utils/policy_manager";
import { ItemUtils } from "@/utils/item_utils";
import { useAuth } from "@/context/auth_context";
import { SignInButton } from "../signin/signin_button";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { PolicyUtils } from "@/utils/policy_utils";
import { useRestaurant } from "@/context/restaurant_context";
import CustomIcon from "../svg/custom_icon";
import { ShareButton } from "../buttons/share_button";

interface LockedPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy;
  bundle_id: string;
}

const LockedPolicyModal: React.FC<LockedPolicyModalProps> = ({
  isOpen,
  onClose,
  bundle_id,
  policy,
}) => {
  const { userSession } = useAuth();
  const { restaurant } = useRestaurant();
  const { state, openBundleModal } = useBottomSheet();
  if (!restaurant) {
    return null;
  }
  const policyIsActive = PolicyManager.getActivePolicyIds(state.dealEffect).has(
    policy.policy_id
  );
  const flair = PolicyUtils.getPolicyFlair(policy);
  const missingItems = getMissingItemsForPolicy(
    policy,
    state.cart,
    restaurant,
    state.dealEffect
  );
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="w-full max-w-full h-[40vh] rounded-t-3xl [&>button]:hidden p-0 flex gap-0 flex-col border-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      >
        <div
          className="w-full text-white text-sm font-medium text-center py-1 rounded-t-3xl flex items-center justify-center gap-2"
          style={{
            backgroundColor: restaurant?.metadata.primaryColor,
          }}
        >
          This deal requires a bundle
          <CustomIcon circleColor={"white"} baseColor="white" size={16} />
        </div>
        <SheetHeader className="flex-none px-6 pt-4 pb-0">
          <div className="flex justify-between items-start">
            <SheetTitle className="text-2xl font-bold pr-3 break-words text-left">
              {PolicyUtils.getPolicyName(policy, restaurant)}
            </SheetTitle>
            <button
              onClick={onClose}
              className="text-black bg-gray-200 rounded-full p-2 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
        </SheetHeader>

        {/*Content*/}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-gray-500 text-sm mt-1">{policy.header}</p>
              <p
                className={`text-sm custom-line-clamp-1 ${
                  !policyIsActive && totalMissingQuantity > 0
                    ? "text-red-500"
                    : "text-[#40C4AA]"
                }`}
              >
                {policyIsActive
                  ? `Deal Applied`
                  : totalMissingQuantity > 0
                  ? missingItemsText
                  : `Apply to cart for ${flair}`}
              </p>
            </div>
            <div className="flex-shrink-0 ml-4 mt-3">
              <ShareButton
                objectType="policy"
                object={policy}
                restaurant={restaurant}
              />
            </div>
          </div>
        </div>
        {/*Button*/}
        <div className="mt-2 mb-2 fixed bottom-0 left-0 right-0 px-6 pb-4 bg-white border-t-0">
          <p className="text-xs text-gray-400 mt-2 mb-4 px-2 leading-relaxed">
            The Deal grants access to exclusive perks, discounts, and offers at
            the associated location.{" "}
            <span className="underline cursor-pointer text-gray-500">
              Terms and conditions
            </span>{" "}
            are subject to change without prior notice.
          </p>
          {userSession ? (
            <button
              className="w-full text-white py-3 rounded-full flex items-center justify-center gap-2"
              style={{
                backgroundColor: restaurant?.metadata.primaryColor,
              }}
              onClick={async () => {
                onClose();
                const bundle = ItemUtils.getMenuItemFromItemId(
                  bundle_id,
                  restaurant as Restaurant
                ) as BundleItem;
                openBundleModal(bundle.object);
              }}
            >
              View Bundle
            </button>
          ) : (
            <SignInButton
              onClose={onClose}
              primaryColor={restaurant?.metadata.primaryColor}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LockedPolicyModal;
