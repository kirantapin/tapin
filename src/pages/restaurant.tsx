import React from "react";
import { useEffect, useState, useContext } from "react";
import { redirect, useNavigate } from "react-router-dom";
import SearchBar from "../components/rotating_searchbar.tsx";
import { useSupabase } from "../context/supabase_context";
// import { QRCodeScreen } from "../pages/qr_code";
import { useRestaurantData } from "../context/restaurant_context.tsx";
import { useAuth } from "../context/auth_context.tsx";
import { Cart, Restaurant, Policy, CartItem, Item } from "../types";
import { DRINK_CHECKOUT_PATH, QR_CODE_PATH } from "../constants.ts";
import { assignIds } from "../utils/submit_drink_order.ts";
import { fakePhoneSignIn } from "../utils/test_signin.ts";

interface RestaurantProps {
  restaurant: Restaurant;
}

const RestaurantPage: React.FC<RestaurantProps> = ({ restaurant }) => {
  // Extract restaurantId from URL parameters
  const { userSession, userData, transactions } = useAuth();
  const { policies } = useRestaurantData();
  const navigate = useNavigate();
  const supabase = useSupabase();

  const menu = restaurant.menu;

  useEffect(() => {}, []);

  const TEST = async () => {
    console.log(userSession);
    console.log(userData);
  };

  const open_drink_template_after_search = (order_response: Cart) => {
    goToDrinkCheckout(order_response, null);
  };

  const goToDrinkCheckout = (cart: Cart | [], initialPolicy: Policy | null) => {
    //build cart with policy conditions
    const cart_items: CartItem[] = cart;
    for (const condition of initialPolicy?.definition.conditions || []) {
      if (
        condition.type === "minimum_quantity" ||
        condition.type === "exact_quantity"
      ) {
        const firstConditionItem: Item = condition.items[0];
        cart_items.push({
          id: 0,
          item: firstConditionItem,
          quantity: condition.quantity,
          price: 0,
          points: 0,
          point_cost: 0,
        });
      }
    }
    assignIds(cart_items);
    navigate(DRINK_CHECKOUT_PATH, {
      state: {
        cart: cart_items,
        restaurant: restaurant,
        policy: initialPolicy,
      },
    });
  };

  return (
    <div>
      <button
        onClick={() => {
          console.log("changing restaurant");
        }}
      >
        Change Restaurant
      </button>
      <h1>{restaurant.name}</h1>
      <h1>{userData?.points[restaurant.id]} pts</h1>
      <div>
        <SearchBar
          action={open_drink_template_after_search}
          restaurant={restaurant}
        />
      </div>
      <h1>Your previous transactions</h1>
      <ul>
        {transactions.map((transaction, index) => (
          <div
            onClick={() => {
              navigate(QR_CODE_PATH, {
                state: { transactions: [transaction] },
              });
            }}
          >
            <p>{JSON.stringify(transaction)}</p>
          </div>
        ))}
      </ul>
      <div>
        <h1>Deals</h1>
        <ul>
          {policies.map((policy, index) => (
            <div onClick={() => goToDrinkCheckout([], policy)}>
              <li key={index}>{policy.name}</li>
            </div>
          ))}
        </ul>
      </div>
      <button onClick={TEST}>test button</button>
      {!userSession && (
        <div
          onClick={() => {
            navigate("/sign_in", {
              state: {
                redirectTo: "/",
              },
            });
          }}
        >
          Sign In
        </div>
      )}
    </div>
  );
};

export default RestaurantPage;
