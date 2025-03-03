import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, CreditCard, DollarSign } from "lucide-react";
import { checkoutStyles } from "../styles/checkout_styles";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSupabase } from "../context/supabase_context.tsx";
import { useAuth } from "../context/auth_context.tsx";
import SearchBar from "../components/rotating_searchbar.tsx";
import { CheckoutLineItem } from "../components/checkout/checkout_line_item.tsx";
import { isEqual, update } from "lodash";
import { usePersistState } from "../hooks/usePersistState.tsx";
import ApplePayButton from "../components/apple_pay_button.tsx";
import {
  RESTAURANT_PATH,
  SIGNIN_PATH,
  TEST_MODE,
  TEST_TAX_RATE,
  TEST_USER_SESSION,
} from "../constants.ts";
import {
  Cart,
  CartItem,
  Policy,
  DealEffectPayload,
  Transaction,
  User,
  VerifyOrderPayload,
  CartResultsPayload,
  Restaurant,
} from "../types.ts";
import { DISCOVER_PATH, QR_CODE_PATH } from "../constants.ts";
import { emptyDealEffect } from "../constants.ts";
import { useDealDisplay } from "../components/checkout/deal_display.tsx";
import { fetch_policies } from "../utils/queries/policies.ts";
import { fetchRestaurantById } from "../utils/queries/restaurant.ts";
import { PolicyCard } from "../components/cards/policy_card.tsx";
import { supabase_local } from "@/utils/supabase_client.ts";

interface LineItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const {
    userSession,
    transactions,
    setTransactions,
    setUserData,
    userData,
    loadingUser,
  } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const location = useLocation();
  const supabase = useSupabase();
  const navigate = useNavigate();
  const { id: restaurant_id } = useParams<{ id: string }>();
  const [cart, setCart, clearCart] = usePersistState<Cart>(
    [],
    restaurant_id + "_cart"
  );
  const [dealEffect, setDealEffect] =
    useState<DealEffectPayload>(emptyDealEffect);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(
    location.state?.policy
  );

  const [cartResults, setCartResults] = useState<CartResultsPayload | null>();
  const [errorDisplay, setErrorDisplay] = useState<string | null>();
  const token = useRef();
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetch = async () => {
      const restaurant = await fetchRestaurantById(restaurant_id);
      const policies = await fetch_policies(restaurant_id);
      setPolicies(policies);
      setRestaurant(restaurant);
    };
    if (!restaurant_id) {
      //navigate to error page
      navigate(DISCOVER_PATH);
    } else {
      fetch();
    }
  }, []);

  useEffect(() => {
    if (!loadingUser) {
      if (!hasFetched.current && cart.length > 0) {
        verify_order();
      }
    }
  }, [cart, dealEffect, selectedPolicy, loadingUser, userData]);

  const removeItem = (id: number) => {
    const updatedCart = cart.filter((item: CartItem) => item.id !== id);
    setCart(updatedCart);
  };

  const get_user_session = () => {
    return userSession ? userSession.user.phone : TEST_USER_SESSION.user.phone;
  };

  const verify_order = async () => {
    const payload: VerifyOrderPayload = {
      cart: cart,
      userDealEffect: dealEffect,
      policy_id: selectedPolicy?.policy_id || null,
      restaurant_id: restaurant_id as string,
      user_id: TEST_MODE
        ? TEST_USER_SESSION.user.phone
        : userSession?.user.phone,
    };
    const { data, error } = await supabase_local.functions.invoke(
      "verify_order",
      {
        body: payload,
      }
    );
    console.log("data", data, error);
    const returnData = data.data;
    const errorMessage = data.error;
    hasFetched.current = true;
    if (error) {
      console.error(error);
    }
    if (errorMessage) {
      setErrorDisplay(errorMessage);
    } else {
      setErrorDisplay("");
    }
    setSelectedPolicy(returnData.payload.policy);
    setDealEffect(returnData.payload.dealEffectPayload);
    setCart(returnData.payload.cart);
    setCartResults(returnData.payload.cartResultsPayload);
    token.current = returnData.jwtToken;
  };

  const click_policy = (policy: Policy) => {
    hasFetched.current = false;
    if (!isEqual(policy, selectedPolicy)) {
      //selecting another policy
      setSelectedPolicy(policy);
      setDealEffect(emptyDealEffect);
    } else {
      //unselecting
      setSelectedPolicy(null);
      setDealEffect(emptyDealEffect);
    }
    setCartResults(undefined);
    setErrorDisplay(null);
  };

  const add_to_cart = (order_response: Cart) => {
    hasFetched.current = false;
    setCart((prevCart) => {
      const maxId = prevCart.reduce(
        (max, item) => Math.max(max, item.id || 0), // Find the highest ID in the current cart
        0
      );

      const reassignedItems = order_response.map((item, index) => ({
        ...item,
        id: maxId + index + 1, // Assign new unique IDs
      }));

      return [...prevCart, ...reassignedItems]; // Merge the new items with the existing cart
    });
  };

  const updateItem = (itemKey: number, updatedFields: Partial<CartItem>) => {
    hasFetched.current = false;
    if (itemKey <= cart.length) {
      setCart((prevCart) => {
        // Step 1: Update items and remove items with quantity 0
        const updatedCart = prevCart
          .map((item) =>
            item.id === itemKey ? { ...item, ...updatedFields } : item
          )
          .filter((item) => item.quantity !== 0); // Remove items with quantity 0

        // Step 2: Reassign IDs in sequential order (starting from 1)
        const reassignedCart = updatedCart.map((item, index) => ({
          ...item,
          id: index + 1, // Sequential numbering from 1, 2, 3, ...
        }));

        return reassignedCart;
      });
    } else {
      setDealEffect((prev) => ({
        ...prev,
        freeAddedItems: prev.freeAddedItems.map((item) =>
          item.id === itemKey ? { ...item, ...updatedFields } : item
        ),
      }));
    }
  };
  const { rendering } = useDealDisplay(cart, dealEffect, updateItem);

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

      {cart.length > 0 ? (
        <div className={checkoutStyles.itemsContainer}>
          {cart.map((item: CartItem) => (
            <div key={item.id} className={checkoutStyles.itemContainer}>
              <div>
                <h3 className={checkoutStyles.itemName}>{item.item.name}</h3>
                <p className={checkoutStyles.itemInfo}>
                  {item.item[item.item.length - 1]}, ${item.price.toFixed(2)}{" "}
                  each
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Add Ons</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {[1].map((_, index) => (
              <div key={index} className="flex-none w-40">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col items-center">
                    {/* Drink Icon */}
                    <div className="w-12 h-12 mb-2">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="w-full h-full"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3M3 21h18M3 10h18M4 10l2 11h12l2-11"
                        />
                      </svg>
                    </div>
                    <p className="text-sm mb-2">1 x Rail Drink</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-gray-400 line-through">$10</span>
                      <span className="text-[#F5B14C] font-bold">$7</span>
                    </div>
                    <button className="bg-[#2A2F45] rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-xl text-white">+</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save More Section */}
        <div className="relative overflow-x-auto">
          <h2 className="text-2xl font-bold mb-4">Save More</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {policies
              .filter((policy) => policy.subscription_id === null)
              .map((policy, index) => (
                <div
                  key={index}
                  className="flex-none w-72"
                  onClick={() => {
                    click_policy(policy);
                  }}
                >
                  <PolicyCard
                    title={policy.name}
                    description={policy.header}
                    isLimitedTime={true}
                    expirationDate={undefined}
                    isDeal={false}
                    primaryColor="#2A2F45"
                    secondaryColor="#F5B14C"
                  />
                </div>
              ))}
          </div>
        </div>
        {cart.length > 0 && cartResults && (
          <div className={checkoutStyles.summaryContainer}>
            <div className={checkoutStyles.summaryRow}>
              <span>Subtotal</span>
              <span>${cartResults.totalPrice.toFixed(2)}</span>
            </div>
            <div className={checkoutStyles.summaryRow}>
              <span>Tax</span>
              <span>
                ${(cartResults.totalPrice * TEST_TAX_RATE).toFixed(2)}
              </span>
            </div>
            <div className={checkoutStyles.summaryTotal}>
              <span>Total</span>
              <span>
                $
                {(
                  cartResults.totalPrice +
                  cartResults.totalPrice * TEST_TAX_RATE
                ).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {cart.length > 0 && cartResults && (
          <div className={checkoutStyles.paymentContainer}>
            {userSession || TEST_MODE ? (
              cartResults && (
                <ApplePayButton
                  payload={{
                    user_id: TEST_MODE
                      ? TEST_USER_SESSION.user.phone
                      : userSession.user.phone,
                    restaurant_id: restaurant_id,
                    cart: cart,
                    userDealEffect: dealEffect,
                    userPolicy: selectedPolicy,
                    userCartResults: cartResults,
                    token: token.current,
                    metadata: { restaurantName: restaurant?.name },
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
