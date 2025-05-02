import React, { useEffect, useState } from "react";
import { Sheet } from "react-modal-sheet";
import { X, Wallet, CircleX, Tag } from "lucide-react";
import { Bundle, Restaurant, Policy, BundleItem } from "@/types";
import { GradientIcon } from "@/utils/gradient";
import { useAuth } from "@/context/auth_context";
import { SignInButton } from "../signin/signin_button";
import ApplePayButton from "../apple_pay_button";
import { useGlobalCartManager } from "@/hooks/useGlobalCartManager";
import { PassAddOnCard } from "../cards/pass_add_on_card";
import { useRestaurant } from "@/context/restaurant_context";
import { ItemUtils } from "@/utils/item_utils";
import { BundleUtils } from "@/utils/bundle_utils";
import { checkoutStyles } from "@/styles/checkout_styles";
import { formatPoints } from "@/utils/parse";

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
  const { state, addPolicy, addToCart, removePolicy, refreshCart } =
    useGlobalCartManager(restaurant, userSession, false);
  const { policyManager } = useRestaurant();
  const [loadingLocalCart, setLoadingLocalCart] = useState(false);
  const [passAddOns, setPassAddOns] = useState<Policy[]>([]);

  const bundleMenuItem = ItemUtils.getMenuItemFromItemId(
    bundle.bundle_id,
    restaurant
  ) as BundleItem;

  useEffect(() => {
    const initLocalCart = async () => {
      // Only proceed if we have all required dependencies
      if (
        !restaurant ||
        !isOpen ||
        !userSession ||
        !policyManager ||
        !bundleMenuItem
      ) {
        return;
      }

      setLoadingLocalCart(true);
      const cartItemIds = [...new Set(state.cart.map((item) => item.item.id))];
      // Only add bundle if not already in cart
      if (!cartItemIds.includes(bundle.bundle_id)) {
        await addToCart({ id: bundle.bundle_id, modifiers: [] });
        setTimeout(() => {
          setLoadingLocalCart(false);
        }, 3000);
      } else {
        const passAddOns =
          policyManager.getAddOns(state.cart, state.dealEffect, restaurant)
            .passAddOns || [];
        setPassAddOns(passAddOns);
        setLoadingLocalCart(false);
      }
    };

    // Call initLocalCart unconditionally
    initLocalCart();

    // Include all dependencies in the dependency array
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

  const savedBundleValue = BundleUtils.estimateBundleValue(
    bundle,
    restaurant,
    bundlePolicies
  );

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.9, 0]}
      initialSnap={0}
      tweenConfig={{
        duration: 0.2,
        ease: [0.4, 0, 0.6, 1],
      }}
    >
      <Sheet.Container className="rounded-t-3xl">
        <Sheet.Content>
          <div className="flex flex-col h-full">
            {/* Fixed header */}
            <div className="sticky top-0 bg-white p-6 border-b z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold m-0 text-gray-800">
                  {bundle.name}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 bg-gray-200 rounded-full p-2"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Price and time */}
                <div className="flex items-center">
                  <span className="text-xl font-semibold text-gray-800">
                    ${bundle.price.toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-400 line-through ml-2">
                    ${Math.round(savedBundleValue + bundle.price) - 0.01}
                  </span>
                </div>
                <div className="text-md text-green-500">
                  Receive ${Math.round(savedBundleValue)} in value
                </div>
                <div className="text-md font-bold text-gray-600 mt-1 mb-4">
                  Lasts {bundle.duration} {bundle.duration > 1 ? "Days" : "Day"}
                </div>

                <div className="flex gap-4 overflow-x-auto mb-4 pb-2 px-2 no-scrollbar -mx-6 px-6">
                  {bundle.fixed_credit > 0 && (
                    <div className="w-[220px] h-[160px] p-4 rounded-xl border border-gray-200 flex flex-col items-start flex-shrink-0">
                      <div className="text-[#E6C677] mb-4">
                        <GradientIcon
                          icon={Wallet}
                          primaryColor={
                            restaurant?.metadata.primaryColor as string
                          }
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
                          primaryColor={
                            restaurant?.metadata.primaryColor as string
                          }
                          size={30}
                        />
                      </div>
                      <h3 className="m-0 mb-1 text-base font-bold text-gray-800">
                        {bundle.point_multiplier}x Points
                      </h3>
                      <p className="m-0 text-xs text-gray-600 custom-line-clamp">
                        {bundle.point_multiplier}x points on all purchases for
                        the duration of this bundle.
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
                  <div className="flex flex-col gap-4">
                    {bundlePolicies.map((policy, index) => {
                      return (
                        policy && (
                          <div>
                            <h2
                              key={index}
                              className="text-gray-800 font-medium flex items-center gap-2"
                            >
                              <GradientIcon
                                icon={Tag}
                                primaryColor={
                                  restaurant?.metadata.primaryColor as string
                                }
                                size={20}
                              />
                              <div className="flex items-center gap-2">
                                <span>
                                  {policy.name}{" "}
                                  {(policy.total_usages ||
                                    policy.days_since_last_use) && (
                                    <span className="text-sm text-gray-600">
                                      {policy.total_usages &&
                                      policy.days_since_last_use
                                        ? `(One use every ${
                                            policy.days_since_last_use
                                          } ${
                                            policy.days_since_last_use === 1
                                              ? "day"
                                              : "days"
                                          } up to ${policy.total_usages} ${
                                            policy.total_usages === 1
                                              ? "use"
                                              : "uses"
                                          })`
                                        : policy.total_usages
                                        ? `(Up to ${policy.total_usages} ${
                                            policy.total_usages === 1
                                              ? "use"
                                              : "uses"
                                          })`
                                        : `(One use every ${
                                            policy.days_since_last_use
                                          } ${
                                            policy.days_since_last_use === 1
                                              ? "day"
                                              : "days"
                                          })`}
                                    </span>
                                  )}
                                </span>
                              </div>
                            </h2>
                          </div>
                        )
                      );
                    })}
                  </div>
                </div>

                {policyManager === null && (
                  <div className="mt-4 mb-4">policy manager is null</div>
                )}

                {!loadingLocalCart ? (
                  <div className="mt-4 mb-4">
                    {passAddOns.map((policy) => (
                      <PassAddOnCard
                        key={policy.policy_id} // ← always add a `key` when mapping!
                        state={state}
                        addPolicy={addPolicy}
                        removePolicy={removePolicy}
                        restaurant={restaurant as Restaurant}
                        policy={policy}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 mb-4 flex justify-center">
                    <div
                      className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200"
                      style={{
                        borderTopColor: restaurant?.metadata
                          .primaryColor as string,
                      }}
                    ></div>
                  </div>
                )}

                {state.cart.length > 0 && state.cartResults && (
                  <div className={checkoutStyles.summaryContainer}>
                    {state.cartResults.discount > 0 && (
                      <div
                        className={checkoutStyles.summaryRow}
                        style={{ color: "#40C4AA" }}
                      >
                        <span>Discounts</span>
                        <span>-${state.cartResults.discount.toFixed(2)}</span>
                      </div>
                    )}
                    {state.cartResults.totalPointCost > 0 && (
                      <div className={checkoutStyles.summaryRow}>
                        <span>Point Cost</span>
                        <span>
                          -{formatPoints(state.cartResults.totalPointCost)}
                        </span>
                      </div>
                    )}
                    {state.cartResults.totalPoints > 0 && (
                      <div
                        className={checkoutStyles.summaryRow}
                        style={{ color: "#40C4AA" }}
                      >
                        <span>Points Earned</span>
                        <span>
                          +{formatPoints(state.cartResults.totalPoints)}
                        </span>
                      </div>
                    )}
                    {state.cartResults.credit.creditUsed > 0 && (
                      <div
                        className={checkoutStyles.summaryRow}
                        style={{ color: "#40C4AA" }}
                      >
                        <span>Credit Applied</span>
                        <span>
                          -${state.cartResults.credit.creditUsed.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className={checkoutStyles.summaryRow}>
                      <span>Subtotal</span>
                      <span>${state.cartResults.subtotal.toFixed(2)}</span>
                    </div>
                    <div className={checkoutStyles.summaryRow}>
                      <span>Fees & Tax</span>
                      <span>${state.cartResults.tax.toFixed(2)}</span>
                    </div>
                    <div
                      className={checkoutStyles.summaryTotal}
                      style={{ marginTop: 20 }}
                    >
                      <span className="font-bold">Total</span>
                      <span className="font-bold">
                        ${state.cartResults.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom section */}
                <div className="mt-8">
                  {/* Payment button */}
                  <div>
                    {!userSession ? (
                      <SignInButton
                        onClose={onClose}
                        primaryColor={
                          restaurant?.metadata.primaryColor as string
                        }
                      />
                    ) : (
                      state &&
                      state?.cartResults?.totalPrice &&
                      state?.cartResults?.totalPrice > 0 && (
                        <ApplePayButton
                          payload={{
                            userAccessToken: userSession.access_token,
                            restaurant_id: restaurant.id,
                            state: state,
                            totalWithTip: Math.round(
                              state.cartResults.totalPrice * 100
                            ),
                            connectedAccountId: restaurant?.stripe_account_id,
                          }}
                          sanityCheck={refreshCart}
                          clearCart={() => {
                            onClose();
                            window.scrollTo(0, 0);
                            window.location.reload();
                          }}
                        />
                      )
                    )}
                  </div>

                  {/* Terms */}
                  <div className="text-sm text-gray-600 mt-4 leading-[1.4]">
                    <p className="m-0">
                      The Bundle is valid for {bundle.duration}{" "}
                      {bundle.duration > 1 ? "Days" : "Day"} and grants access
                      to exclusive perks, discounts, and offers at the
                      associated location while supplies last.{" "}
                      <span className="underline">Terms and conditions</span>{" "}
                      are subject to change without prior notice.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
};

export default BundleModal;
