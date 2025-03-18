import { useState, useRef, useEffect, useReducer } from "react";
import { ArrowLeft } from "lucide-react";
import { checkoutStyles } from "../styles/checkout_styles";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSupabase } from "../context/supabase_context.tsx";
import { useAuth } from "../context/auth_context.tsx";
import { isEqual } from "lodash";
import { usePersistState } from "../hooks/usePersistState.tsx";
import ApplePayButton from "../components/apple_pay_button.tsx";
import { RESTAURANT_PATH, SIGNIN_PATH } from "../constants.ts";
import {
  Cart,
  CartItem,
  Policy,
  DealEffectPayload,
  VerifyOrderPayload,
  CartResultsPayload,
  Restaurant,
} from "../types.ts";
import { DISCOVER_PATH } from "../constants.ts";
import { emptyDealEffect } from "../constants.ts";
import { useDealDisplay } from "../components/checkout/deal_display.tsx";
import { fetch_policies } from "../utils/queries/policies.ts";
import { fetchRestaurantById } from "../utils/queries/restaurant.ts";
import PolicyCard from "@/components/cards/shad_policy_card.tsx";
import { supabase_local } from "@/utils/supabase_client.ts";
import { itemToStringDescription } from "@/utils/parse.ts";
import { CartManager } from "@/utils/cartManager.ts";

const reducer = (state, action) => {
  return { ...state, ...action };
};

export default function CheckoutPage() {
  const { userSession, userData, loadingUser } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const location = useLocation();
  const supabase = useSupabase();
  const navigate = useNavigate();
  const { id: restaurant_id } = useParams<{ id: string }>();
  // const [cart, setCart, clearCart] = usePersistState<Cart>(
  //   [],
  //   restaurant_id + "_cart"
  // );
  const cartManager = useRef<CartManager | null>(null);

  const token = useRef();
  const hasFetched = useRef(false);

  const [tipPercent, setTipPercent] = useState<number>(0.2);

  const initialState = {
    cart: [],
    dealEffect: emptyDealEffect,
    selectedPolicy: null,
    cartResults: null,
    errorDisplay: null,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetch = async () => {
      const restaurant = await fetchRestaurantById(restaurant_id);
      const policies = await fetch_policies(restaurant_id);
      setPolicies(policies);
      setRestaurant(restaurant);
    };
    restaurant_id ? fetch() : navigate(DISCOVER_PATH);
  }, []);

  useEffect(() => {
    const setManager = async () => {
      if (!cartManager.current || !cartManager.current.userSession) {
        cartManager.current = new CartManager(restaurant_id, userSession);
        await cartManager.current.init();
        dispatch(cartManager.current.getCartState());
      }
    };
    setManager();
  }, [userSession]);

  const click_policy = async (policy: Policy) => {
    if (!isEqual(policy, state.selectedPolicy)) {
      await cartManager.current?.setPolicy(policy);
    } else {
      await cartManager.current?.setPolicy(null);
    }
    dispatch(cartManager.current?.getCartState());
  };

  const updateItem = async (
    itemKey: number,
    updatedFields: Partial<CartItem>
  ) => {
    await cartManager.current?.updateItem(itemKey, updatedFields);
    dispatch(cartManager.current?.getCartState());
  };

  const { rendering } = useDealDisplay(
    state.cart,
    state.dealEffect,
    updateItem
  );

  return (
    <div className={checkoutStyles.pageContainer}>
      <button className="mb-8">
        <ArrowLeft
          className="w-6 h-6"
          onClick={() => {
            navigate(RESTAURANT_PATH.replace(":id", restaurant_id));
          }}
        />
      </button>

      {restaurant && (
        <div className="mb-8">
          <h1 className={checkoutStyles.pageTitle}>
            Your Order at {restaurant.name}
          </h1>
        </div>
      )}

      {state.cart.length > 0 ? (
        <div className={checkoutStyles.itemsContainer}>
          {state.cart.map((item: CartItem) => (
            <div key={item.id} className={checkoutStyles.itemContainer}>
              <div>
                <h3 className={checkoutStyles.itemName}>
                  {itemToStringDescription(item.item)}
                </h3>
                <p className={checkoutStyles.itemInfo}>
                  ${item.price.toFixed(2)} each
                </p>
              </div>
              <div className={checkoutStyles.quantityControls}>
                <button
                  className={checkoutStyles.quantityButton}
                  // onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  onClick={() =>
                    updateItem(item.id, { quantity: item.quantity - 1 })
                  }
                >
                  -
                </button>
                <span className={checkoutStyles.quantityText}>
                  {item.quantity}
                </span>
                <button
                  className={checkoutStyles.quantityButton}
                  // onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  onClick={() =>
                    updateItem(item.id, { quantity: item.quantity + 1 })
                  }
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>There are no items in your cart.</div>
      )}
      {rendering}

      <div className="bg-white mt-8">
        {/* Rail Drinks Carousel */}

        {/* Save More Section */}
        <div className="overflow-x-auto pb-2 no-scrollbar">
          <h2 className="text-2xl font-bold mb-4">Save More</h2>
          <div className="flex gap-2 whitespace-nowrap">
            {[...policies].map((policy) => (
              <PolicyCard policy={policy} key={policy.policy_id} />
            ))}
          </div>
        </div>
        {state.cart.length > 0 && state.cartResults && (
          <div className={checkoutStyles.summaryContainer}>
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
            <div className={checkoutStyles.summaryRow}>
              {[0.1, 0.15, 0.2].map((tip) => (
                <span
                  key={tip}
                  onClick={() => setTipPercent(tip)}
                  className={`px-4 py-2 cursor-pointer rounded-lg transition ${
                    tipPercent === tip ? "bg-black text-white" : "bg-gray-200"
                  }`}
                >
                  %{tip * 100}
                </span>
              ))}
            </div>
            <div className={checkoutStyles.summaryTotal}>
              <span>Total</span>
              <span>
                ${(state.cartResults.totalPrice * (1 + tipPercent)).toFixed(2)}
              </span>
            </div>
          </div>
        )}
        {state.errorDisplay}
        {state.cart.length > 0 && (
          <div className={checkoutStyles.paymentContainer}>
            {userSession ? (
              token.current &&
              state.cartResults &&
              state.cartResults.totalPrice > 0 && (
                <ApplePayButton
                  payload={{
                    user_id: userSession.user.phone,
                    restaurant_id: restaurant_id,
                    cart: state.cart,
                    userDealEffect: state.dealEffect,
                    userPolicy: state.selectedPolicy,
                    userCartResults: state.cartResults,
                    token: token.current,
                    totalWithTip: Math.round(
                      state.cartResults.totalPrice * (1 + tipPercent) * 100
                    ),
                  }}
                />
              )
            ) : (
              <div className="mt-6 flex justify-between items-center text-black bg-[#F5B14C] p-2 rounded-md">
                <button
                  className="text-black"
                  onClick={() => {
                    navigate(SIGNIN_PATH);
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
    </div>
  );
}
