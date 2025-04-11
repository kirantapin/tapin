import React from "react";
import { Sheet } from "react-modal-sheet";
import { X, Moon, ShoppingCart, AlertCircle, CheckCircle } from "lucide-react";
import { Policy, Restaurant, Cart, SingleMenuItem } from "@/types";
import { DrinkItem } from "@/components/menu_items";
import { project_url } from "@/utils/supabase_client";
import { titleCase } from "title-case";
import { convertUtcToLocal, getPolicyFlair, sentenceCase } from "@/utils/parse";
import { PolicyDescriptionDisplay } from "@/components/display_utils/policy_description_display";
import { getMissingItemsForPolicy } from "@/utils/item_recommender";
import { motion } from "framer-motion";
import { PolicyManager } from "@/utils/policy_manager";
import { DRINK_CHECKOUT_PATH } from "@/constants";
import { useNavigate } from "react-router-dom";
import { ItemUtils } from "@/utils/item_utils";
import { adjustColor } from "@/utils/color";

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
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.9, 0]}
      initialSnap={0}
      tweenConfig={{
        duration: 0.8,
        ease: [0.85, 0, 0.15, 1], // cubic‑bezier curve
      }}
    >
      <Sheet.Container className="rounded-t-3xl">
        <Sheet.Content>
          <div className="relative h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 pb-40">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-gray-500 hover:text-black bg-gray-100 rounded-full p-2 z-10"
              >
                <X size={20} />
              </button>

              <div>
                <h2 className="text-2xl font-bold pr-14 break-words">
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

                <p className="mt-3 text-xl  text-black whitespace-normal break-words">
                  {sentenceCase(policy.header || "")}
                </p>

                <div className="flex items-center mt-4 text-gray-500">
                  <PolicyDescriptionDisplay
                    policy={policy}
                    restaurant={restaurant}
                  />
                </div>

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
                              key={`${index}-${itemIndex}`}
                              cart={state.cart}
                              restaurant={restaurant}
                              addToCart={addToCart}
                              removeFromCart={removeFromCart}
                              itemId={itemId}
                              primaryColor={
                                restaurant.metadata.primaryColor as string
                              }
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
                          : "All conditions met! You're ready to add this deal."}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 bg-white py-3 px-4 border-t rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)]">
              <motion.div
                animate={{
                  height: !policyIsActive && hasMissingItems ? "auto" : 0,
                }}
                initial={false}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <button
                  className="w-full text-white py-3 rounded-full flex items-center justify-center gap-2 mb-2"
                  style={{
                    background: restaurant?.metadata.primaryColor
                      ? `linear-gradient(45deg, 
          ${adjustColor(restaurant.metadata.primaryColor as string, -30)},
          ${adjustColor(restaurant.metadata.primaryColor as string, 40)}
        )`
                      : undefined,
                  }}
                  onClick={async () => {
                    missingItemsResults.forEach(async (result) => {
                      const addItemPromises: Promise<void>[] = [];
                      const itemIds =
                        ItemUtils.policyItemSpecificationsToItemIds(
                          result.missingItems,
                          restaurant
                        );
                      for (let i = 0; i < result.quantityNeeded; i++) {
                        let itemId = itemIds[i % itemIds.length];
                        addItemPromises.push(
                          addToCart({
                            id: itemId,
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

              <button
                className="w-full text-white py-3 rounded-full flex items-center justify-center gap-2"
                style={{
                  background: restaurant?.metadata.primaryColor
                    ? `linear-gradient(45deg, 
        ${adjustColor(restaurant.metadata.primaryColor as string, -30)},
        ${adjustColor(restaurant.metadata.primaryColor as string, 40)}
      )`
                    : undefined,
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
