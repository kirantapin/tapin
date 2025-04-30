import { useState, useRef, useEffect, useReducer } from "react";
import { ArrowLeft, Check, ChevronLeft, Tag, X } from "lucide-react";
import { checkoutStyles } from "../styles/checkout_styles";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/auth_context.tsx";
import ApplePayButton from "../components/apple_pay_button.tsx";
import { NORMAL_DEAL_TAG, RESTAURANT_PATH } from "../constants.ts";
import { CartItem, Policy, Restaurant } from "../types.ts";
import { CheckoutItemCard } from "@/components/checkout/checkout_item_card.tsx";
import AccessCardSlider from "../components/sliders/access_card_slider.tsx";
import DealPreOrderBar from "@/components/checkout/deal_checkout_bar.tsx";
import { motion } from "framer-motion";
import { titleCase } from "title-case";
import AddOnCard from "@/components/cards/add_on_card.tsx";
import { useTimer } from "@/hooks/useTimer.tsx";
import DealCard from "@/components/cards/small_policy.tsx";
import { PassAddOnCard } from "@/components/cards/pass_add_on_card.tsx";
import { ItemUtils } from "@/utils/item_utils.ts";
import { formatPoints } from "@/utils/parse.ts";
import { Alert } from "@/components/display_utils/alert.tsx";
import { adjustColor, setThemeColor } from "@/utils/color.ts";
import { SignInButton } from "@/components/signin/signin_button.tsx";
import { useRestaurant } from "@/context/restaurant_context.tsx";
import { CheckoutSkeleton } from "@/components/skeletons/checkout_skeleton.tsx";
import { useBottomSheet } from "@/context/bottom_sheet_context.tsx";
import { PolicyCard } from "@/components/cards/policy_card.tsx";
export default function CheckoutPage() {
  setThemeColor();
  const { userSession } = useAuth();
  const { restaurant, policyManager, setCurrentRestaurantId } = useRestaurant();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [tipPercent, setTipPercent] = useState<number>(0.2);
  const tipAmounts = [0.1, 0.15, 0.2];
  const { openSignInModal } = useBottomSheet();

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
    getActivePolicies,
    removePolicy,
    isPreEntry,
    clearCart,
  } = useBottomSheet();

  useEffect(() => {
    if (id) {
      setCurrentRestaurantId(id);
    }
    window.scrollTo(0, 0);
    // start();
  }, [id]);

  if (!restaurant || !policyManager || !state) {
    return <CheckoutSkeleton />;
  }

  return (
    <div className={checkoutStyles.pageContainer}>
      <div className="relative flex items-center justify-center mb-6 sticky top-0 bg-white border-b shadow-sm -mx-4 pb-5 pr-4 pl-4 z-20">
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
              />
            ))}
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="text-gray-600 text-lg font-medium">
            There are no items in your cart.
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {policyManager &&
          policyManager
            .getActivePolicies(state.dealEffect, restaurant as Restaurant)
            .map((policy) => {
              if (policy.definition.tag !== NORMAL_DEAL_TAG) return null;
              return (
                <Alert
                  trigger={
                    <button
                      key={policy.policy_id}
                      onClick={() => console.log("intention to remove")}
                      className="px-2 py-2 bg-gray-200 rounded-full text-xs flex items-center gap-1"
                    >
                      <Tag size={13} className="text-gray-800" />
                      <span>{titleCase(policy.name)}</span>
                      <X className="text-gray-800 h-3.5 w-3.5" />
                    </button>
                  }
                  title="Are you absolutely sure?"
                  description="You’re about to remove a deal from your cart. Are you sure you want to do this?"
                  onConfirm={async () => {
                    await removePolicy(policy);
                    console.log("removed");
                  }}
                />
              );
            })}
      </div>
      {restaurant && policyManager && state.cart.length > 0 && (
        <div className="mt-4">
          {policyManager.getAddOns(state.cart, state.dealEffect, restaurant)
            .allAddOns.length > 0 && (
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold mb-4">
                {isPreEntry ? "Exclusive Pre-entry Deals" : "Exclusive Deals"}
              </h2>
              <div className="text-md text-red-600 mb-4">
                {addOnTime > 0 ? (
                  <span>
                    {Math.floor(addOnTime / 60)}:
                    {(addOnTime % 60).toString().padStart(2, "0")} left to claim
                  </span>
                ) : (
                  <span className="text-red-500">Expired</span>
                )}
              </div>
            </div>
          )}
          <div className="overflow-x-auto pb-2 mb-2 no-scrollbar">
            <div className="flex gap-2" style={{ minWidth: "max-content" }}>
              {addOnTime > 0 &&
                policyManager
                  .getAddOns(state.cart, state.dealEffect, restaurant)
                  .normalAddOns.map((policy) => (
                    <AddOnCard
                      state={state}
                      policy={policy}
                      restaurant={restaurant}
                      key={policy.policy_id}
                      addPolicy={async () => {
                        await addPolicy(null, policy);
                        pause();
                      }}
                    />
                  ))}
            </div>
          </div>
          <div className="mt-2">
            {policyManager
              .getAddOns(state.cart, state.dealEffect, restaurant)
              .passAddOns.map((policy) => (
                <PassAddOnCard
                  state={state}
                  addPolicy={addPolicy}
                  removePolicy={removePolicy}
                  restaurant={restaurant as Restaurant}
                  policy={policy as Policy}
                />
              ))}
          </div>
        </div>
      )}
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
                    .map((policy) => (
                      <div className="w-[90%] flex-shrink-0 snap-center">
                        <PolicyCard
                          key={policy.policy_id}
                          cart={state.cart}
                          policy={policy}
                          restaurant={restaurant as Restaurant}
                          dealEffect={state.dealEffect}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

        <h2 className="text-2xl font-bold  mt-6">Payment</h2>
        <DealPreOrderBar
          policy={
            policyManager
              ?.getActivePolicies(state.dealEffect, restaurant as Restaurant)
              .filter((p) => p.definition.tag === NORMAL_DEAL_TAG)[0] || null
          }
          restaurant={restaurant as Restaurant}
        />
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
                <span>-{formatPoints(state.cartResults.totalPointCost)}</span>
              </div>
            )}
            {state.cartResults.totalPoints > 0 && (
              <div
                className={checkoutStyles.summaryRow}
                style={{ color: "#40C4AA" }}
              >
                <span>Points Earned</span>
                <span>+{formatPoints(state.cartResults.totalPoints)}</span>
              </div>
            )}
            {state.cartResults.creditUsed > 0 && (
              <div
                className={checkoutStyles.summaryRow}
                style={{ color: "#40C4AA" }}
              >
                <span>Credit Applied</span>
                <span>-${state.cartResults.creditUsed.toFixed(2)}</span>
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
            <div className={checkoutStyles.summaryRow}>
              <span>Tip</span>
              <span>
                ${(state.cartResults.totalPrice * tipPercent).toFixed(2)}
              </span>
            </div>
            {restaurant && (
              <div className={checkoutStyles.summaryRow}>
                <div className="relative flex w-full bg-gray-100 rounded-full border border-gray-300">
                  {/* Animated highlight */}
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute inset-0 rounded-full z-0"
                    style={{
                      left: `${
                        (tipAmounts.indexOf(tipPercent) / tipAmounts.length) *
                        100
                      }%`,
                      width: `${100 / tipAmounts.length}%`,
                      background: restaurant?.metadata.primaryColor
                        ? `linear-gradient(45deg, 
        ${adjustColor(restaurant.metadata.primaryColor as string, -30)},
        ${adjustColor(restaurant.metadata.primaryColor as string, 40)}
      )`
                        : undefined,
                    }}
                  />

                  {tipAmounts.map((tip) => (
                    <button
                      key={tip}
                      onClick={() => {
                        setTipPercent(tip);
                      }}
                      className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors 
                      ${tipPercent === tip ? "text-white" : "text-gray-600"}`}
                    >
                      {tip * 100}%
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div
              className={checkoutStyles.summaryTotal}
              style={{ marginTop: 20 }}
            >
              <span className="font-bold">Total</span>
              <span className="font-bold">
                ${(state.cartResults.totalPrice * (1 + tipPercent)).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {state.cart.length > 0 && (
          <div className={checkoutStyles.paymentContainer}>
            {userSession ? (
              state.token &&
              state.cartResults && (
                <ApplePayButton
                  payload={{
                    userAccessToken: userSession.access_token,
                    restaurant_id: restaurant?.id,
                    state: state,
                    totalWithTip: Math.round(
                      state.cartResults.totalPrice * (1 + tipPercent) * 100
                    ),
                    connectedAccountId: restaurant?.stripe_account_id,
                  }}
                  sanityCheck={refreshCart}
                  clearCart={clearCart}
                />
              )
            ) : (
              <SignInButton onClose={() => {}} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
