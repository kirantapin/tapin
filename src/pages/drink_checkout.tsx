import React, { useRef } from "react";
import { useEffect, useState, useContext } from "react";
import { useRestaurantData } from "../context/restaurant_context.tsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSupabase } from "../context/supabase_context.tsx";
import { useAuth } from "../context/auth_context.tsx";
import SearchBar from "../components/rotating_searchbar.tsx";
import { CheckoutLineItem } from "../components/checkout/checkout_line_item.tsx";
import { isEqual } from "lodash";
import { usePersistState } from "../hooks/usePersistState.tsx";
import ApplePayButton from "../components/apple_pay_button.tsx";

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

export const DrinkCheckout = ({}) => {
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
    location.state?.cart || [],
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
      if (!hasFetched.current) {
        verify_order();
      }
    }
  }, [cart, dealEffect, selectedPolicy, loadingUser, userData]);

  const removeItem = (id: number) => {
    const updatedCart = cart.filter((item: CartItem) => item.id !== id);
    setCart(updatedCart);
  };

  const verify_order = async () => {
    const payload: VerifyOrderPayload = {
      cart: cart,
      userDealEffect: dealEffect,
      policy_id: selectedPolicy?.policy_id || null,
      restaurant_id: restaurant_id as string,
      user_id: userData?.id || null,
    };
    const { data, error } = await supabase.functions.invoke("verify_order", {
      body: payload,
    });
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

  // const purchase_drink = async () => {
  //   //things you need customer_id,restaurant_id,item,policy_id
  //   const payload = {
  //     user_id: userSession ? userSession.phone : null,
  //     restaurant_id: restaurant_id,
  //     cart: cart,
  //     userDealEffect: dealEffect,
  //     userPolicy: selectedPolicy,
  //     userCartResults: cartResults,
  //     token: token.current,
  //   };

  //   try {
  //     const { data, error } = await supabase.functions.invoke("submit_order", {
  //       body: payload,
  //     });
  //     clearCart();
  //     if (error || !data)
  //       throw new Error("created transaction came back as null");
  //     //transaction is good we need to store this locally somewhere
  //     const { transactions, modifiedUserData } = data as {
  //       transactions: Transaction[];
  //       modifiedUserData: User;
  //     };

  //     if (modifiedUserData) {
  //       setUserData(modifiedUserData);
  //     }
  //     if (!transactions || transactions?.length == 0) {
  //       throw new Error("No transactions received or created");
  //     } else {
  //       setTransactions((prevTransactions) => [
  //         ...prevTransactions,
  //         ...transactions,
  //       ]);

  //       navigate(`/restaurant/${restaurant_id}/qrcode`, {
  //         state: {
  //           transactions: transactions.filter(
  //             (transaction) => !isEqual(transaction.metadata, {})
  //           ),
  //         },
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

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

  const test = () => {
    console.log(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
  };

  const updateItem = (itemKey: number, updatedFields: Partial<CartItem>) => {
    console.log(itemKey, cart.length);
    console.log(dealEffect);
    console.log(updatedFields);
    hasFetched.current = false;
    if (itemKey < cart.length) {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemKey ? { ...item, ...updatedFields } : item
        )
      );
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
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <button
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={() => {
          navigate(`/demo2/${restaurant_id}`);
        }}
      >
        Go back
      </button>
      <ul style={{ listStyle: "none", padding: 10, margin: 10 }}>
        <h3>Cart</h3>
        {cart &&
          cart.map((item: CartItem) => (
            <li
              key={item.id}
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <CheckoutLineItem
                item={item}
                onUpdate={updateItem}
                lockedFields={[]}
              />
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </li>
          ))}
        {rendering}
        <br />
      </ul>
      <ul style={{ listStyle: "none", padding: 10, margin: 10 }}>
        {policies.map((policy, index) => (
          <li
            key={index}
            onClick={() => click_policy(policy)}
            style={{
              backgroundColor:
                selectedPolicy?.policy_id === policy.policy_id
                  ? "#007bff"
                  : "transparent",
              cursor: "pointer",
              padding: "10px",
            }}
          >
            {policy.name}
          </li>
        ))}
      </ul>
      <div style={{ color: "red" }}>{errorDisplay}</div>
      <br />
      Price:{cartResults?.totalPrice}
      <br />
      Points:{cartResults?.totalPoints}
      <br />
      Point Cost:{cartResults?.totalPointCost}
      <br />
      <SearchBar action={add_to_cart} restaurant_id={restaurant_id as string} />
      {!userData && (
        <div>
          Sign in with phone number to access deals and receive points with
          every order
        </div>
      )}
      <button onClick={test}>Test</button>
      {token.current && userData && cartResults && (
        <div>
          {/* <button
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={purchase_drink}
          >
            Purchase Drink
          </button> */}
          <ApplePayButton
            payload={{
              user_id: userSession ? userSession.phone : null,
              restaurant_id: restaurant_id,
              cart: cart,
              userDealEffect: dealEffect,
              userPolicy: selectedPolicy,
              userCartResults: cartResults,
              token: token.current,
              metadata: { restaurantName: restaurant?.name },
            }}
          />
        </div>
      )}
    </div>
  );
};
