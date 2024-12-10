import React, { useRef } from "react";
import { useEffect, useState, useContext } from "react";
import { useRestaurantData } from "../context/restaurant_context.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useSupabase } from "../context/supabase_context.tsx";
import { useAuth } from "../context/auth_context.tsx";
import SearchBar from "../components/rotating_searchbar.tsx";
import { CheckoutLineItem } from "../components/checkout_line_item.tsx";
// import { DealDisplay } from "../components/deal_display.tsx";
import {
  Cart,
  CartItem,
  Policy,
  DealEffectPayload,
  Transaction,
  User,
  VerifyOrderPayload,
  CartResultsPayload,
} from "../types.ts";
import { QR_CODE_PATH } from "../constants.ts";
import { emptyDealEffect } from "../constants.ts";
import { useDealDisplay } from "../components/deal_display.tsx";
import { error } from "console";

export const DrinkCheckout = ({}) => {
  const location = useLocation();

  const {
    userSession,
    transactions,
    setTransactions,
    setUserData,
    userData,
    setLocalTransactions,
    loadingUser,
  } = useAuth();
  const { policies, loadingRestaurantData } = useRestaurantData();
  const supabase = useSupabase();
  const navigate = useNavigate();

  const [cart, setCart] = useState<Cart>(location.state?.cart);
  const [dealEffect, setDealEffect] =
    useState<DealEffectPayload>(emptyDealEffect);
  const restaurant = location.state?.restaurant;
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(
    location.state?.policy
  );

  const hasFetched = useRef(false);
  const [cartResults, setCartResults] = useState<CartResultsPayload>();
  const [errorDisplay, setErrorDisplay] = useState<string | null>();
  const token = useRef();

  useEffect(() => {
    if (!loadingUser && !loadingRestaurantData) {
      if (!hasFetched.current) {
        verify_order();
      }
    }
  }, [
    cart,
    dealEffect,
    selectedPolicy,
    loadingUser,
    userData,
    loadingRestaurantData,
    restaurant,
  ]);

  const verify_order = async () => {
    const payload: VerifyOrderPayload = {
      cart: cart,
      dealEffectPayload: dealEffect,
      policy_id: selectedPolicy?.policy_id || null,
      restaurant_id: restaurant.id,
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

    setDealEffect(returnData.payload.dealEffectPayload);
    setCart(returnData.payload.cart);
    setCartResults(returnData.payload.cartResultsPayload);
    token.current = returnData.jwtToken;
    console.log(token.current);
  };

  const click_policy = (policy: Policy) => {
    hasFetched.current = false;
    setDealEffect(emptyDealEffect);
    setSelectedPolicy(policy);
  };

  const purchase_drink = async () => {
    //things you need customer_id,restaurant_id,item,policy_id
    const payload = {
      user_id: userSession ? userSession.phone : null,
      restaurant_id: restaurant.id,
      cart: cart,
      userDealEffect: dealEffect,
      userPolicy: selectedPolicy,
      userCartResults: cartResults,
      token: token.current,
    };

    try {
      const { data, error } = await supabase.functions.invoke("submit_order", {
        body: payload,
      });
      if (error || !data)
        throw new Error("created transaction came back as null");
      //transaction is good we need to store this locally somewhere
      const { transactions, modifiedUserData } = data as {
        transactions: Transaction[];
        modifiedUserData: User;
      };

      if (modifiedUserData) {
        setUserData(modifiedUserData);
      }
      if (!transactions || transactions?.length == 0) {
        throw new Error("No transactions received or created");
      } else {
        if (!userSession) {
          setLocalTransactions((prev) => [...prev, ...transactions]);
        }
        setTransactions((prevTransactions) => [
          ...prevTransactions,
          ...transactions,
        ]);

        navigate(QR_CODE_PATH, {
          state: { transactions: transactions },
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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

  const test = () => {
    console.log(cart);
    console.log(dealEffect);
    console.log(token.current);
  };

  const updateItem = (itemKey: number, updatedFields: Partial<CartItem>) => {
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
      <ul style={{ listStyle: "none", padding: 10, margin: 10 }}>
        Cart
        {cart &&
          cart.map((item: CartItem, index: number) => (
            <li key={index}>
              <CheckoutLineItem
                item={item}
                onUpdate={updateItem}
                lockedFields={[]}
              />
            </li>
          ))}
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
                  ? "orange"
                  : "transparent",
              cursor: "pointer",
              padding: "10px",
            }}
          >
            {policy.name}
          </li>
        ))}
      </ul>
      {errorDisplay}
      {rendering}
      <br />
      Price:{cartResults?.totalPrice}
      <br />
      Points:{cartResults?.totalPoints}
      <br />
      Point Cost:{cartResults?.totalPointCost}
      <br />
      <SearchBar action={add_to_cart} restaurant={restaurant} />
      {!userData && (
        <div>
          Sign in with phone number to access deals and receive points with
          every order
        </div>
      )}
      <button onClick={test}>Test</button>
      {token.current && (
        <button onClick={purchase_drink}>Purchase Drink</button>
      )}
    </div>
  );
};
