import React, { useState, useEffect, useRef } from "react";
import { Heart, MapPin, Clock, Star, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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
import { log } from "console";

export default function Demo2() {
  const { userSession, userData, transactions, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [userSubscription, setUserSubscription] =
    useState<Subscription | null>();
  const { id: restaurant_id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("offers");

  const offersRef = useRef(null);
  const prevTransactionsRef = useRef(null);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName); // Update active tab
    switch (tabName) {
      case "offers":
        offersRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "previous_transactions":
        prevTransactionsRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      default:
        break;
    }
  };

  const menu = restaurant?.menu;

  useEffect(() => {
    //fetch the restaurant and policies
    console.log("userdata", userData);
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

  useEffect(() => {
    // IntersectionObserver to track which section is in view
    const observerOptions = {
      root: null, // Use the viewport as the root
      threshold: 0.5, // Trigger when 60% of the section is visible
    };

    const observerCallback = (entries) => {
      for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i];
        if (entry.isIntersecting) {
          setActiveTab(entry.target.dataset.tab);
        }
      }
    };
    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    // Observe sections
    const sections = [offersRef.current, prevTransactionsRef.current];
    sections.forEach((section) => observer.observe(section));

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-40">
        <img
          src="/boy2-1.jpeg"
          alt="Restaurant exterior"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <button className="text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex gap-4">
            <Heart className="w-6 h-6 text-white" />
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
        </div>
      </div>
      {/* <button
        onClick={() => {
          console.log(userSession);
          console.log(transactions);
        }}
      >
        test
      </button> */}

      {/* Restaurant Info */}
      <div className="relative px-4 pb-4">
        <div className="absolute -top-8 left-4 rounded-full overflow-hidden border-4 border-white">
          <img
            src="/boylan_profile.png"
            alt="Restaurant logo"
            className="w-[72px] h-[72px] bg-white"
          />
        </div>
        {restaurant && (
          <div className="pt-12">
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <Clock className="w-4 h-4" />
              <span>Open Monday to Thursday: 5 PM - 1 AM</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <MapPin className="w-4 h-4" />
              <span>102 14th St NW, Charlottesville</span>
              <div className="flex items-center ml-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="ml-1">4.6 (323)</span>
              </div>
            </div>
          </div>
        )}

        {/* Points Banner */}
        <div className="flex items-center justify-between bg-gray-100 rounded-lg p-4 mt-4">
          <div className="text-sm">
            <div>No Active Passes</div>
            <div className="font-medium">Browse passes to unlock perks!</div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* Navigation Tabs */}
        <div className="mt-4">
          <div className="flex border-b">
            {["offers", "order", "rewards", "previous_transactions"].map(
              (tab) => (
                <button
                  key={tab}
                  className={`flex-1 py-2 px-4 text-center ${
                    activeTab === tab
                      ? "border-b-2 border-red-500 text-red-500"
                      : "text-gray-500"
                  }`}
                  onClick={() => handleTabClick(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Membership Cards */}
        <div className="space-y-4 mt-4" ref={offersRef} data-tab="offers">
          {policies
            .filter((policy) => policy.subscription_id === null)
            .map((policy, index) => (
              <div className="bg-[#2A2F45] text-white rounded-lg p-4">
                <h3 className="font-semibold text-lg">{policy.name}</h3>
                <p className="text-sm text-gray-300 mt-1">{policy.header}</p>
                <button
                  className="mt-4 px-4 py-2 bg-white text-[#2A2F45] rounded-md font-medium"
                  onClick={() => goToDrinkCheckout([], policy)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
        </div>
        <div ref={prevTransactionsRef} data-tab="previous_transactions">
          {restaurant && (
            <PrevTransactionDisplay
              transactions={transactions}
              restaurant={restaurant}
            />
          )}
        </div>
        <button onClick={logout}>logout</button>
      </div>
    </div>
  );
}
