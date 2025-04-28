import React from "react";
import { Sheet } from "react-modal-sheet";
import {
  X,
  Moon,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Lock,
} from "lucide-react";
import { Policy, Restaurant, CartState, BundleItem } from "@/types";
import { DrinkItem } from "@/components/menu_items";
import { titleCase } from "title-case";
import { formatPoints } from "@/utils/parse";
import { PolicyDescriptionDisplay } from "@/components/display_utils/policy_description_display";
import { getMissingItemsForPolicy } from "@/utils/item_recommender";
import { PolicyManager } from "@/utils/policy_manager";
import { DRINK_CHECKOUT_PATH, LOYALTY_REWARD_TAG } from "@/constants";
import { useNavigate } from "react-router-dom";
import { ItemUtils } from "@/utils/item_utils";
import { adjustColor } from "@/utils/color";
import { useAuth } from "@/context/auth_context";
import { SignInButton } from "../signin/signin_button";
import { PolicyUtils } from "@/utils/policy_utils";
interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy;
  restaurant: Restaurant;
  addPolicy: (bundle_id: string | null, policy: Policy) => void;
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
  addToCart,
  removeFromCart,
}) => {
  const { userSession } = useAuth();
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
  const navigate = useNavigate();
  const bundleObject = bundle_id
    ? (ItemUtils.getMenuItemFromItemId(bundle_id, restaurant) as BundleItem)
        .object
    : null;
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[policy.definition.tag === LOYALTY_REWARD_TAG ? 0.6 : 0.9, 0]}
      initialSnap={0}
      tweenConfig={{
        duration: 0.2,
        ease: [0.4, 0, 0.6, 1],
      }}
    >
      <Sheet.Container className="rounded-t-3xl">
        <Sheet.Content>
          <div className="relative h-full flex flex-col mt-2">
            <div className="flex-1 overflow-y-auto p-6 pb-24">
              <button
                onClick={onClose}
                className="text-gray-500 bg-gray-200 rounded-full p-2 float-right"
              >
                <X size={20} />
              </button>

              <div>
                <h2 className="text-2xl font-bold pr-14 break-words">
                  {policy.definition.tag === LOYALTY_REWARD_TAG
                    ? `${titleCase(
                        ItemUtils.getMenuItemFromItemId(
                          policy.definition.action.items[0],
                          restaurant
                        )?.name || ""
                      )} for ${formatPoints(
                        policy.definition.action.amount
                      )} points!`
                    : titleCase(policy.name || "")}
                </h2>

                <div className="flex flex-wrap gap-2 mt-4 mb-4">
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

                  {policy.begin_time && policy.end_time && (
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
                      <span className="font-medium text-xs">
                        Counts As Deal
                      </span>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xl  text-black whitespace-normal break-words">
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
                        ).map((itemId, itemIndex) => {
                          return (
                            <DrinkItem
                              key={itemId}
                              cart={state.cart}
                              restaurant={restaurant}
                              addToCart={addToCart}
                              removeFromCart={removeFromCart}
                              itemId={itemId}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle size={20} />
                      <span className="font-medium">
                        {policyIsActive
                          ? "This deal is already active in your cart."
                          : "You're ready to add this deal."}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 bg-[rgba(255,255,255,0.9)] py-3 px-4 border-t rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)]">
              {userSession ? (
                <button
                  className="w-full text-white py-3 rounded-full flex items-center justify-center gap-2"
                  style={{
                    background:
                      hasMissingItems && !policyIsActive
                        ? "#969292"
                        : restaurant?.metadata.primaryColor
                        ? `linear-gradient(45deg, 
          ${adjustColor(restaurant.metadata.primaryColor as string, -30)},
          ${adjustColor(restaurant.metadata.primaryColor as string, 40)}
        )`
                        : undefined,
                  }}
                  onClick={async () => {
                    if (policyIsActive) {
                      navigate(
                        DRINK_CHECKOUT_PATH.replace(":id", restaurant.id)
                      );
                    } else if (!hasMissingItems) {
                      addPolicy(bundle_id, policy);
                    }
                  }}
                >
                  <ShoppingCart size={18} />
                  {policyIsActive ? "Go to Checkout" : "Add to Cart"}
                </button>
              ) : (
                <SignInButton onClose={onClose} />
              )}
            </div>
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
};

export default PolicyModal;
