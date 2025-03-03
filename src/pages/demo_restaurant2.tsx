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
import {
  DISCOVER_PATH,
  DRINK_CHECKOUT_PATH,
  RESTAURANT_PATH,
} from "../constants.ts";
import { fetch_policies } from "../utils/queries/policies.ts";
import { fetchRestaurantById } from "../utils/queries/restaurant.ts";
import { PrevTransactionDisplay } from "../components/previous_transactions_display.tsx";
import {
  getSubscriptionsByIds,
  getSubscriptionsByRestaurant,
  getUserSubscription,
  getSubscriptionById,
} from "../utils/queries/subscriptions.ts";
import SearchBar from "../components/rotating_searchbar.tsx";
import { PolicyCard } from "../components/cards/policy_card.tsx";
import { SubscriptionCard } from "../components/cards/subscription_card.tsx";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOrdering from "../components/menu.tsx";
import { Sidebar } from "../components/sidebar.tsx";
import { project_url } from "../utils/supabase_client.ts";
export default function Demo2() {
  const { userSession, userData, transactions, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [subscription, setSubscription] = useState({
    name: "Party Pass Plus",
    price: 19.99,
    interval: "month" as const,
    policies: [
      {
        title: "BOGO Drinks",
        description: "Buy one drink, get one free every Friday night",
        isLimitedTime: true,
        expirationDate: "June 1, 2025",
        isDeal: true,
      },
      {
        title: "50% Off Appetizers",
        description: "Half price appetizers every day from 4-6 PM",
        isLimitedTime: false,
        isDeal: true,
      },
      {
        title: "VIP Line Skip",
        description: "Skip the line at participating venues",
        isLimitedTime: false,
        isDeal: false,
      },
    ],
  });

  const displayTabs = {
    offers: "Offers",
    rewards: "Rewards",
    order: "Order",
    purchases: "Purchases",
  };

  const { id: restaurant_id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("offers");

  const offersRef = useRef(null);
  const prevTransactionsRef = useRef(null);
  const menuRef = useRef(null);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName); // Update active tab
    switch (tabName) {
      case "offers":
        offersRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "purchases":
        prevTransactionsRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      case "order":
        menuRef.current?.scrollIntoView({ behavior: "smooth" });
        break;
      default:
        break;
    }
  };

  const menu = restaurant?.menu;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    //fetch the restaurant and policies
    console.log("userdata", userData);
    const fetchData = async () => {
      const restaurantData = await fetchRestaurantById(restaurant_id);
      if (!restaurantData) {
        navigate("/not_found_page");
      }
      const policies = await fetch_policies(restaurant_id);
      const uniqueSubscriptionIds = Array.from(
        new Set(
          policies
            .map((policy) => policy.subscription_id)
            .filter((id): id is string => id !== null) // Filter nulls and refine type
        )
      );

      setRestaurant(restaurantData as Restaurant);
      setPolicies(policies);
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
    const sections = [
      offersRef.current,
      prevTransactionsRef.current,
      menuRef.current,
    ];
    sections.forEach((section) => observer.observe(section));

    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);

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
    navigate(DRINK_CHECKOUT_PATH.replace(":id", restaurant_id as string), {
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
          src={`${project_url}/storage/v1/object/public/restaurant_images/${restaurant_id}_hero.jpeg`}
          alt="Restaurant exterior"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleSidebar}
            sx={{ color: "white" }}
          >
            <MenuIcon />
          </IconButton>
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
      <div className="relative px-4 pb-4">
        <div className="absolute -top-8 left-4 rounded-full overflow-hidden border-4 border-black">
          <img
            src={`${project_url}/storage/v1/object/public/restaurant_images/${restaurant_id}_profile.png`}
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
        <div
          className="flex items-center justify-between bg-red-500 rounded-lg p-4 mt-4"
          onClick={() => {
            navigate("/cover_deals");
          }}
        >
          <div className="text-sm">
            <div>
              <h1 className="text-lg font-bold">This Bar Requires Cover</h1>
            </div>
            <div className="font-medium text-gray-800">
              View all Cover Passes
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-900" />
        </div>

        {/* Navigation Tabs */}
        <div className="sticky top-0 z-10 mt-4">
          <div className="flex border-b">
            {Object.keys(displayTabs).map((tab) => (
              <button
                key={tab}
                className={`flex-1 py-2 px-4 text-center ${
                  activeTab === tab
                    ? "border-b-2 border-red-500 text-red-500"
                    : "text-gray-500"
                }`}
                onClick={() => handleTabClick(tab)}
              >
                {displayTabs[tab as keyof typeof displayTabs]}
              </button>
            ))}
          </div>
        </div>

        {/* Membership Cards */}
        <div className="space-y-4 mt-4" ref={offersRef} data-tab="offers">
          <>
            {policies
              .filter((policy) => policy.subscription_id === null)
              .map((policy, index) => (
                <PolicyCard
                  title={policy.name}
                  description={policy.header}
                  isLimitedTime={true}
                  expirationDate={undefined}
                  isDeal={false}
                  primaryColor="#2A2F45"
                  secondaryColor="#F5B14C"
                />
              ))}
            <SubscriptionCard
              {...subscription}
              primaryColor={"#2A2F45"}
              secondaryColor={"#2A2F45"}
            />
          </>
        </div>
        <div ref={menuRef} data-tab="menu">
          <MenuOrdering />
        </div>

        <div ref={prevTransactionsRef} data-tab="previous_transactions">
          {restaurant && (
            <PrevTransactionDisplay
              transactions={transactions}
              restaurant={restaurant}
            />
          )}
        </div>
        <div>
          {restaurant && (
            <SearchBar
              action={open_drink_template_after_search}
              restaurant_id={restaurant_id as string}
            />
          )}
        </div>
      </div>
      <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />
      <button
        onClick={() => {
          console.log(userSession);
        }}
      >
        test
      </button>
    </div>
  );
}
