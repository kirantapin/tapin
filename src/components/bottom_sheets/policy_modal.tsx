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
import { Policy, Restaurant, BundleItem, Item } from "@/types";
import { DrinkList } from "@/components/menu_items";
import { titleCase } from "title-case";
import { PolicyDescriptionDisplay } from "@/components/display_utils/policy_description_display";
import { getMissingItemsForPolicy } from "@/utils/item_recommender";
import { PolicyManager } from "@/utils/policy_manager";
import { ItemUtils } from "@/utils/item_utils";
import { useAuth } from "@/context/auth_context";
import { SignInButton } from "../signin/signin_button";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { PolicyUtils } from "@/utils/policy_utils";
import CustomIcon from "../svg/custom_icon";
import { ImageFallback } from "../display_utils/image_fallback";
import { ImageUtils } from "@/utils/image_utils";
import { ShareButton } from "../buttons/share_button";

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy;
  bundle_id: string | null;
  restaurant: Restaurant;
}

const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  bundle_id,
  policy,
  restaurant,
}) => {
  const { userSession } = useAuth();
  const { addPolicy, state, openCheckoutModal, openItemModModal } =
    useBottomSheet();
  const [userPreference, setUserPreference] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
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
  const userChoices = PolicyUtils.getPotentialPreferencesForPolicy(
    policy,
    restaurant
  );
  const bundleObject = bundle_id
    ? (ItemUtils.getMenuItemFromItemId(bundle_id, restaurant) as BundleItem)
        .object
    : null;

  const isUsable = PolicyUtils.isPolicyUsable(policy, restaurant);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="w-full max-w-full h-[85vh] rounded-t-3xl [&>button]:hidden p-0 flex flex-col gap-0 border-none outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      >
        <SheetHeader className="flex-none px-6 pt-6 pb-4 border-b">
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

        <div className="flex-1 overflow-y-auto pb-28 pt-4">
          <div className="px-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-wrap gap-2">
                {bundleObject && policy.locked && (
                  <div
                    className="bg-white text-black px-3 py-2 rounded-full flex items-center gap-1 border"
                    style={{
                      borderColor: restaurant?.metadata.primaryColor,
                    }}
                  >
                    <CustomIcon
                      circleColor={restaurant?.metadata.primaryColor}
                      baseColor="black"
                      size={16}
                    />
                    <span className="font-bold text-xs">
                      {bundleObject.name}
                    </span>
                  </div>
                )}

                {policy.end_time && !policy.locked && (
                  <div
                    className="relative text-white px-3 py-2 rounded-full flex items-center gap-1"
                    style={{
                      backgroundColor: restaurant?.metadata.primaryColor,
                    }}
                  >
                    <Clock size={16} />
                    <span className="font-semibold text-xs">
                      Limited Time Offer
                    </span>
                  </div>
                )}

                <div
                  className="relative text-white px-3 py-2 rounded-full flex items-center gap-1"
                  style={{
                    backgroundColor: restaurant?.metadata.primaryColor,
                  }}
                >
                  <span className="font-semibold text-xs">
                    {policy.total_usages
                      ? `${policy.total_usages} Uses`
                      : "Unlimited Uses"}
                  </span>
                </div>

                {policy.days_since_last_use && (
                  <div
                    className="relative text-white px-3 py-2 rounded-full flex items-center gap-1"
                    style={{
                      backgroundColor: restaurant?.metadata.primaryColor,
                    }}
                  >
                    <RefreshCw size={16} />
                    <span className="font-semibold text-xs">
                      {policy.days_since_last_use}{" "}
                      {policy.days_since_last_use === 1 ? "Day" : "Days"}{" "}
                      Between Uses
                    </span>
                  </div>
                )}

                {policy.count_as_deal && (
                  <div
                    className="relative text-white px-3 py-2 rounded-full flex items-center gap-1"
                    style={{
                      backgroundColor: restaurant?.metadata.primaryColor,
                    }}
                  >
                    <Lock size={16} />
                    <span className="font-semibold text-xs">
                      Counts As Deal
                    </span>
                  </div>
                )}
              </div>
              <ShareButton
                objectType="policy"
                object={policy}
                restaurant={restaurant}
              />
            </div>

            <p className="text-xl text-black whitespace-normal break-words font-bold">
              {titleCase(policy.header || "")}
            </p>

            <div className="flex items-center mt-4 text-gray-500">
              <PolicyDescriptionDisplay
                policy={policy}
                restaurant={restaurant}
              />
            </div>

            {!isUsable && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 text-amber-700 p-3">
                    <AlertCircle size={20} />
                    <span className="font-medium">
                      This Deal is not Currently Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isUsable &&
              (!policyIsActive && hasMissingItems ? (
                <div className="mt-4 ">
                  {missingItemsResults.map((result, index) => (
                    <div key={index} className="mt-2">
                      <div className="flex items-center gap-2 text-amber-700  bg-amber-50 border border-amber-200 py-2 px-3 rounded-lg">
                        <AlertCircle size={20} />
                        <span className="font-medium">
                          Add {result.quantityNeeded} more from any of the
                          following:
                        </span>
                      </div>

                      <DrinkList
                        restaurant={restaurant}
                        itemSpecifications={ItemUtils.policyItemSpecificationsToItemIds(
                          result.missingItems,
                          restaurant
                        )}
                        label={null}
                        slideToFilter={() => {}}
                        onSelect={null}
                        selected={null}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-green-700 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle size={20} />
                    <span className="font-medium">
                      {policyIsActive
                        ? "This deal is active in your cart."
                        : `You're ready to add this deal.${
                            userChoices.length > 0 ? ` ` : ""
                          }`}
                      {!policyIsActive && userChoices.length > 0 && (
                        <span className="font-bold">
                          Select your preferred item.
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="rounded-lg">
                    {!policyIsActive && userChoices.length > 0 && (
                      <DrinkList
                        restaurant={restaurant}
                        itemSpecifications={userChoices}
                        label={null}
                        slideToFilter={() => {}}
                        onSelect={async (item) => {
                          if (
                            ItemUtils.doesItemRequireConfiguration(
                              item,
                              restaurant
                            )
                          ) {
                            openItemModModal(
                              item.id,
                              async (itemWithVariation: Item) => {
                                setUserPreference(itemWithVariation);
                              }
                            );
                          } else {
                            setUserPreference(item);
                          }
                        }}
                        selected={userPreference}
                      />
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-4 fixed bottom-0 left-0 right-0 px-6 pb-4 bg-white border-t-0">
          <div className="relative">
            <div
              className={`absolute left-0 right-0 transition-transform duration-300 ease-in-out ${
                userPreference ? "" : "translate-y-full pointer-events-none"
              }`}
              style={{
                bottom: "100%",
                zIndex: 0,
                left: "-24px",
                right: "-24px",
              }}
            >
              <div className="bg-white rounded-t-3xl px-6 pt-4 pb-1 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                {userPreference && (
                  <>
                    {/* Item Image and Basic Info */}
                    <div className="flex items-start space-x-4 mb-2">
                      <ImageFallback
                        src={ImageUtils.getItemImageUrl(
                          userPreference.id,
                          restaurant
                        )}
                        alt="Selected item"
                        className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"
                        restaurant={restaurant}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-lg">
                          {titleCase(
                            ItemUtils.getItemName(userPreference, restaurant)
                          )}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {ItemUtils.getItemModifierNames(
                            userPreference,
                            restaurant
                          ).join(", ")}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          $
                          {ItemUtils.priceItem(
                            userPreference,
                            restaurant
                          )?.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => setUserPreference(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Spacer to create separation */}
            <div className="h-4"></div>

            {userSession ? (
              <button
                className="w-full text-white py-3 rounded-full flex items-center justify-center gap-2 relative z-10 transition-colors duration-1000"
                style={{
                  backgroundColor:
                    (hasMissingItems && !policyIsActive) ||
                    (userChoices.length > 0 &&
                      !userPreference &&
                      !policyIsActive) ||
                    !isUsable
                      ? "#969292"
                      : restaurant?.metadata.primaryColor,
                }}
                onClick={async () => {
                  setLoading(true);
                  if (policyIsActive) {
                    openCheckoutModal();
                  } else if (!hasMissingItems) {
                    await addPolicy(
                      bundle_id,
                      policy.policy_id,
                      userPreference
                    );
                  }
                  setLoading(false);
                  onClose();
                }}
                disabled={
                  (userChoices.length > 0 &&
                    !userPreference &&
                    !policyIsActive) ||
                  (hasMissingItems && !policyIsActive) ||
                  !isUsable
                }
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    {policyIsActive ? "Go to Checkout" : "Apply Deal"}
                  </>
                )}
              </button>
            ) : (
              <div className="relative z-10">
                <SignInButton
                  onClose={onClose}
                  primaryColor={restaurant?.metadata.primaryColor}
                />
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PolicyModal;
