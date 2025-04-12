import { useState, useRef, useEffect, useReducer } from "react";
import { ArrowLeft, Check, ChevronLeft, Tag, X } from "lucide-react";
import { checkoutStyles } from "../styles/checkout_styles";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/auth_context.tsx";
import ApplePayButton from "../components/apple_pay_button.tsx";
import {
  NORMAL_DEAL_TAG,
  PASS_MENU_TAG,
  RESTAURANT_PATH,
  SIGNIN_PATH,
} from "../constants.ts";
import { CartItem, Policy, Restaurant, Item } from "../types.ts";
import { DISCOVER_PATH } from "../constants.ts";
import { fetch_policies } from "../utils/queries/policies.ts";
import { fetchRestaurantById } from "../utils/queries/restaurant.ts";
import { CheckoutItemCard } from "@/components/checkout/checkout_item_card.tsx";
import AccessCardSlider from "../components/sliders/access_card_slider.tsx";
import { priceCartNormally } from "@/utils/pricer.ts";
import DealPreOrderBar from "@/components/checkout/deal_checkout_bar.tsx";
import TipSelector from "@/components/checkout/tip_selector.tsx";
import { motion } from "framer-motion";
import { titleCase } from "title-case";
import { useCartManager } from "@/hooks/useCartManager.tsx";
import { PolicyManager } from "@/utils/policy_manager.ts";
import AddOnCard from "@/components/cards/add_on_card.tsx";
import { useTimer } from "@/hooks/useTimer.tsx";
import DealCard from "@/components/cards/small_policy.tsx";
import PolicyModal from "@/components/bottom_sheets/policy_modal.tsx";
import { PassAddOnCard } from "@/components/cards/pass_add_on_card.tsx";
import { ItemUtils } from "@/utils/item_utils.ts";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Alert } from "@/components/display_utils/alert.tsx";
export default function CheckoutPage() {
  const { userSession, setShowSignInModal } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const navigate = useNavigate();
  const { id: restaurant_id } = useParams<{ id: string }>();
  if (!restaurant_id) {
    navigate(DISCOVER_PATH);
  }
  const [tipPercent, setTipPercent] = useState<number>(0.2);
  const tipAmounts = [0.1, 0.15, 0.2];
  const [policyManager, setPolicyManager] = useState<PolicyManager | null>(
    null
  );
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
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
  } = useCartManager(restaurant as Restaurant, userSession);

  useEffect(() => {
    const fetch = async () => {
      const restaurant = await fetchRestaurantById(restaurant_id);
      if (!restaurant) {
        navigate(DISCOVER_PATH);
        return;
      }
      const policyManager = new PolicyManager(restaurant as Restaurant);
      await policyManager.init();
      setPolicyManager(policyManager);
      setRestaurant(restaurant);
    };
    fetch();
    // start();
  }, []);

  return (
    <div className={checkoutStyles.pageContainer}>
      <div className="relative flex items-center justify-center mb-6">
        {/* Back Button */}
        <button
          className="absolute left-0 w-9 h-9 bg-black/10 rounded-full flex items-center justify-center"
          onClick={() => {
            navigate(RESTAURANT_PATH.replace(":id", restaurant_id));
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
          policyManager.getActivePolicies(state.dealEffect).map((policy) => {
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
          {policyManager.getAddOns(state.cart, state.dealEffect).allAddOns
            .length > 0 && (
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
                  .getAddOns(state.cart, state.dealEffect)
                  .normalAddOns.map((policy) => (
                    <AddOnCard
                      state={state}
                      policy={policy}
                      restaurant={restaurant}
                      key={policy.policy_id}
                      addPolicy={async () => {
                        await addPolicy(policy);
                        pause();
                      }}
                    />
                  ))}
            </div>
          </div>
          <div className="mt-2">
            {policyManager
              .getAddOns(state.cart, state.dealEffect)
              .passAddOns.map((policy) => (
                <PassAddOnCard
                  state={state}
                  addPolicy={addPolicy}
                  restaurant={restaurant as Restaurant}
                  policy={policy as Policy}
                />
              ))}
          </div>
        </div>
      )}

      {policyManager &&
        policyManager.getRecommendedDeals(state.cart, state.dealEffect).length >
          0 && (
          <div className="bg-white mt-6">
            <div className="overflow-x-auto pb-2 no-scrollbar mb-4">
              <h2 className="text-2xl font-bold mb-4">Save More</h2>
              <div className="flex gap-2 whitespace-nowrap">
                {policyManager
                  .getRecommendedDeals(state.cart, state.dealEffect)
                  .map((policy) => (
                    <DealCard
                      key={policy.policy_id}
                      cart={state.cart}
                      policy={policy}
                      restaurant={restaurant as Restaurant}
                      primaryColor={restaurant?.metadata.primaryColor}
                      setPolicy={setPolicy}
                      setIsOpen={setIsOpen}
                      dealEffect={state.dealEffect}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

      <h2 className="text-2xl font-bold mb-2 mt-6">Payment</h2>
      <DealPreOrderBar
        policy={
          policyManager
            ?.getActivePolicies(state.dealEffect)
            .filter((p) => p.definition.tag === NORMAL_DEAL_TAG)[0] || null
        }
        restaurant={restaurant as Restaurant}
      />
      {state.cart.length > 0 && state.cartResults && (
        <div className={checkoutStyles.summaryContainer}>
          {priceCartNormally(state.cart, restaurant as Restaurant) -
            state?.cartResults?.subtotal >
            0 && (
            <div
              className={checkoutStyles.summaryRow}
              style={{ color: "#40C4AA" }}
            >
              <span>Discounts</span>
              <span>
                -$
                {(
                  priceCartNormally(state.cart, restaurant as Restaurant) -
                  state.cartResults.subtotal
                ).toFixed(2)}
              </span>
            </div>
          )}
          {state.cartResults.totalPointCost > 0 && (
            <div className={checkoutStyles.summaryRow}>
              <span>Point Cost</span>
              <span>-{state.cartResults.totalPointCost} points</span>
            </div>
          )}
          {state.cartResults.totalPoints > 0 && (
            <div
              className={checkoutStyles.summaryRow}
              style={{ color: "#40C4AA" }}
            >
              <span>Points</span>
              <span>+{state.cartResults.totalPoints} points</span>
            </div>
          )}
          <div className={checkoutStyles.summaryRow}>
            <span>Subtotal</span>
            <span>${state.cartResults.subtotal.toFixed(2)}</span>
          </div>
          <div className={checkoutStyles.summaryRow}>
            <span>Tax</span>
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
              <div className="relative flex w-full bg-gray-100 rounded-full p-1 border border-gray-200">
                {/* Animated highlight */}
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute top-1 bottom-1 bg-yellow-400 rounded-full z-0"
                  style={{
                    left: `${
                      (tipAmounts.indexOf(tipPercent) / tipAmounts.length) *
                        100 +
                      (100 / tipAmounts.length) * 0.15
                    }%`,
                    width: `${(100 / tipAmounts.length) * 0.7}%`,
                    backgroundColor: restaurant.metadata.primaryColor,
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
      {state.errorDisplay}

      {state.cart.length > 0 && (
        <div className={checkoutStyles.paymentContainer}>
          {userSession ? (
            state.token &&
            state.cartResults &&
            state.cartResults.totalPrice > 0 && (
              <ApplePayButton
                payload={{
                  user_id: userSession.user.phone,
                  restaurant_id: restaurant_id,
                  state: state,
                  totalWithTip: Math.round(
                    state.cartResults.totalPrice * (1 + tipPercent) * 100
                  ),
                  connectedAccountId: restaurant?.stripe_account_id,
                }}
                sanityCheck={refreshCart}
              />
            )
          ) : (
            <div className="mt-6 flex justify-between items-center text-black bg-[#F5B14C] p-2 rounded-md">
              <button
                className="text-black"
                onClick={() => {
                  setShowSignInModal(true);
                }}
              >
                Sign In
              </button>
              <span className="text-gray-600">Purchase by Signing In</span>
            </div>
          )}
        </div>
      )}

      {policy && (
        <PolicyModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          policy={policy as Policy}
          restaurant={restaurant as Restaurant}
          onAddToCart={addPolicy}
          state={state}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
        />
      )}
    </div>
  );
}
