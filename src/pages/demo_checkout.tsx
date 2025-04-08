import { useState, useRef, useEffect, useReducer } from "react";
import { ArrowLeft, Check, ChevronLeft, X } from "lucide-react";
import { checkoutStyles } from "../styles/checkout_styles";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSupabase } from "../context/supabase_context.tsx";
import { useAuth } from "../context/auth_context.tsx";
import { isEqual, rest, update } from "lodash";
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
import PolicyCard from "@/components/cards/shad_policy_card.tsx";
import { ToastContainer, toast } from "react-toastify";
import { CheckoutItemCard } from "@/components/checkout/checkout_item_card.tsx";
import AccessCardSlider from "./access_card_slider.tsx";
import {
  getMenuItemFromPath,
  priceCartNormally,
  priceItem,
} from "@/utils/pricer.ts";
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
import { itemToStringDescription } from "@/utils/parse.ts";
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
  } = useCartManager(restaurant as Restaurant, userSession);

  useEffect(() => {
    const initPolicyManager = async () => {
      const policyManager = new PolicyManager(restaurant_id as string);
      await policyManager.init();
      setPolicyManager(policyManager);
    };
    initPolicyManager();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const restaurant = await fetchRestaurantById(restaurant_id);
      if (!restaurant) {
        navigate(DISCOVER_PATH);
        return;
      }
      const policies = await fetch_policies(restaurant_id);
      setPolicies(policies);
      setRestaurant(restaurant);
    };
    fetch();
    start();
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
            .filter((item: CartItem) => item.item.path[0] !== PASS_MENU_TAG)
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
        {getActivePolicies().map((policyId) => {
          const policy = policies.find((p) => p.policy_id === policyId);
          if (!policy || policy.definition.tag !== NORMAL_DEAL_TAG) return null;
          return (
            <button
              key={policyId}
              onClick={async () => {
                await removePolicy(policy);
              }}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm flex items-center gap-1"
            >
              <span>{titleCase(policy.name)}</span>
              <X className="text-gray-500 h-4 w-4" />
            </button>
          );
        })}
      </div>
      {restaurant && policyManager && state.cart.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold mb-4">
              Exclusive Pre-entry Deals
            </h2>
            <div className="text-md text-red-600 mb-4">
              {policyManager.getAddOns(state.cart).allAddOns.length > 0 &&
              addOnTime > 0 ? (
                <span>
                  {Math.floor(addOnTime / 60)}:
                  {(addOnTime % 60).toString().padStart(2, "0")} left to claim
                </span>
              ) : (
                <span className="text-red-500">Expired</span>
              )}
            </div>
          </div>
          <div className="overflow-x-auto pb-2 no-scrollbar">
            <div className="flex gap-2" style={{ minWidth: "max-content" }}>
              {addOnTime > 0 &&
                policyManager
                  .getAddOns(state.cart)
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
          <div>
            {policyManager.getAddOns(state.cart).passAddOns.map((policy) => (
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

      <div className="bg-white mt-8">
        {/* Rail Drinks Carousel */}

        {/* Save More Section */}
        <div className="overflow-x-auto pb-2 no-scrollbar mb-4">
          <h2 className="text-2xl font-bold mb-4">Save More</h2>
          <div className="flex gap-2 whitespace-nowrap">
            {policies
              .filter((policy) => policy.definition.tag === NORMAL_DEAL_TAG)
              .map((policy) => (
                <DealCard
                  policy={policy}
                  restaurant={restaurant}
                  primaryColor={restaurant?.metadata.primaryColor}
                  setPolicy={setPolicy}
                  setIsOpen={setIsOpen}
                />
              ))}
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4">Payment</h2>
        <DealPreOrderBar
          policy={state.selectedPolicy}
          restaurant={restaurant}
        />
        {state.cart.length > 0 && state.cartResults && (
          <div className={checkoutStyles.summaryContainer}>
            <div className={checkoutStyles.summaryRow}>
              <span>Subtotal</span>
              <span>${state.cartResults.subtotal.toFixed(2)}</span>
            </div>
            {state.selectedPolicy && restaurant && (
              <div
                className={checkoutStyles.summaryRow}
                style={{ color: "#40C4AA" }}
              >
                <span>Discounts</span>
                <span>
                  -$
                  {(
                    priceCartNormally(state.cart, restaurant) -
                    state.cartResults.subtotal
                  ).toFixed(2)}
                </span>
              </div>
            )}
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
        <button
          onClick={() => {
            const addOns = policyManager.getAddOns(state.cart);
          }}
        >
          Get Add Ons
        </button>
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
      </div>
      {policy && (
        <PolicyModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          policy={policy as Policy}
          restaurant={restaurant as Restaurant}
          onAddToCart={addPolicy}
          cart={state.cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
        />
      )}
      <ToastContainer />
    </div>
  );
}

interface PassAddOnCardProps {
  addPolicy: (policy: Policy) => void;
  restaurant: Restaurant;
  policy: Policy;
  state;
}

const PassAddOnCard: React.FC<PassAddOnCardProps> = ({
  state,
  addPolicy,
  restaurant,
  policy,
}) => {
  if (policy.definition.action.type !== "apply_add_on") {
    return null;
  }
  const item = {
    path: policy.definition.action.items[0],
    modifiers: [],
  };
  const menuItem = getMenuItemFromPath(item.path, restaurant);
  const name = itemToStringDescription(item);
  const originalPrice = menuItem?.price;
  const newPrice = Math.max(0, originalPrice - policy.definition.action.amount);
  // Get policy IDs from all deal effect sources
  const policyIds = [
    // From modified items
    ...state.dealEffect.modifiedItems.map((item) => item.policy_id),
    // From added items
    ...state.dealEffect.addedItems.map((item) => item.policy_id),
    // From whole cart modifications
    state.dealEffect.wholeCartModification?.policy_id,
  ].filter((id): id is string => id !== undefined);

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-300 bg-white">
      {/* Checkbox */}
      {policyIds.includes(policy.policy_id) ? (
        <div
          className="mt-1 w-5 h-5 rounded border flex items-center justify-center"
          style={{
            backgroundColor: restaurant.metadata.primaryColor,
            borderColor: restaurant.metadata.primaryColor,
          }}
        >
          <Check className="w-3 h-3 text-white" />
        </div>
      ) : (
        <button
          onClick={() => addPolicy(policy)}
          className="mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors bg-white border-gray-300 hover:border-indigo-500"
        />
      )}

      {/* Content */}
      <div className="flex-1">
        {/* Exclusive Badge */}
        <div
          className="inline-block text-white text-xs font-semibold rounded px-2 py-1 mb-1"
          style={{ backgroundColor: restaurant.metadata.primaryColor }}
        >
          EXCLUSIVE (SAVE ${originalPrice - newPrice})
        </div>

        {/* Title / Price */}
        <h3 className="text-lg font-bold text-gray-900">
          Add {name} (+${newPrice.toFixed(2)})
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mt-1">
          Valued at ${originalPrice.toFixed(2)}. Enjoy this temporary offer
          before it expires! Redeem after purchase.
        </p>
      </div>
    </div>
  );
};
