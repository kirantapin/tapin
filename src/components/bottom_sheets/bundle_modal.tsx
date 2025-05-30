import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X, Wallet, CircleX, Check } from "lucide-react";
import { Bundle, Restaurant, Policy, BundleItem, Transaction } from "@/types";
import { GradientIcon } from "@/utils/gradient";
import { useAuth } from "@/context/auth_context";
import { SignInButton } from "../signin/signin_button";
import PayButton from "../pay_button";
import { useGlobalCartManager } from "@/hooks/useGlobalCartManager";
import { useRestaurant } from "@/context/restaurant_context";
import { ItemUtils } from "@/utils/item_utils";
import { BundleUtils } from "@/utils/bundle_utils";

import CheckoutSummary from "../checkout/checkout_summary";
import AddOnManager from "../sliders/add_on_manager";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import SmallPolicyCard from "../cards/small_policy_card";
import { PolicyUtils } from "@/utils/policy_utils";
import { titleCase } from "title-case";
import GenericItemIcon from "../display_utils/generic_item_icons";
import { RESTAURANT_PATH } from "@/constants";
import { useNavigate } from "react-router-dom";
interface BundleModalProps {
  isOpen: boolean;
  onClose: () => void;
  bundle: Bundle;
  restaurant: Restaurant;
}

const BundleModal: React.FC<BundleModalProps> = ({
  isOpen,
  onClose,
  bundle,
  restaurant,
}) => {
  const { userSession } = useAuth();
  const navigate = useNavigate();
  const { userOwnershipMap, fetchUserOwnership } = useRestaurant();
  const { refreshCart } = useBottomSheet();
  const { handlePolicyClick, triggerToast } = useBottomSheet();
  const { state, addPolicy, addToCart, removePolicy } = useGlobalCartManager(
    restaurant,
    userSession,
    false
  );
  const { policyManager } = useRestaurant();
  const [loadingLocalCart, setLoadingLocalCart] = useState(false);

  const bundleMenuItem = bundle
    ? (ItemUtils.getMenuItemFromItemId(
        bundle?.bundle_id,
        restaurant
      ) as BundleItem)
    : null;

  useEffect(() => {
    const initLocalCart = async () => {
      if (
        !restaurant ||
        !isOpen ||
        !userSession ||
        !policyManager ||
        !bundleMenuItem ||
        userOwnershipMap?.[bundle.bundle_id]
      ) {
        return;
      }

      setLoadingLocalCart(true);
      const cartItemIds = [...new Set(state.cart.map((item) => item.item.id))];
      if (!cartItemIds.includes(bundle.bundle_id)) {
        await addToCart({ id: bundle.bundle_id, modifiers: [] });
        setTimeout(() => {
          setLoadingLocalCart(false);
        }, 3000);
      } else {
        setLoadingLocalCart(false);
      }
    };

    initLocalCart();
  }, [isOpen, userSession, policyManager, restaurant, state]);

  if (!bundleMenuItem || !bundleMenuItem.price) {
    return null;
  }

  const childPolicyIds = bundleMenuItem.bundle_policies;
  const bundlePolicies: Policy[] = childPolicyIds
    .map((id) => {
      const policy = policyManager?.getPolicyFromId(id);
      if (!policy) {
        console.error(`Policy with id ${id} not found`);
        return null;
      }
      return policy;
    })
    .filter((policy): policy is Policy => policy !== null);

  const { deals, freeItems } =
    BundleUtils.separateBundlePoliciesByType(bundlePolicies);

  const estimatedBundleValue = BundleUtils.estimateBundleValue(
    bundle,
    restaurant,
    bundlePolicies
  );

  const isOwned = userOwnershipMap && userOwnershipMap[bundle.bundle_id];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-3xl [&>button]:hidden p-0 flex flex-col gap-0"
      >
        <SheetHeader className="flex-none px-6 pt-6 pb-4 border-b">
          <div className="flex justify-between items-start">
            <SheetTitle className="text-2xl font-bold m-0 text-gray-800">
              {bundle.name}
            </SheetTitle>
            <button
              onClick={onClose}
              className="text-gray-500 bg-gray-200 rounded-full p-2 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          {/* Price and time */}
          <div className="flex items-center mb-2">
            <span className="text-2xl font-semibold text-black">
              ${bundle.price.toFixed(2)}
            </span>
            <div
              className="flex items-center rounded-full ml-4 px-3 py-1"
              style={{
                backgroundColor: restaurant?.metadata.primaryColor as string,
              }}
            >
              <span className="text-md text-white font-semibold">
                ${Math.round(estimatedBundleValue) - 0.01} value
              </span>
            </div>
          </div>
          <div className="text-md font-bold text-gray-600 mt-1 mb-4">
            Lasts {bundle.duration} {bundle.duration > 1 ? "Days" : "Day"}
          </div>

          <div className="flex gap-4 overflow-x-auto mb-4 pb-2 no-scrollbar -mx-6 px-6">
            {freeItems.map((policy, index) => {
              return (
                <div
                  key={index}
                  className="w-[220px] h-[160px] p-4 rounded-xl border border-gray-200 flex flex-col items-start flex-shrink-0"
                  onClick={() => {
                    handlePolicyClick(policy, userOwnershipMap);
                  }}
                >
                  {(() => {
                    const itemId = PolicyUtils.getPotentialPreferencesForPolicy(
                      policy,
                      restaurant
                    )[0];

                    return (
                      <div className="mb-4">
                        <GenericItemIcon
                          itemId={itemId}
                          restaurant={restaurant}
                          size={30}
                        />
                      </div>
                    );
                  })()}

                  <h3 className="m-0 mb-1 text-base font-bold text-gray-800">
                    {titleCase(PolicyUtils.getPolicyName(policy, restaurant))}
                  </h3>
                  <p
                    className="m-0 text-xs text-gray-600 custom-line-clamp"
                    style={{
                      color: PolicyUtils.isPolicyUsable(policy, restaurant)
                        ? "inherit"
                        : (restaurant?.metadata.primaryColor as string),
                      fontWeight: PolicyUtils.isPolicyUsable(policy, restaurant)
                        ? "normal"
                        : "bold",
                    }}
                  >
                    {titleCase(
                      PolicyUtils.getUsageDescription(policy, restaurant) || ""
                    )}
                  </p>
                </div>
              );
            })}
            {bundle.fixed_credit > 0 && (
              <div className="w-[220px] h-[160px] p-4 rounded-xl border border-gray-200 flex flex-col items-start flex-shrink-0">
                <div className=" mb-4">
                  <GradientIcon
                    icon={Wallet}
                    primaryColor={restaurant?.metadata.primaryColor as string}
                    size={30}
                  />
                </div>
                <h3 className="m-0 mb-1 text-base font-bold text-gray-800">
                  ${bundle.fixed_credit.toFixed(2)} Credit
                </h3>
                <p className="m-0 text-xs text-gray-600 custom-line-clamp">
                  Get ${bundle.fixed_credit.toFixed(2)} in Credit to spend
                  towards your next purchase at {restaurant.name}.
                </p>
              </div>
            )}

            {bundle.point_multiplier > 1 && (
              <div className="w-[220px] h-[160px] p-4 rounded-xl border border-gray-200 flex flex-col items-start flex-shrink-0">
                <div className="text-[#E6C677] mb-4">
                  <GradientIcon
                    icon={CircleX}
                    primaryColor={restaurant?.metadata.primaryColor as string}
                    size={30}
                  />
                </div>
                <h3 className="m-0 mb-1 text-base font-bold text-gray-800">
                  {bundle.point_multiplier}x Points
                </h3>
                <p className="m-0 text-xs text-gray-600 custom-line-clamp">
                  {bundle.point_multiplier}x points on all purchases for the
                  duration of this bundle.
                </p>
              </div>
            )}
          </div>

          {bundlePolicies.length > 0 && (
            <h1 className="text-xl font-bold text-gray-800">
              Exclusive Access To:
            </h1>
          )}
          <div className="mt-2">
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6">
              {deals.map((policy, index) => {
                return (
                  policy && (
                    <div key={index} className="flex-shrink-0 w-[95%]">
                      <SmallPolicyCard
                        policy={policy}
                        restaurant={restaurant}
                        bottomTongueText={PolicyUtils.getUsageDescription(
                          policy,
                          restaurant
                        )}
                      />
                    </div>
                  )
                );
              })}
            </div>
          </div>

          {!loadingLocalCart ? (
            !isOwned ? (
              <AddOnManager
                state={state}
                isPreEntry={false}
                addPolicy={addPolicy}
                removePolicy={removePolicy}
                allowTimer={false}
                allowNormalItems={false}
              />
            ) : null
          ) : (
            <div className="mt-4 mb-4 flex justify-center">
              <div
                className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200"
                style={{
                  borderTopColor: restaurant?.metadata.primaryColor as string,
                }}
              ></div>
            </div>
          )}
          {!isOwned && (
            <CheckoutSummary
              state={state}
              restaurant={restaurant as Restaurant}
              setTipAmount={() => {}}
              tipAmount={0}
              fees={false}
            />
          )}

          {/* Payment section */}
          <div className="mt-6">
            {!userSession ? (
              <SignInButton
                onClose={onClose}
                primaryColor={restaurant?.metadata.primaryColor as string}
              />
            ) : isOwned ? (
              <div className="flex justify-center w-full">
                <div className="relative">
                  <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-[#40C4AA]">
                    <Check size={24} />
                  </div>
                  <p className="text-lg text-gray-600 font-medium">
                    You own this bundle.
                  </p>
                </div>
              </div>
            ) : (
              state?.cartResults?.totalPrice &&
              state.cartResults.totalPrice > 0 && (
                <PayButton
                  payload={{
                    userAccessToken: userSession.access_token,
                    restaurant_id: restaurant.id,
                    state: state,
                    totalWithTip: Math.round(
                      state.cartResults.totalPrice * 100
                    ),
                    connectedAccountId: restaurant?.stripe_account_id,
                  }}
                  refresh={refreshCart}
                  postPurchase={async (transactions: Transaction[]) => {
                    await refreshCart();
                    await fetchUserOwnership(restaurant);
                    onClose();
                    triggerToast(
                      "Bundle purchased successfully, view items in My Spot",
                      "success",
                      5000
                    );
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              )
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BundleModal;
