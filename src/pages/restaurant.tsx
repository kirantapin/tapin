import React from "react";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/rotating_searchbar.tsx";
import { useSupabase } from "../context/supabase_context";
// import { QRCodeScreen } from "../pages/qr_code";
import { useAuth } from "../context/auth_context.tsx";
import { Cart, Restaurant, Policy, CartItem, Item } from "../types";
import { priceItem } from "../utils/pricer.ts";
import { assignIds } from "../utils/submit_drink_order.ts";

interface RestaurantProps {
  restaurant: Restaurant;
}

const RestaurantPage: React.FC<RestaurantProps> = ({ restaurant }) => {
  // Extract restaurantId from URL parameters
  const { is_authenticated, userSession, userData, transactions, policies } =
    useAuth();
  const navigate = useNavigate();

  const menu = restaurant.menu;

  useEffect(() => {}, []);

  const TEST = () => {
    console.log(policies);
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
          price: priceItem(firstConditionItem, restaurant),
          points: priceItem(firstConditionItem, restaurant) * 100,
        });
      }
    }
    assignIds(cart_items);
    navigate("/drink_checkout", {
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
          <div>
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
    </div>
  );
};

export default RestaurantPage;
