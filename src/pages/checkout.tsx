import { useState, useEffect } from "react";
import { ChevronLeft, Tag, X } from "lucide-react";
import { checkoutStyles } from "../styles/checkout_styles.ts";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/auth_context.tsx";
import PayButton from "../components/pay_button.tsx";
import {
  LOYALTY_REWARD_TAG,
  NORMAL_DEAL_TAG,
  OFFERS_PAGE_PATH,
  RESTAURANT_PATH,
} from "../constants.ts";
import { CartItem, Policy, Restaurant, Transaction } from "../types.ts";
import { CheckoutItemCard } from "@/components/checkout/checkout_item_card.tsx";
import AccessCardSlider from "../components/sliders/access_card_slider.tsx";
import DealPreOrderBar from "@/components/checkout/deal_checkout_bar.tsx";
import { titleCase } from "title-case";
import { useTimer } from "@/hooks/useTimer.tsx";
import { ItemUtils } from "@/utils/item_utils.ts";
import { Alert } from "@/components/display_utils/alert.tsx";
import { setThemeColor } from "@/utils/color.ts";
import { SignInButton } from "@/components/signin/signin_button.tsx";
import { useRestaurant } from "@/context/restaurant_context.tsx";
import { CheckoutSkeleton } from "@/components/skeletons/checkout_skeleton.tsx";
import { useBottomSheet } from "@/context/bottom_sheet_context.tsx";
import { PolicyCard } from "@/components/cards/policy_card.tsx";
import SpendGoalCard from "@/components/cards/spend_goal_card.tsx";
import AddOnManager from "@/components/sliders/add_on_manager.tsx";
import CheckoutSummary from "@/components/checkout/checkout_summary.tsx";
import BundleCTA from "@/components/checkout/bundle_cta.tsx";
import { PolicyUtils } from "@/utils/policy_utils.ts";

export default function CheckoutPage() {
  setThemeColor();
  const { userSession } = useAuth();
  const { restaurant, policyManager, fetchUserOwnership } = useRestaurant();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [tipAmount, setTipAmount] = useState<number>(0);

  const [inlineRecommendation, setInlineRecommendation] = useState<{
    cartId: number;
    flair: string;
    policy: Policy;
  } | null>(null);

  const {
    timeRemaining: addOnTime,
    isRunning,
    start,
    pause,
    reset,
  } = useTimer(180);
  const {
    state,
    addPolicy,
    addToCart,
    removeFromCart,
    refreshCart,
    removePolicy,
    clearCart,
  } = useBottomSheet();

  useEffect(() => {
    window.scrollTo(0, 0);
    // start();
  }, []);

  useEffect(() => {
    const activePolicy =
      policyManager
        ?.getActivePolicies(state.dealEffect)
        .filter((p) => p.definition.tag === NORMAL_DEAL_TAG)[0] || null;
    if (activePolicy) {
      setInlineRecommendation(null);
    } else {
      if (state.cart.length > 0 && !inlineRecommendation) {
        const inlineRec = policyManager?.getInlineRecommendations(
          state.cart,
          state.dealEffect,
          restaurant as Restaurant
        );
        if (inlineRec) {
          console.log("inlineRec", inlineRec);
          setInlineRecommendation(inlineRec);
        }
      }
    }
  }, [state.cart, policyManager, state.dealEffect]);

  if (!restaurant || !policyManager || !state) {
    return <CheckoutSkeleton />;
  }

  const isPreEntry = state.cart.some((item) =>
    ItemUtils.isPassItem(item.item.id, restaurant as Restaurant)
  );

  return (
    <div className={checkoutStyles.pageContainer}>
      <div className="relative flex items-center justify-center mb-2 sticky top-0 bg-white border-b shadow-sm -mx-4 p-4 z-20">
        {/* Back Button */}
        <button
          className="absolute left-0 w-9 h-9 bg-black/10 rounded-full flex items-center justify-center ml-4"
          onClick={() => {
            navigate(RESTAURANT_PATH.replace(":id", id as string));
          }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Page Title */}
        <h6 className={checkoutStyles.pageTitle}>Checkout</h6>
      </div>

      {restaurant && (
        <AccessCardSlider
          restaurant={restaurant}
          cart={state.cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          displayCartPasses={true}
          dealEffect={state.dealEffect}
          inlineRecommendation={inlineRecommendation}
        />
      )}

      {restaurant && state.cart.length > 0 ? (
        <div className={checkoutStyles.itemsContainer}>
          {state.cart
            .filter(
              (item: CartItem) =>
                !ItemUtils.isPassItem(item.item.id, restaurant)
            )
            .map((item: CartItem) => (
              <CheckoutItemCard
                key={item.id} // assuming item has a unique id
                item={item}
                restaurant={restaurant}
                dealEffect={state.dealEffect}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                inlineRecommendation={inlineRecommendation}
              />
            ))}
        </div>
      ) : (
        <div className="flex justify-center mt-12">
          <div className="text-black text-xl font-bold">
            There are no items in your cart.
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {policyManager &&
          policyManager.getActivePolicies(state.dealEffect).map((policy) => {
            if (policy.definition.tag !== NORMAL_DEAL_TAG) return null;
            return (
              <Alert
                trigger={
                  <button
                    key={policy.policy_id}
                    onClick={() => console.log("intention to remove")}
                    className="px-2 py-2 bg-gray-100 rounded-full text-xs flex items-center gap-1"
                  >
                    <Tag size={13} className="text-gray-800" />
                    <span className="text-gray-800 text-md font-semibold">
                      {titleCase(policy.name)}
                    </span>
                    <X className="text-gray-800 h-4 w-4" />
                  </button>
                }
                title="Are you sure?"
                description="You're about to remove a deal from your cart. Are you sure you want to do this?"
                onConfirm={async () => {
                  await removePolicy(policy.policy_id);
                }}
              />
            );
          })}
      </div>
      <AddOnManager
        state={state}
        isPreEntry={isPreEntry}
        addPolicy={addPolicy}
        removePolicy={removePolicy}
      />
      <div className="flex flex-col justify-end h-full">
        {policyManager &&
          policyManager.getRecommendedDeals(
            state.cart,
            state.dealEffect,
            restaurant as Restaurant
          ).length > 0 && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold mb-4">Save More</h2>
              <div className="overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
                <div className="flex gap-6 snap-x snap-mandatory">
                  {policyManager
                    .getRecommendedDeals(
                      state.cart,
                      state.dealEffect,
                      restaurant as Restaurant
                    )
                    .slice(0, 3)
                    .map((policy) => (
                      <div className="w-[90%] flex-shrink-0 snap-center">
                        <PolicyCard
                          key={policy.policy_id}
                          cart={state.cart}
                          policy={policy}
                          restaurant={restaurant as Restaurant}
                          dealEffect={state.dealEffect}
                          extraTags={[
                            ...(PolicyUtils.isPolicyUsable(policy, restaurant)
                              ? []
                              : ["Not Currently Active"]),
                          ]}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

        <SpendGoalCard
          onClick={() => {
            navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id), {
              state: { tag: LOYALTY_REWARD_TAG },
            });
          }}
        />

        {/* <BundleCTA /> */}

        <h2 className="text-2xl font-bold  mt-6">Payment</h2>
        <DealPreOrderBar
          policy={
            policyManager
              ?.getActivePolicies(state.dealEffect)
              .filter((p) => p.definition.tag === NORMAL_DEAL_TAG)[0] || null
          }
          restaurant={restaurant as Restaurant}
        />
        <CheckoutSummary
          state={state}
          restaurant={restaurant as Restaurant}
          setTipAmount={setTipAmount}
          tipAmount={tipAmount}
        />

        <div className="bg-white pt-0 -mx-4 px-4 shadow-[0_-8px_16px_-6px_rgba(0,0,0,0.1)]">
          <BundleCTA />

          {state.cart.length > 0 && (
            <div className={checkoutStyles.paymentContainer}>
              {userSession ? (
                state.token &&
                state.cartResults && (
                  <PayButton
                    payload={{
                      userAccessToken: userSession.access_token,
                      restaurant_id: restaurant?.id,
                      state: state,
                      totalWithTip: Math.round(
                        (state.cartResults.totalPrice + tipAmount) * 100
                      ),
                      connectedAccountId: restaurant?.stripe_account_id,
                    }}
                    refresh={refreshCart}
                    postPurchase={async (transactions: Transaction[]) => {
                      await clearCart();
                      await fetchUserOwnership(restaurant);
                      navigate(RESTAURANT_PATH.replace(":id", restaurant.id), {
                        state: {
                          transactions: transactions,
                          qr: true,
                          message: {
                            type: "success",
                            message:
                              "Purchase successful! You can redeem your items anytime.",
                          },
                        },
                      });
                    }}
                  />
                )
              ) : (
                <SignInButton
                  onClose={() => {}}
                  primaryColor={restaurant?.metadata.primaryColor as string}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
