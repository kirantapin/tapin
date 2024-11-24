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

  const submit_drink_order = async (drink_order) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "submit_drink_query",
        {
          body: JSON.stringify({ drink_order: drink_order, menu: menu }),
        }
      );
      if (error) throw error;
      const { response } = data;
      console.log("drink order response", response);
      go_to_drink_checkout(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const TEST = () => {
    console.log(policies);
  };

  const go_to_drink_checkout = (drink) => {
    navigate("/drink_checkout", {
      state: {
        drink_template: sanitize_drink_order(drink),
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
        <SearchBar onSearch={submit_drink_order} />
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
