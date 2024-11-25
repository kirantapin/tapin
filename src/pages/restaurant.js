import React from "react";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/rotating_searchbar";
import { useSupabase } from "../context/supabase_context";
import { DrinkCheckout } from "./drink_checkout";
// import { QRCodeScreen } from "../pages/qr_code";
import { useAuth } from "../context/auth_context";
import { sanitize_drink_order } from "../utils/drink_template_parser";

const Restaurant = ({ restaurant }) => {
  // Extract restaurantId from URL parameters
  const { is_authenticated, userSession, userData, transactions, policies } =
    useAuth();
  const supabase = useSupabase();
  const navigate = useNavigate();

  const menu = restaurant.menu;

  useEffect(() => {}, []);

  const TEST = () => {
    console.log(policies);
  };

  const open_drink_template_after_search = (order_response) => {
    navigate("/drink_checkout", {
      state: {
        cart_items: order_response,
        restaurant: restaurant,
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
      <div>
        <SearchBar action={open_drink_template_after_search} menu={menu} />
      </div>
      <h1>Your previous transactions</h1>
      <div>
        <ul>
          {transactions.map((transaction, index) => (
            <li key={index}>
              {sanitize_drink_order(transaction.item_id).name}
            </li>
          ))}
        </ul>
        <h1>Deals</h1>
        <ul>
          {policies.map((policy, index) => (
            <div>
              <li key={index}>{policy.name}</li>
              <li key={index}>{policy.header}</li>
            </div>
          ))}
        </ul>
      </div>
      <button onClick={TEST}>test button</button>
    </div>
  );
};

export default Restaurant;
