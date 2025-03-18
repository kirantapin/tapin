import {
  Menu,
  ShoppingBag,
  User,
  Info,
  MapPin,
  Gift,
  ChevronRight,
  Search,
  Plus,
  BadgeCheck,
  Beer,
} from "lucide-react";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  DRINK_CHECKOUT_PATH,
  LOYALTY_REWARD_PATH,
  PASS_MENU_TAG,
  PREVIOUS_TRANSACTIONS_PATH,
  MENU_DISPLAY_MAP,
  HOUSE_MIXER_LABEL,
  SIGNIN_PATH,
  OFFERS_PAGE_PATH,
} from "../constants.ts";

import { fetch_policies } from "../utils/queries/policies.ts";
import { fetchRestaurantById } from "../utils/queries/restaurant.ts";
import PolicyCard from "@/components/cards/shad_policy_card.tsx";

import { project_url } from "../utils/supabase_client.ts";
import { isEqual, rest } from "lodash";
import { usePersistState } from "@/hooks/usePersistState.tsx";
import { DrinkList } from "@/components/menu_items.tsx";
import GoToCartButton from "@/components/go_to_cart_button.tsx";
import AccessCardSlider from "./access_card_slider.tsx";
import Rewards from "@/components/rewards.tsx";
import { CartManager } from "@/utils/cartManager.ts";

export default function RestaurantPage() {
  const { userSession, userData, transactions, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [cart, setCart] = useState<Cart | null>();
  const { id: restaurant_id } = useParams<{ id: string }>();
  const [activeFilter, setActiveFilter] = useState(HOUSE_MIXER_LABEL);
  const orderDrinksRef = useRef<HTMLDivElement>(null);
  const cartManager = useRef<CartManager | null>(null);

  const scrollToOrderDrinks = () => {
    orderDrinksRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!restaurant_id) {
      navigate("/not_found_page");
    }
  }, []);

  useEffect(() => {
    const setManager = async () => {
      if (!cartManager.current || !cartManager.current.userSession) {
        console.log("there", userSession);
        cartManager.current = new CartManager(restaurant_id, userSession);
        await cartManager.current.init();
        setCart(cartManager.current.cart);
      }
    };
    setManager();
  }, [userSession]);

  useEffect(() => {
    const fetchData = async () => {
      const restaurantData = await fetchRestaurantById(restaurant_id);
      if (!restaurantData) {
        navigate("/not_found_page");
      }
      const policies = await fetch_policies(restaurant_id);

      setRestaurant(restaurantData as Restaurant);
      setPolicies(policies);
    };
    fetchData();
  }, []);

  const addToCart = async (item: Item) => {
    await cartManager.current?.addToCart(item, restaurant);
    setCart(cartManager.current?.cart);
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Header Icons */}
      <div className="absolute w-full top-0 z-50 flex justify-between items-center px-4 py-3">
        <div className="bg-black/60 p-2 rounded-full">
          <Menu className="w-5 h-5 text-white" />
        </div>

        {/* Shopping Bag & User Icons */}
        <div className="flex items-center gap-5">
          <div className="bg-black/60 p-2 rounded-full">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="bg-black/60 p-2 rounded-full">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
      {/* Hero Image */}
      <div
        className="relative h-48 rounded-b-xl bg-cover bg-center"
        style={{
          backgroundImage: `url('${project_url}/storage/v1/object/public/restaurant_images/${restaurant_id}_hero.jpeg')`,
        }}
      >
        {/* Profile Image */}
        <div className="absolute -bottom-12" style={{ left: "18px" }}>
          {" "}
          {/* Moved further down */}
          <div className="w-24 h-24 rounded-full border-4 border-white  overflow-hidden">
            <img
              src={`${project_url}/storage/v1/object/public/restaurant_images/${restaurant_id}_profile.png`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="mt-14 px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{restaurant?.name}</h1>
          <BadgeCheck className="w-5 h-5 text-blue-500" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 mt-6 px-2">
          <button
            onClick={scrollToOrderDrinks}
            className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-200 bg-white shadow-sm"
          >
            <Beer className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            {/* <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" /> */}
            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              Order
            </span>
          </button>
          <button className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-200 bg-white shadow-sm">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              More Info
            </span>
          </button>
          <button className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-200 bg-white shadow-sm">
            <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              Rewards
            </span>
          </button>
        </div>

        {/* Promo Banner */}
        {/* <div
          className="mt-4 rounded-2xl p-4 text-white flex justify-between items-center"
          style={{ backgroundColor: restaurant?.metadata["primaryColor"] }}
        >
          <div>
            <h3 className="font-bold">Save 20% on Shooters</h3>
            <p className="text-sm">$10 Fireball shots for Chiefs fans and</p>
            <p className="text-sm">$10 Green Tea shots for Eagles Fans</p>
            <button
              className="bg-white  px-4 py-1 rounded mt-2 text-sm"
              style={{ color: restaurant?.metadata["primaryColor"] }}
            >
              Order Now
            </button>
          </div>
          <div className="w-20 h-20 bg-black rounded-lg"></div>
        </div> */}
        <div className="mt-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex gap-4 snap-x snap-mandatory">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="snap-start flex-shrink-0 w-full max-w-md rounded-2xl p-4 text-white flex justify-between items-center"
                style={{
                  backgroundColor: restaurant?.metadata["primaryColor"],
                }}
              >
                <div>
                  <h3 className="font-bold">Save 20% on Shooters</h3>
                  <p className="text-sm">
                    $10 Fireball shots for Chiefs fans and
                  </p>
                  <p className="text-sm">$10 Green Tea shots for Eagles Fans</p>
                  <button
                    className="bg-white px-4 py-1 rounded mt-2 text-sm"
                    style={{ color: restaurant?.metadata["primaryColor"] }}
                  >
                    Order Now
                  </button>
                </div>
                <div className="w-20 h-20 bg-black rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>

        {/* My Spot Section */}
        <div className="mt-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            My Spot
            <span>🪑</span>
          </h2>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div
              className="bg-gray-50 p-4 rounded-lg shadow"
              onClick={() => {
                navigate(
                  PREVIOUS_TRANSACTIONS_PATH.replace(":id", restaurant_id),
                  {
                    state: {
                      showPasses: true,
                    },
                  }
                );
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">My Passes</h3>
                  <p className="text-sm text-black">
                    {
                      transactions.filter(
                        (t) =>
                          t.fulfilled_by === null && t.item[0] === PASS_MENU_TAG
                      ).length
                    }{" "}
                    Active Passes
                  </p>
                  <p className="text-xs text-gray-500">Scan to enter</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
            </div>

            <div
              className="bg-gray-50 p-4 rounded-lg shadow"
              onClick={() => {
                navigate(
                  PREVIOUS_TRANSACTIONS_PATH.replace(":id", restaurant_id),
                  {
                    state: {
                      showPasses: false,
                    },
                  }
                );
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">My Orders</h3>
                  <p className="text-sm text-black">
                    {
                      transactions.filter(
                        (t) =>
                          t.fulfilled_by === null && t.item[0] !== PASS_MENU_TAG
                      ).length
                    }{" "}
                    Pending
                  </p>
                  <p className="text-xs text-gray-500">
                    $
                    {transactions
                      .filter(
                        (t) =>
                          t.fulfilled_by === null && t.item[0] !== PASS_MENU_TAG
                      )
                      .reduce((sum, t) => sum + (t.price ?? 0), 0)

                      .toFixed(2)}{" "}
                    Total
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="mt-6">
          {userData && restaurant && (
            <Rewards userData={userData} restaurant={restaurant} />
          )}

          <div className="mt-8">
            {restaurant && <AccessCardSlider restaurant={restaurant} />}
          </div>
          {/* Awesome Deals Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Awesome Deals 🍻</h2>
              <a
                className="font-semibold text-sm"
                style={{ color: restaurant?.metadata["primaryColor"] }}
                onClick={() => {
                  navigate(OFFERS_PAGE_PATH.replace(":id", restaurant_id));
                }}
              >
                View all
              </a>
            </div>

            <div className="overflow-x-auto pb-2 no-scrollbar">
              <div className="flex gap-2 whitespace-nowrap">
                {[...policies].map((policy) => (
                  <PolicyCard
                    policy={policy}
                    primaryColor={restaurant?.metadata.primaryColor}
                  />
                ))}
              </div>
            </div>
          </div>
          <div
            ref={orderDrinksRef}
            className="flex justify-between items-center mb-2 mt-6"
          >
            <h2 className="text-xl font-bold">Order Menu🍸</h2>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-4 py-3 border rounded-full text-base"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-4 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {Object.keys(MENU_DISPLAY_MAP).map((filter) => (
              <button
                key={filter}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  activeFilter === filter ? `border` : "border text-gray-500"
                }`}
                style={
                  activeFilter === filter
                    ? {
                        color: restaurant?.metadata.primaryColor,
                        borderColor: restaurant?.metadata.primaryColor,
                        backgroundColor: `${restaurant?.metadata.primaryColor}33`,
                      }
                    : {}
                }
                onClick={() => {
                  setActiveFilter(filter);
                  const timeout = setTimeout(() => {
                    scrollToOrderDrinks();
                  }, 100);
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Drinks List */}
          {restaurant && (
            <DrinkList
              label={activeFilter}
              restaurantMenu={restaurant?.menu}
              addToCart={addToCart}
              primaryColor={restaurant.metadata.primaryColor}
            />
          )}
        </div>

        {!userSession ? (
          <button
            onClick={() => {
              navigate(SIGNIN_PATH);
            }}
          ></button>
        ) : (
          <button onClick={logout}>log out</button>
        )}
        {restaurant && (
          <GoToCartButton
            restaurant={restaurant}
            cartCount={cart?.length || 0}
          />
        )}
      </div>
    </div>
  );
}
