import { useState, useRef, useEffect, useReducer } from "react";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { checkoutStyles } from "../styles/checkout_styles";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSupabase } from "../context/supabase_context.tsx";
import { useAuth } from "../context/auth_context.tsx";
import { isEqual, rest, update } from "lodash";
import { usePersistState } from "../hooks/usePersistState.tsx";
import ApplePayButton from "../components/apple_pay_button.tsx";
import {
  NORMAL_DEAL_TAG,
  PASS_TAG,
  RESTAURANT_PATH,
  SIGNIN_PATH,
} from "../constants.ts";
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
import { ToastContainer, toast } from "react-toastify";
import { CheckoutItemCard } from "@/components/checkout/checkout_item_card.tsx";
import AccessCardSlider from "./access_card_slider.tsx";
import { priceCartNormally } from "@/utils/pricer.ts";
import DealPreOrderBar from "@/components/checkout/deal_checkout_bar.tsx";
import TipSelector from "@/components/checkout/tip_selector.tsx";

const reducer = (state, action) => {
  return { ...state, ...action };
};

export default function CheckoutPage() {
  const { userSession, setShowSignInModal } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const navigate = useNavigate();
  const { id: restaurant_id } = useParams<{ id: string }>();
  const cartManager = useRef<CartManager | null>(null);
  const [tipPercent, setTipPercent] = useState<number>(0.2);

  const initialState = {
    cart: [],
    dealEffect: emptyDealEffect,
    selectedPolicy: null,
    cartResults: null,
    errorDisplay: null,
    token: null,
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
    let result = null;
    if (!isEqual(policy, state.selectedPolicy)) {
      result = await cartManager.current?.setPolicy(policy);
    } else {
      result = await cartManager.current?.setPolicy(null);
    }
    if (result) {
      toast(result, {
        className: "bg-red-500 text-white",
        progressClassName: "bg-red-700",
      });
    } else {
      toast("Deal added to cart.", {
        className: "bg-green-500 text-white",
        progressClassName: "bg-green-700",
      });
    }
    dispatch(cartManager.current?.getCartState());
  };

  const sanityCheck = async (): Promise<string | null> => {
    return await cartManager.current?.refresh();
  };

  const updateItem = async (
    itemKey: number,
    updatedFields: Partial<CartItem>
  ) => {
    const result = await cartManager.current?.updateItem(
      itemKey,
      updatedFields
    );
    if (result) {
      toast(result, {
        className: "bg-red-500 text-white",
        progressClassName: "bg-red-700",
      });
    } else {
      toast("Item added to cart.", {
        className: "bg-green-500 text-white",
        progressClassName: "bg-green-700",
      });
    }
    dispatch(cartManager.current?.getCartState());
  };

  const addToCart = async (item: Item) => {
    await cartManager.current?.addToCart(item, restaurant);
    dispatch(cartManager.current?.getCartState());
  };

  const removeFromCart = async (
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
      {/* <button
        className="w-10 h-10 mb-8 bg-gray-700/50 rounded-full flex items-center justify-center"
        onClick={() => {
          navigate(RESTAURANT_PATH.replace(":id", restaurant_id));
        }}
      >
        <ChevronLeft className="w-7 h-7 text-white" />
      </button>

      {restaurant && (
        <div className="mb-4">
          <h1 className={checkoutStyles.pageTitle}>Checkout</h1>
        </div>
      )} */}

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
        />
      )}

      {restaurant && state.cart.length > 0 ? (
        <div className={checkoutStyles.itemsContainer}>
          {state.cart
            .filter((item: CartItem) => item.item.path[0] !== "passes")
            .map((item: CartItem) => (
              <CheckoutItemCard
                key={item.id} // assuming item has a unique id
                item={item}
                restaurant={restaurant}
                dealEffect={state.dealEffect}
                updateItem={updateItem}
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

      {rendering}

      <div className="bg-white mt-8">
        {/* Rail Drinks Carousel */}

        {/* Save More Section */}
        <div className="overflow-x-auto pb-2 no-scrollbar mb-4">
          <h2 className="text-2xl font-bold mb-4">Save More</h2>
          <div className="flex gap-2 whitespace-nowrap">
            {policies
              .filter(
                (policy) =>
                  policy.definition.tag === NORMAL_DEAL_TAG ||
                  policy.definition.tag === PASS_TAG
              )
              .map((policy) => (
                <PolicyCard policy={policy} key={policy.policy_id} />
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
                style={{ color: "red" }}
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
            {/* <div className={checkoutStyles.summaryRow}>
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
            </div> */}
            {restaurant && (
              <TipSelector
                restaurant={restaurant}
                cart={state.cart}
                setTip={setTipPercent}
              />
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
        {/* <button
          onClick={() => {
            console.log(state);
          }}
        >
          test
        </button> */}
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
                    cart: state.cart,
                    userDealEffect: state.dealEffect,
                    userPolicy: state.selectedPolicy,
                    userCartResults: state.cartResults,
                    token: state.token,
                    totalWithTip: Math.round(
                      state.cartResults.totalPrice * (1 + tipPercent) * 100
                    ),
                    connectedAccountId: restaurant?.stripe_account_id,
                  }}
                  sanityCheck={sanityCheck}
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
      <ToastContainer />
    </div>
  );
}
