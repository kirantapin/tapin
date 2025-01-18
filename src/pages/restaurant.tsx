import React from "react";
import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SearchBar from "../components/rotating_searchbar.tsx";
import { useSupabase } from "../context/supabase_context";
import { useAuth } from "../context/auth_context.tsx";
import {
  Cart,
  Restaurant,
  Policy,
  CartItem,
  Item,
  Subscription,
} from "../types";
import { assignIds } from "../utils/submit_drink_order.ts";
import { DISCOVER_PATH } from "../constants.ts";
import { fetch_policies } from "../utils/queries/policies.ts";
import { fetchRestaurantById } from "../utils/queries/restaurant.ts";
import { PrevTransactionDisplay } from "../components/previous_transactions_display.tsx";
import {
  getSubscriptionsByIds,
  getSubscriptionsByRestaurant,
  getUserSubscription,
  getSubscriptionById,
} from "../utils/queries/subscriptions.ts";

const RestaurantPage: React.FC = () => {
  // Extract restaurantId from URL parameters
  const { userSession, userData, transactions } = useAuth();
  const navigate = useNavigate();
  const supabase = useSupabase();
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [userSubscription, setUserSubscription] =
    useState<Subscription | null>();
  const { id: restaurant_id } = useParams<{ id: string }>();

  const menu = restaurant?.menu;

  useEffect(() => {
    //fetch the restaurant and policies
    const fetchData = async () => {
      const restaurantData = await fetchRestaurantById(restaurant_id);
      if (!restaurantData) {
        navigate(DISCOVER_PATH);
      }
      const policies = await fetch_policies(restaurant_id);
      const uniqueSubscriptionIds = Array.from(
        new Set(
          policies
            .map((policy) => policy.subscription_id)
            .filter((id): id is string => id !== null) // Filter nulls and refine type
        )
      );
      const subscriptions = await getSubscriptionsByIds(uniqueSubscriptionIds);
      if (userData && restaurant_id) {
        const userSubscriptionStatus = await getUserSubscription(
          userData.id,
          restaurant_id
        );
        const userSubscription = await getSubscriptionById(
          userSubscriptionStatus?.subscription_id || null
        );

        setUserSubscription(userSubscription);
      }

      setRestaurant(restaurantData as Restaurant);
      setPolicies(policies);
      setSubscriptions(subscriptions);
    };
    fetchData();
  }, []);

  const TEST = async () => {
    const { data, error } = await supabase.functions.invoke(
      "handle_subscriptions",
      {
        body: { random: "hello" },
      }
    );
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
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={goToDiscovery}
      >
        Discovery
      </button>
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
      {restaurant && (
        <PrevTransactionDisplay
          transactions={transactions}
          restaurant={restaurant}
        />
      )}

      <div>
        <h1>Deals</h1>
        <ul>
          {policies
            .filter((policy) => policy.subscription_id === null)
            .map((policy, index) => (
              <div key={index} onClick={() => goToDrinkCheckout([], policy)}>
                <li key={index}>{policy.name}</li>
              </div>
            ))}
        </ul>
      </div>
      <button
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={TEST}
      >
        Test Button
      </button>
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
