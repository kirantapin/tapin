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
} from "../types.ts";
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
  NORMAL_DEAL_TAG,
  PASS_TAG,
} from "../constants.ts";

import { fetch_policies } from "../utils/queries/policies.ts";
import { fetchRestaurantById } from "../utils/queries/restaurant.ts";
import PolicyCard from "@/components/cards/shad_policy_card.tsx";

import { project_url } from "../utils/supabase_client.ts";
import { isEqual, rest, update } from "lodash";
import { usePersistState } from "@/hooks/usePersistState.tsx";
import { DrinkList } from "@/components/menu_items.tsx";
import GoToCartButton from "@/components/go_to_cart_button.tsx";
import AccessCardSlider from "./access_card_slider.tsx";
import Rewards from "@/components/rewards.tsx";
import { CartManager } from "@/utils/cartManager.ts";
import { ToastContainer, toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function RestaurantPage() {
  const { userSession, userData, transactions, logout, setShowSignInModal } =
    useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [cart, setCart] = useState<Cart | null>();
  const { id: restaurant_id } = useParams<{ id: string }>();
  const [activeFilter, setActiveFilter] = useState(HOUSE_MIXER_LABEL);
  const orderDrinksRef = useRef<HTMLDivElement>(null);
  const cartManager = useRef<CartManager | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderSearch, setOrderSearch] = useState<string>("");

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
      setLoading(false);
    };
    fetchData();
  }, []);

  const addToCart = async (item: Item) => {
    await cartManager.current?.addToCart(item, restaurant);
    setCart(cartManager.current?.cart);
  };

  const removeFromCart = async (
    itemKey: number,
    updatedFields: Partial<CartItem>
  ) => {
    await cartManager.current?.updateItem(itemKey, updatedFields);
    setCart(cartManager.current?.cart);
  };

  return !loading ? (
    <div className="min-h-screen bg-gray-25">
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
        <div className="absolute -bottom-7" style={{ left: "18px" }}>
          {" "}
          {/* Moved further down */}
          <div className="w-24 h-24 rounded-full border-2 border-white  overflow-hidden shadow-lg">
            <img
              src={`${project_url}/storage/v1/object/public/restaurant_images/${restaurant_id}_profile.png`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="mt-10 px-4">
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
        <div className="mt-4 overflow-x-auto whitespace-nowrap no-scrollbar scrollbar-hide">
          <div className="flex gap-4 snap-x snap-mandatory">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="snap-start flex-shrink-0 w-full max-w-md rounded-3xl overflow-hidden p-0 flex text-white"
                style={{
                  backgroundColor: restaurant?.metadata.primaryColor,
                }}
              >
                {/* Left: Text Content */}
                <div className="flex flex-col justify-between flex-1 p-4">
                  <div>
                    <h3 className="text-lg font-bold">Save 20% on Shooters</h3>
                    <p className="text-sm max-w-[90%] sm:max-w-[90%] md:max-w-[100%] overflow-hidden text-ellipsis break-words custom-line-clamp">
                      $10 Fireball shots for Chiefs fans & $10 Green Tea shots
                      for Eagles Fans $10 Fireball shots for Chiefs fans & $10
                      Green Tea shots for Eagles Fans
                    </p>
                  </div>
                  <button
                    className="bg-white px-4 py-1 rounded mt-2 text-sm self-start"
                    style={{ color: restaurant?.metadata["primaryColor"] }}
                  >
                    Order Now
                  </button>
                </div>

                {/* Right: Image Block with full height and right rounding */}
                <div className="h-full w-32 rounded-r-3xl overflow-hidden">
                  <img
                    src={
                      "https://www.life-publications.com/wp-content/uploads/2023/07/Party-in-the-Square-August-2023.jpg" ||
                      "/placeholder.svg"
                    }
                    alt="name"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Spot Section */}
        <div className="mt-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            My Spot <span>🪑</span>
          </h2>

          <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
            {/* Card 1: My Passes */}
            <div
              className="relative flex-shrink-0 w-[145px] h-[115px] bg-gray-50 rounded-xl border p-4 cursor-pointer"
              onClick={() => {
                navigate(
                  PREVIOUS_TRANSACTIONS_PATH.replace(":id", restaurant_id),
                  {
                    state: { showPasses: true },
                  }
                );
              }}
            >
              {/* Arrow in top-right */}
              <div className="absolute top-3 right-3 bg-gray-100 rounded-full p-1">
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              {/* Text in bottom-left */}
              <div className="absolute bottom-3 left-4">
                <p className="text-xs text-gray-500 font-medium">My Passes</p>
                <p className="text-sm font-semibold text-gray-900">
                  {
                    transactions.filter(
                      (t) =>
                        t.fulfilled_by === null && t.item[0] === PASS_MENU_TAG
                    ).length
                  }{" "}
                  Active Passes
                </p>
              </div>
            </div>

            {/* Card 2: My Orders */}
            <div
              className="relative flex-shrink-0 w-[145px] h-[115px] bg-gray-50 rounded-xl border p-4 cursor-pointer"
              onClick={() => {
                navigate(
                  PREVIOUS_TRANSACTIONS_PATH.replace(":id", restaurant_id),
                  {
                    state: { showPasses: false },
                  }
                );
              }}
            >
              <div className="absolute top-3 right-3 bg-gray-100 rounded-full p-1">
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              <div className="absolute bottom-3 left-4">
                <p className="text-xs text-gray-500 font-medium">My Orders</p>
                <p className="text-sm font-semibold text-gray-900">
                  {
                    transactions.filter(
                      (t) =>
                        t.fulfilled_by === null && t.item[0] !== PASS_MENU_TAG
                    ).length
                  }{" "}
                  In Cart
                </p>
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
              <button
                className="text-sm font-semibold "
                style={{ color: restaurant?.metadata["primaryColor"] }}
                onClick={() => {
                  navigate(OFFERS_PAGE_PATH.replace(":id", restaurant_id));
                }}
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto pb-2 no-scrollbar">
              <div className="flex gap-2 whitespace-nowrap">
                {policies
                  .filter(
                    (policy) =>
                      policy.definition.tag === NORMAL_DEAL_TAG ||
                      policy.definition.tag === PASS_TAG
                  )
                  .map((policy) => (
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
            <h2 className="text-xl font-bold">Order Drinks</h2>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-12 pr-4 py-3 border rounded-full text-base"
              onChange={(e) => setOrderSearch(e.target.value)}
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
                      }
                    : {
                        backgroundColor: `#f6f8fa`,
                      }
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
              cart={cart}
              label={activeFilter}
              restaurant={restaurant}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              primaryColor={restaurant.metadata.primaryColor}
            />
          )}
        </div>
        <button
          onClick={() => {
            console.log(restaurant.menu);
          }}
        >
          test
        </button>

        {!userSession ? (
          <button
            onClick={() => {
              setShowSignInModal(true);
            }}
          >
            Sign in
          </button>
        ) : (
          <button onClick={logout}>log out</button>
        )}
        {restaurant && (
          <GoToCartButton
            restaurant={restaurant}
            cartCount={
              cart?.reduce((total, item) => total + item.quantity, 0) || 0
            }
          />
        )}
        <button
          onClick={() => {
            // toast("Wow so easy !");
            setShowSignInModal(true);
          }}
        >
          show sign in modal
        </button>
        <ToastContainer />
      </div>
    </div>
  ) : (
    <RestaurantHeaderSkeleton />
  );
}

const RestaurantHeaderSkeleton = () => {
  return (
    <div className="bg-white relative pb-10 min-h-[65vh]">
      {/* Header Icons */}
      <div className="absolute w-full top-0 z-50 flex justify-between items-center px-4 py-3">
        <div className="w-9 h-9 rounded-full overflow-hidden">
          <Skeleton circle width="100%" height="100%" />
        </div>

        <div className="flex items-center gap-5">
          <div className="w-9 h-9 rounded-full overflow-hidden">
            <Skeleton circle width="100%" height="100%" />
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden">
            <Skeleton circle width="100%" height="100%" />
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="h-48 w-full rounded-b-xl overflow-hidden">
        <Skeleton width="100%" height="100%" />
      </div>

      {/* Profile Image */}
      <div className="absolute -bottom-12 left-5">
        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden">
          <Skeleton circle width="100%" height="100%" />
        </div>
      </div>

      {/* Restaurant Info + Action Buttons */}
      <div className="mt-20 px-4 space-y-4">
        {/* Restaurant Name */}
        <div className="w-2/3 h-6">
          <Skeleton width="100%" height="100%" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="flex-1 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm"
            >
              <Skeleton width="100%" height="100%" />
            </div>
          ))}
        </div>

        {/* Promo Banner */}
        <div className="mt-6 w-full h-[120px] rounded-3xl overflow-hidden">
          <Skeleton width="100%" height="100%" />
        </div>

        {/* "My Spot" Section */}
        <div className="mt-8 space-y-3">
          {/* Section Title */}
          <div className="w-32 h-6">
            <Skeleton width="100%" height="100%" />
          </div>

          {/* Card Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((_, i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 rounded-lg shadow space-y-2"
              >
                <Skeleton height={20} width="60%" />
                <Skeleton height={14} width="80%" />
                <Skeleton height={12} width="40%" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
