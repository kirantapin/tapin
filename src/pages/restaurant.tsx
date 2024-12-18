import React from "react";
import { useEffect, useState, useContext } from "react";
import { redirect, useNavigate, useParams } from "react-router-dom";
import SearchBar from "../components/rotating_searchbar.tsx";
import { useSupabase } from "../context/supabase_context";
import { useAuth } from "../context/auth_context.tsx";
import { Cart, Restaurant, Policy, CartItem, Item } from "../types";
import { DRINK_CHECKOUT_PATH, QR_CODE_PATH } from "../constants.ts";
import { assignIds } from "../utils/submit_drink_order.ts";
import { DISCOVER_PATH } from "../constants.ts";
import { DrinkCheckout } from "./drink_checkout.tsx";
import { fetch_policies } from "../utils/queries/policies.ts";
import { fetchRestaurantById } from "../utils/queries/restaurant.ts";

const RestaurantPage: React.FC = () => {
  // Extract restaurantId from URL parameters
  const { userSession, userData, transactions } = useAuth();
  const navigate = useNavigate();
  const supabase = useSupabase();
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const { id: restaurant_id } = useParams<{ id: string }>();
  const [openCart, setOpenCart] = useState<boolean>(false);

  const menu = restaurant?.menu;

  useEffect(() => {
    //fetch the restaurant and policies
    const fetchData = async () => {
      const restaurantData = await fetchRestaurantById(restaurant_id);
      console.log(restaurantData);
      const policies = await fetch_policies(restaurant_id);
      if (!restaurantData) {
        //navigate to restaurant not found page
        //for now we will take user to discovery page
        navigate(DISCOVER_PATH);
      } else {
        setRestaurant(restaurantData);
        setPolicies(policies);
      }
    };
    fetchData();
  }, []);

  const TEST = async () => {
    console.log(transactions);
    console.log(restaurant);
  };

  const open_drink_template_after_search = (order_response: Cart) => {
    goToDrinkCheckout(order_response, null);
  };

  const goToDiscovery = () => {
    navigate(DISCOVER_PATH);
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
    navigate(`/restaurant/${restaurant_id}/drink_checkout`, {
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
      <button onClick={goToDiscovery}>Discovery</button>
      <h1>{restaurant?.name}</h1>
      <h1>
        {restaurant?.id && userData?.points[restaurant.id]
          ? userData.points[restaurant.id]
          : 0}{" "}
        pts
      </h1>
      <div>
        {restaurant && (
          <SearchBar
            action={open_drink_template_after_search}
            restaurant_id={restaurant_id as string}
          />
        )}
      </div>
      <h1>Your previous transactions</h1>
      <ul>
        {transactions.map((transaction, index) =>
          transaction.restaurant_id === restaurant?.id &&
          transaction.is_fulfilled === false ? (
            <div
              key={index}
              onClick={() => {
                navigate(QR_CODE_PATH, {
                  state: { transactions: [transaction] },
                });
              }}
            >
              <p>{transaction.metadata?.name || transaction.category}</p>
            </div>
          ) : null
        )}
      </ul>
      <div>
        <h1>Deals</h1>
        <ul>
          {policies.map((policy, index) => (
            <div key={index} onClick={() => goToDrinkCheckout([], policy)}>
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
