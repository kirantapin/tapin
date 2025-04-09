import React from "react";
import { Sheet } from "react-modal-sheet";
import { X, Moon, ShoppingCart, AlertCircle } from "lucide-react";
import { Policy, Restaurant, Cart, SingleMenuItem } from "@/types";
import { DrinkItem } from "@/components/menu_items";
import { project_url } from "@/utils/supabase_client";
import { titleCase } from "title-case";
import {
  convertUtcToLocal,
  getItemName,
  getPolicyFlair,
  isPassItem,
  sentenceCase,
} from "@/utils/parse";
import { PolicyDescriptionDisplay } from "@/components/display_utils/policy_description_display";
import { getMissingItemsForPolicy } from "@/utils/item_recommender";
import { getMenuItemFromPath } from "@/utils/pricer";
import { motion } from "framer-motion";
import { PolicyManager } from "@/utils/policy_manager";
import { DRINK_CHECKOUT_PATH } from "@/constants";
import { useNavigate } from "react-router-dom";

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy;
  restaurant: Restaurant;
  onAddToCart: (policy: Policy) => void;
  state;
  addToCart: (item: any) => void;
  removeFromCart: (itemId: number, updates: any) => void;
}

const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  policy,
  restaurant,
  onAddToCart,
  state,
  addToCart,
  removeFromCart,
}) => {
  const missingItemsResults = getMissingItemsForPolicy(policy, state.cart);
  const hasMissingItems = missingItemsResults.length > 0;
  const policyIsActive = PolicyManager.getActivePolicyIds(state.dealEffect).has(
    policy.policy_id
  );
  const navigate = useNavigate();
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.9, 0]}
      initialSnap={0}
    >
      <Sheet.Container className="rounded-t-3xl max-h-[90vh]">
        <Sheet.Content>
          <div className="p-6 relative h-full overflow-y-auto">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-gray-500 hover:text-black bg-gray-100 rounded-full p-2"
            >
              <X size={20} />
            </button>

            {/* Image with Deal Tag */}

            {/* Deal Info */}
            <h2 className="text-2xl font-bold">
              {titleCase(policy.name || "")}
            </h2>
            <div className="relative mb-4 mt-2 bg-black/70 text-white px-3 py-1 rounded-full w-fit">
              <div className="flex items-center gap-2">
                <Moon size={16} className="text-yellow-400" />
                <span className="font-medium text-sm">
                  {getPolicyFlair(policy)}
                </span>
              </div>
            </div>

            <p className=" mt-3 text-xl font-bold text-black">
              {sentenceCase(policy.header || "")}
            </p>

            <div className="flex items-center mt-4 text-gray-500">
              <PolicyDescriptionDisplay policy={policy} />
            </div>

            {/* Time Details */}
            <div className="flex items-center mt-4 text-gray-500">
              <div>
                {policy.begin_time && policy.end_time ? (
                  <span>
                    {convertUtcToLocal(policy.begin_time)} -{" "}
                    {convertUtcToLocal(policy.end_time)}
                  </span>
                ) : (
                  "Anytime"
                )}

                {!policy.count_as_deal && (
                  <div>
                    <span className="mx-2">•</span>
                    <span>Unlimited</span>
                  </div>
                )}
              </div>
            </div>

            {/* Subscription Tag */}
            <div className="mt-2">
              {policy.subscription_id ? (
                <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm">
                  Subscription Needed
                </span>
              ) : (
                <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm">
                  Open to All
                </span>
              )}
            </div>

            {/* Missing Items Alert with Add to Cart functionality */}
            {hasMissingItems ? (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-1">
                <div className="flex items-center gap-2 text-amber-700 mb-2">
                  <AlertCircle size={20} />
                  <span className="font-medium">
                    Add these items to qualify:
                  </span>
                </div>
                {missingItemsResults.map((result, index) => (
                  <div key={index} className="mt-2">
                    {result.missingItems.map((itemPath, itemIndex) => {
                      const menuItem = getMenuItemFromPath(
                        itemPath,
                        restaurant
                      );
                      if (!menuItem) return null;

                      return (
                        <DrinkItem
                          key={`${index}-${itemIndex}`}
                          cart={state.cart}
                          restaurant={restaurant}
                          name={getItemName(itemPath)}
                          addToCart={addToCart}
                          removeFromCart={removeFromCart}
                          drinkPath={itemPath}
                          primaryColor={
                            restaurant.metadata.primaryColor as string
                          }
                        />
                      );
                    })}
                    <p className="text-amber-600 text-sm mt-1 ml-2">
                      Need {result.quantityNeeded} more of the above
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <span className="font-medium">
                    {policyIsActive
                      ? "This deal is already active in your cart."
                      : "All conditions met! You're ready to add this deal."}
                  </span>
                </div>
              </div>
            )}

            {/* Buttons Container */}
            <div className="fixed bottom-4 left-4 right-4 flex flex-col gap-2">
              {/* Add All Items Button - Only show when there are missing items */}
              <motion.div
                animate={{ height: hasMissingItems ? "auto" : 0 }}
                initial={false}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <button
                  className="w-full text-white py-3 rounded-full flex items-center justify-center gap-2 mb-2"
                  style={{
                    backgroundColor: restaurant?.metadata
                      .primaryColor as string,
                  }}
                  onClick={async () => {
                    // Add all missing items
                    missingItemsResults.forEach(async (result) => {
                      const addItemPromises: Promise<void>[] = [];
                      // For each quantity needed
                      for (let i = 0; i < result.quantityNeeded; i++) {
                        // Add one of the acceptable items
                        const itemPath =
                          result.missingItems[i % result.missingItems.length];
                        if (isPassItem(itemPath)) {
                          const menuItem = getMenuItemFromPath(
                            itemPath,
                            restaurant
                          );
                          if (menuItem) {
                            itemPath.push(menuItem.for_date);
                          } else {
                            continue;
                          }
                        }
                        addItemPromises.push(
                          addToCart({
                            path: itemPath,
                            modifiers: [],
                          })
                        );
                      }
                      await Promise.all(addItemPromises);
                      onAddToCart(policy);
                    });
                  }}
                >
                  <ShoppingCart size={18} />
                  Add All Items & Apply Deal
                </button>
              </motion.div>

              {/* Regular Add to Cart Button */}
              <button
                className="w-full text-white py-3 rounded-full flex items-center justify-center gap-2"
                style={{
                  backgroundColor: hasMissingItems
                    ? "#9CA3AF"
                    : (restaurant?.metadata.primaryColor as string),
                }}
                onClick={() => {
                  if (policyIsActive) {
                    navigate(DRINK_CHECKOUT_PATH.replace(":id", restaurant.id));
                  } else if (!hasMissingItems) {
                    onAddToCart(policy);
                  }
                }}
                disabled={hasMissingItems}
              >
                <ShoppingCart size={18} />
                {policyIsActive ? "Go to Checkout" : "Add to Cart"}
              </button>
            </div>
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
};

export default PolicyModal;
