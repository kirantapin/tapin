import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  X,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Lock,
} from "lucide-react";
import { Policy, Restaurant, CartState, BundleItem } from "@/types";
import { DrinkItem, SingleSelectionItem } from "@/components/menu_items";
import { titleCase } from "title-case";
import { PolicyDescriptionDisplay } from "@/components/display_utils/policy_description_display";
import { getMissingItemsForPolicy } from "@/utils/item_recommender";
import { PolicyManager } from "@/utils/policy_manager";
import { DRINK_CHECKOUT_PATH, LOYALTY_REWARD_TAG } from "@/constants";
import { useNavigate } from "react-router-dom";
import { ItemUtils } from "@/utils/item_utils";
import { adjustColor } from "@/utils/color";
import { useAuth } from "@/context/auth_context";
import { SignInButton } from "../signin/signin_button";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { PolicyUtils } from "@/utils/policy_utils";

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy;
  restaurant: Restaurant;
  addPolicy: (
    bundle_id: string | null,
    policy_id: string,
    userPreference: string | null
  ) => void;
  state: CartState;
  addToCart: (item: any) => void;
  removeFromCart: (itemId: number, updates: any) => void;
  bundle_id: string | null;
}

const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  bundle_id,
  policy,
  restaurant,
  addPolicy,
  state,
}) => {
  const { userSession } = useAuth();
  const { addToCart, removeFromCart } = useBottomSheet();
  const [userPreference, setUserPreference] = useState<string | null>(null);
  const missingItemsResults = getMissingItemsForPolicy(
    policy,
    state.cart,
    restaurant,
    state.dealEffect
  );
  const hasMissingItems = missingItemsResults.length > 0;
  const policyIsActive = PolicyManager.getActivePolicyIds(state.dealEffect).has(
    policy.policy_id
  );
  const userChoices = PolicyUtils.getUserChoicesForPolicy(policy, restaurant);
  const navigate = useNavigate();
  const bundleObject = bundle_id
    ? (ItemUtils.getMenuItemFromItemId(bundle_id, restaurant) as BundleItem)
        .object
    : null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-3xl [&>button]:hidden p-0 flex flex-col"
      >
        <SheetHeader className="flex-none px-6 pt-6 pb-4 border-b">
          <div className="flex justify-between items-start">
            <SheetTitle className="text-2xl font-bold pr-3 break-words text-left">
              {PolicyUtils.getPolicyName(policy, restaurant)}
            </SheetTitle>
            <button
              onClick={onClose}
              className="text-gray-500 bg-gray-200 rounded-full p-2"
            >
              <X size={20} />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto pb-28">
          <div className="px-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {bundleObject && policy.locked && (
                <div className="bg-black/70 text-white text-xs font-medium px-3 py-2 rounded-full flex items-center gap-1 border border-[#d4af37]">
                  <img
                    src="/tapin_icon_white.png"
                    alt="Tap In Icon"
                    className="w-4 h-4"
                  />
                  <span>{bundleObject.name}</span>
                </div>
              )}

              {policy.end_time && (
                <div
                  className="relative text-white px-3 py-2 rounded-full flex items-center gap-1"
                  style={{
                    background: `linear-gradient(225deg, ${adjustColor(
                      restaurant?.metadata.primaryColor as string,
                      -30
                    )}, ${adjustColor(
                      restaurant?.metadata.primaryColor as string,
                      40
                    )})`,
                  }}
                >
                  <Clock size={16} />
                  <span className="font-medium text-xs">
                    Limited Time Offer
                  </span>
                </div>
              )}

              <div
                className="relative text-white px-3 py-2 rounded-full flex items-center gap-1"
                style={{
                  background: `linear-gradient(225deg, ${adjustColor(
                    restaurant?.metadata.primaryColor as string,
                    -30
                  )}, ${adjustColor(
                    restaurant?.metadata.primaryColor as string,
                    40
                  )})`,
                }}
              >
                <span className="font-medium text-xs">
                  {policy.total_usages
                    ? `${policy.total_usages} Uses`
                    : "Unlimited Uses"}
                </span>
              </div>

              {policy.days_since_last_use && (
                <div
                  className="relative text-white px-3 py-2 rounded-full flex items-center gap-1"
                  style={{
                    background: `linear-gradient(225deg, ${adjustColor(
                      restaurant?.metadata.primaryColor as string,
                      -30
                    )}, ${adjustColor(
                      restaurant?.metadata.primaryColor as string,
                      40
                    )})`,
                  }}
                >
                  <RefreshCw size={16} />
                  <span className="font-medium text-xs">
                    {policy.days_since_last_use} Day Between Uses
                  </span>
                </div>
              )}

              {policy.count_as_deal && (
                <div
                  className="relative text-white px-3 py-2 rounded-full flex items-center gap-1"
                  style={{
                    background: `linear-gradient(225deg, ${adjustColor(
                      restaurant?.metadata.primaryColor as string,
                      -30
                    )}, ${adjustColor(
                      restaurant?.metadata.primaryColor as string,
                      40
                    )})`,
                  }}
                >
                  <Lock size={16} />
                  <span className="font-medium text-xs">Counts As Deal</span>
                </div>
              )}
            </div>

            <p className="text-xl text-black whitespace-normal break-words">
              {titleCase(policy.header || "")}
            </p>

            <div className="flex items-center mt-4 text-gray-500">
              <PolicyDescriptionDisplay
                policy={policy}
                restaurant={restaurant}
              />
            </div>

            {!policyIsActive && hasMissingItems ? (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-1">
                {missingItemsResults.map((result, index) => (
                  <div key={index} className="mt-2">
                    <div className="flex items-center gap-2 text-amber-700 ml-3 mb-2">
                      <AlertCircle size={20} />
                      <span className="font-medium">
                        Add {result.quantityNeeded} more from any of the
                        following:
                      </span>
                    </div>
                    {ItemUtils.policyItemSpecificationsToItemIds(
                      result.missingItems,
                      restaurant
                    ).map((itemId) => (
                      <DrinkItem
                        key={itemId}
                        cart={state.cart}
                        restaurant={restaurant}
                        addToCart={addToCart}
                        removeFromCart={removeFromCart}
                        item={{ id: itemId, modifiers: [] }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-1">
                <div>
                  <div className="flex items-center gap-2 text-green-700 p-3">
                    <CheckCircle size={20} />
                    <span className="font-medium">
                      {policyIsActive
                        ? "This deal is active in your cart."
                        : `You're ready to add this deal.${
                            userChoices.length > 1 ? ` ` : ""
                          }`}
                      {userChoices.length > 1 && (
                        <span className="font-bold">
                          Select your preferred item.
                        </span>
                      )}
                    </span>
                  </div>
                  {!policyIsActive &&
                    userChoices.length > 1 &&
                    userChoices.map((itemId) => (
                      <SingleSelectionItem
                        key={itemId}
                        restaurant={restaurant}
                        item={{ id: itemId, modifiers: [] }}
                        selected={userPreference === itemId}
                        onSelect={() => {
                          setUserPreference(itemId);
                        }}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t fixed bottom-0 left-0 right-0 px-6 pb-4 bg-white">
          {userSession ? (
            <button
              className="w-full text-white py-3 rounded-full flex items-center justify-center gap-2"
              style={{
                backgroundColor:
                  (hasMissingItems && !policyIsActive) ||
                  (userChoices.length > 1 && !userPreference)
                    ? "#969292"
                    : (restaurant?.metadata.primaryColor as string),
              }}
              onClick={async () => {
                if (policyIsActive) {
                  navigate(DRINK_CHECKOUT_PATH.replace(":id", restaurant.id));
                } else if (!hasMissingItems) {
                  await addPolicy(bundle_id, policy.policy_id, userPreference);
                }
                onClose();
              }}
              disabled={
                (userChoices.length > 1 && !userPreference) ||
                (hasMissingItems && !policyIsActive)
              }
            >
              <ShoppingCart size={18} />
              {policyIsActive ? "Go to Checkout" : "Add to Cart"}
            </button>
          ) : (
            <SignInButton
              onClose={onClose}
              primaryColor={restaurant?.metadata.primaryColor as string}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PolicyModal;
