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
  DISCOVER_PATH,
  DRINK_CHECKOUT_PATH,
  LOYALTY_REWARD_PATH,
  RESTAURANT_PATH,
} from "../constants.ts";

import { fetch_policies } from "../utils/queries/policies.ts";
import { fetchRestaurantById } from "../utils/queries/restaurant.ts";
import PolicyCard from "@/components/cards/shad_policy_card.tsx";

import { project_url } from "../utils/supabase_client.ts";
import SearchBar from "@/components/rotating_searchbar.tsx";
import AccessCard from "@/components/cards/access_card.tsx";
import { ItemSelector } from "@/components/item_selector.tsx";
import { isEqual } from "lodash";
import { usePersistState } from "@/hooks/usePersistState.tsx";
import { priceItem } from "@/utils/pricer.ts";

export default function RestaurantPage() {
  const { userSession, userData, transactions, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const { id: restaurant_id } = useParams<{ id: string }>();
  const [cart, setCart, clearCart] = usePersistState<Cart>(
    [],
    restaurant_id + "_cart"
  );
  const [activeFilter, setActiveFilter] = useState("Popular");

  const menu = restaurant?.menu;

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

  const add_to_cart = (item: Item) => {
    priceItem(item, restaurant);
    setCart((prevCart) => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex((cartItem) =>
        isEqual(cartItem.item, item)
      );

      if (existingItemIndex >= 0) {
        // If item exists, increment quantity
        return prevCart.map((cartItem, index) => {
          if (index === existingItemIndex) {
            return {
              ...cartItem,
              quantity: cartItem.quantity + 1,
            };
          }
          return cartItem;
        });
      }

      // If item doesn't exist, add as new with next available ID
      const maxId = prevCart.reduce(
        (max, cartItem) => Math.max(max, cartItem.id || 0),
        0
      );
      const newCartItem = {
        id: maxId + 1,
        item: item,
        quantity: 1,
        price: priceItem(item, restaurant),
        points: 100,
        point_cost: 0,
      };

      return [...prevCart, newCartItem];
    });
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Icons */}
      <div className="absolute w-full top-0 z-50 flex justify-between items-center px-4 py-3">
        <Menu className="w-6 h-6 text-white" />
        <div className="flex items-center gap-6">
          <ShoppingBag className="w-6 h-6 text-white" />
          <User className="w-8 h-8 text-white" />
        </div>
      </div>
      {/* Hero Image */}
      <div
        className="relative h-48 rounded-b-3xl bg-cover bg-center"
        style={{
          backgroundImage: `url('${project_url}/storage/v1/object/public/restaurant_images/${restaurant_id}_hero.jpeg')`,
        }}
      >
        {/* Profile Image */}
        <div className="absolute -bottom-12 left-4">
          {" "}
          {/* Moved further down */}
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden">
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
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 mt-6 px-2">
          <button className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-200 bg-white shadow-sm">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              Menu
            </span>
          </button>
          <button className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-200 bg-white shadow-sm">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              More Info
            </span>
          </button>
          <button className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-200 bg-white shadow-sm">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              Directions
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
        <div className="mt-4 bg-red-500 rounded-lg p-4 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold">Save 20% on Shooters</h3>
            <p className="text-sm">$10 Fireball shots for Chiefs fans and</p>
            <p className="text-sm">$10 Green Tea shots for Eagles Fans</p>
            <button className="bg-white text-red-500 px-4 py-1 rounded mt-2 text-sm">
              Order Now
            </button>
          </div>
          <div className="w-20 h-20 bg-red-700 rounded-lg"></div>
        </div>

        {/* My Spot Section */}
        <div className="mt-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            My Spot
            <span className="text-red-500">🪑</span>
          </h2>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">My Passes</h3>
                  <p className="text-sm text-gray-500">
                    {
                      transactions.filter(
                        (t) => t.fulfilled_by === null && t.item === "passes"
                      ).length
                    }{" "}
                    Active Passes
                  </p>
                  <p className="text-xs text-gray-400">Scan to enter</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">My Orders</h3>
                  <p className="text-sm text-gray-500">
                    {transactions.filter((t) => t.fulfilled_by === null).length}{" "}
                    Pending
                  </p>
                  <p className="text-xs text-gray-400">
                    $
                    {transactions
                      .filter((t) => t.fulfilled_by === null)
                      .reduce((sum, t) => sum + (t.price ?? 0), 0)

                      .toFixed(2)}{" "}
                    Total
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Rewards</h2>
            <button
              onClick={() => {
                navigate(LOYALTY_REWARD_PATH.replace(":id", restaurant_id));
              }}
              className="text-red-500 text-sm"
            >
              View Rewards
            </button>
          </div>

          {userData && (
            <div className="mt-4 text-center">
              <h3 className="text-5xl font-bold text-red-500 mb-2">
                {userData.points[restaurant_id]} Points
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                260 points until your next reward
              </p>

              {/* Progress Bar */}
              <div className="mt-4 h-2 bg-gray-200 rounded-full">
                <div className="w-3/4 h-full bg-red-500 rounded-full"></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>200</span>
                <span>400</span>
                <span>600</span>
                <span>800</span>
                <span>1000</span>
              </div>
            </div>
          )}

          {/* Bottom Rewards Button */}
          <button
            onClick={() =>
              navigate(LOYALTY_REWARD_PATH.replace(":id", restaurant_id))
            }
            className="w-full mt-6 border-2 border-red-500 text-red-500 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
          >
            <Gift className="w-5 h-5" />
            Rewards
          </button>
          <div className="mt-8">
            {restaurant && (
              <AccessCard
                baseColor="#E35759"
                venueName={restaurant?.name}
                title="LineSkip"
                savings="Save $1.50 per drink"
                regularPrice={10}
                discountPrice={5}
                date="01/25"
              />
            )}
          </div>
          {/* Awesome Deals Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Awesome Deals 🍻</h2>
              <a href="#" className="text-red-500 text-sm">
                View all
              </a>
            </div>

            <div className="overflow-x-auto pb-2 no-scrollbar">
              <div className="flex gap-2 whitespace-nowrap">
                {[...policies, ...policies].map((policy) => (
                  <PolicyCard policy={policy} key={policy.policy_id} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-2 mt-6">
            <h2 className="text-xl font-bold">Order Drinks 🍸</h2>
            <button className="bg-red-500 text-white text-sm px-3 py-1 rounded-md flex items-center">
              <span className="mr-1">🥃</span> Make A Drink
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 border rounded-full text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-4 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {[
              "House Mixers",
              "Beer and Ciders",
              "Shots or Shooters",
              "Cocktails",
              restaurant?.name
                ? `${restaurant?.name} Specialties`
                : "Specialties",
              "Food",
            ].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  activeFilter === filter
                    ? "bg-red-100 text-red-500 border border-red-500"
                    : "border text-gray-500"
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Drinks List */}
          <div className="space-y-4">
            <DrinkItem
              name="Classic Margarita"
              description="Tequila, lime, and triple sec, served on the rocks or frozen"
              price="12.00"
              image="/placeholder.svg?height=60&width=60"
            />
            <DrinkItem
              name="Old fashioned cocktail"
              description="Whiskey, bitters, sugar, and orange"
              price="13.00"
              image="/placeholder.svg?height=60&width=60"
            />
            <DrinkItem
              name="Mojito"
              description="Rum, mint, lime, sugar, and soda"
              price="16.00"
              image="/placeholder.svg?height=60&width=60"
            />
            <DrinkItem
              name="Espresso Martini"
              description="Vodka, espresso, and coffee liqueur"
              price="16.00"
              image="/placeholder.svg?height=60&width=60"
            />
          </div>
        </div>

        <button
          onClick={() => {
            navigate(
              DRINK_CHECKOUT_PATH.replace(":id", restaurant_id as string)
            );
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-md mt-4"
        >
          Go To Cart
        </button>
        <div>{cart.length} items in cart</div>
        <button onClick={logout}>log out</button>
        <div>{JSON.stringify(userData)}</div>
        {restaurant && (
          <ItemSelector menu={restaurant.menu} handleSelected={add_to_cart} />
        )}
      </div>
    </div>
  );
}

function DrinkItem({ name, description, price, image }) {
  return (
    <div className="flex items-center">
      <div className="h-16 w-16 mr-3 rounded-md overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{name}</h3>
        <p className="text-xs text-gray-500">{description}</p>
        <p className="text-red-500 font-medium">${price}</p>
      </div>
      <button className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center text-white">
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
}
