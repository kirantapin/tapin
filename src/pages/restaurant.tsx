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
  X,
  Ticket,
  Martini,
  GlassWater,
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
  INFO_PAGE_PATH,
  LOYALTY_REWARD_TAG,
} from "../constants.ts";

import { fetch_policies } from "../utils/queries/policies.ts";
import { fetchRestaurantById } from "../utils/queries/restaurant.ts";
import PolicyCard from "@/components/cards/shad_policy_card.tsx";

import { project_url } from "../utils/supabase_client.ts";
import { DrinkItem, DrinkList } from "@/components/menu_items.tsx";
import GoToCartButton from "@/components/go_to_cart_button.tsx";
import AccessCardSlider from "../components/sliders/access_card_slider.tsx";
import Rewards from "@/components/rewards.tsx";
import { ToastContainer } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Sidebar } from "@/components/sidebar.tsx";
import DealCard from "@/components/cards/small_policy.tsx";
import PolicyModal from "@/components/bottom_sheets/policy_modal.tsx";
import { useCartManager } from "@/hooks/useCartManager.tsx";
import { useSearch } from "@/hooks/useSearch.tsx";
import { adjustColor } from "@/utils/color";
import {
  GradientIcon,
  Hero,
  useThemeColorOnScroll,
} from "@/utils/gradient.tsx";
import { useBannerColor } from "@/hooks/useBannerColor.tsx";
import HighlightSlider from "@/components/sliders/highlight_slider.tsx";

export default function RestaurantPage() {
  const { userSession, userData, transactions, logout, setShowSignInModal } =
    useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const { id: restaurant_id } = useParams<{ id: string }>();
  const [activeFilter, setActiveFilter] = useState(HOUSE_MIXER_LABEL);
  const orderDrinksRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [policy, setPolicy] = useState<Policy | null>(null);
  const {
    state,
    addToCart,
    removeFromCart,
    addPolicy,
    removePolicy,
    refreshCart,
  } = useCartManager(restaurant as Restaurant, userSession);

  const { searchResults, searchQuery, setSearchQuery, clearSearch } = useSearch(
    {
      restaurant: restaurant as Restaurant,
      initialQuery: "",
    }
  );

  const scrollToOrderDrinks = () => {
    orderDrinksRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const [activePromo, setActivePromo] = useState(0);

  const handleScroll = (e) => {
    const scrollPosition = e.currentTarget.scrollLeft;
    const itemWidth = e.currentTarget.offsetWidth;
    const newActivePromo = Math.round(scrollPosition / itemWidth);
    setActivePromo(newActivePromo);
  };

  useEffect(() => {
    if (!restaurant_id) {
      navigate("/not_found_page");
    }
  }, []);

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

  const titleRef = useRef<HTMLHeadingElement>(null);

  useBannerColor(titleRef);

  return !loading ? (
    <div className="min-h-screen bg-gray-25">
      {/* Header Icons */}
      <div className="absolute w-full top-0 z-50 flex justify-between items-center px-4 py-3">
        <div
          className="bg-black/60 p-2 rounded-full"
          onClick={() => {
            setSidebarOpen(true);
          }}
        >
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
      {/* <div
        className="relative h-52 rounded-b-2xl bg-cover bg-center"
        style={{
          backgroundImage: `url('${project_url}/storage/v1/object/public/restaurant_images/${restaurant_id}_hero.jpeg')`,
        }}
      >
        
        <div className="absolute -bottom-5" style={{ left: "18px" }}>
          {" "}
          
          <div className="w-24 h-24 rounded-full border-2 border-white  overflow-hidden shadow-lg">
            <img
              src={`${project_url}/storage/v1/object/public/restaurant_images/${restaurant_id}_profile.png`}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div> */}
      <Hero
        hero_image={`${project_url}/storage/v1/object/public/restaurant_images/${restaurant_id}_hero.jpeg`}
        profile_image={`${project_url}/storage/v1/object/public/restaurant_images/${restaurant_id}_profile.png`}
      />
      {/* Restaurant Info */}
      <div className="mt-10 px-4">
        <div className="flex items-center gap-2">
          <h1 ref={titleRef} className="text-2xl font-bold">
            {restaurant?.name}
          </h1>
          <BadgeCheck className="w-5 h-5 text-blue-500" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 mt-5 px-2">
          <button
            onClick={scrollToOrderDrinks}
            className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-300 bg-white shadow-md"
          >
            <GradientIcon
              icon={Beer}
              primaryColor={restaurant?.metadata.primaryColor as string}
              size={17}
            />
            {/* <Info className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" /> */}
            <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap">
              Order
            </span>
          </button>
          <button
            className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-300 bg-white shadow-md"
            onClick={() => {
              navigate(INFO_PAGE_PATH.replace(":id", restaurant_id));
            }}
          >
            <GradientIcon
              icon={Info}
              primaryColor={restaurant?.metadata.primaryColor as string}
              size={17}
            />
            <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap">
              More Info
            </span>
          </button>
          <button
            className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-gray-300 bg-white shadow-md"
            onClick={() =>
              navigate(OFFERS_PAGE_PATH.replace(":id", restaurant.id), {
                state: { tag: LOYALTY_REWARD_TAG },
              })
            }
          >
            <GradientIcon
              icon={Gift}
              primaryColor={restaurant?.metadata.primaryColor as string}
              size={17}
            />
            <span className="text-sm sm:text-sm text-gray-600 whitespace-nowrap">
              Rewards
            </span>
          </button>
        </div>

        {/* Promo Banner */}
        <HighlightSlider
          restaurant={restaurant as Restaurant}
          addToCart={(itemId: string) => {
            addToCart({ id: itemId, modifiers: [] });
          }}
          setPolicyModal={(policy_id: string) => {
            const policy = policies.find((p) => p.policy_id === policy_id);
            if (policy) {
              setPolicy(policy);
              setIsOpen(true);
            }
          }}
          policies={policies}
        />

        {/* My Spot Section */}
        <div className="mt-6">
          <h1 className="text-xl font-bold flex items-center gap-2">My Spot</h1>

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
              {/* Ticket icon in top-left */}
              <div className="absolute top-3 left-3">
                <GradientIcon
                  icon={Ticket}
                  primaryColor={restaurant?.metadata.primaryColor as string}
                />
              </div>

              {/* Arrow in top-right */}
              <div className="absolute top-3 right-3 bg-gray-100 rounded-full p-1">
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              {/* Text in bottom-left */}
              <div className="absolute bottom-3 left-4">
                <p className="font-14 text-gray-500 font-medium">My Passes</p>
                <p className="font-16 font-semibold text-gray-900">
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
              <div className="absolute top-3 left-3">
                <GradientIcon
                  icon={GlassWater}
                  primaryColor={restaurant?.metadata.primaryColor as string}
                />
              </div>
              <div className="absolute top-3 right-3 bg-gray-100 rounded-full p-1">
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              <div className="absolute bottom-3 left-4">
                <p className="font-14 text-gray-500 font-medium">My Orders</p>
                <p className="font-16 font-semibold text-gray-900">
                  {
                    transactions.filter(
                      (t) =>
                        t.fulfilled_by === null && t.item[0] !== PASS_MENU_TAG
                    ).length
                  }{" "}
                  Items
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="mt-6">
          {userData && restaurant && (
            <Rewards
              userData={userData}
              restaurant={restaurant}
              onIntentionToRedeem={(policy) => {
                setPolicy(policy);
                setIsOpen(true);
              }}
            />
          )}

          <div className="mt-8">
            {restaurant && state.cart && (
              <AccessCardSlider
                restaurant={restaurant}
                cart={state.cart}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                displayCartPasses={false}
              />
            )}
          </div>
          {/* Awesome Deals Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold">Awesome Deals</h1>
              <button
                className="text-sm font-semibold "
                style={{ color: restaurant?.metadata["primaryColor"] }}
                onClick={() => {
                  navigate(
                    OFFERS_PAGE_PATH.replace(":id", restaurant_id as string)
                  );
                }}
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto pb-2 no-scrollbar">
              <div className="flex gap-4 whitespace-nowrap">
                {policies
                  .filter((policy) => policy.definition.tag === NORMAL_DEAL_TAG)
                  .map((policy) => (
                    <DealCard
                      cart={state.cart}
                      policy={policy}
                      restaurant={restaurant}
                      primaryColor={restaurant?.metadata.primaryColor}
                      setPolicy={setPolicy}
                      setIsOpen={setIsOpen}
                      dealEffect={state.dealEffect}
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
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-5 w-5 text-black" />
              </button>
            )}
          </div>

          {/* Filters */}
          {searchResults.length > 0 ? (
            <div className="mb-4">
              <pre className="whitespace-pre-wrap break-words">
                {searchResults.map((searchResult, index) => (
                  <DrinkItem
                    key={index}
                    cart={state.cart}
                    restaurant={restaurant as Restaurant}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                    itemId={searchResult}
                    primaryColor={restaurant?.metadata.primaryColor as string}
                  />
                ))}
              </pre>
            </div>
          ) : (
            <>
              <div className="flex gap-3 mb-4 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
                {Object.keys(MENU_DISPLAY_MAP).map((filter) => (
                  <button
                    key={filter}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap border transition-all duration-150 ${
                      activeFilter === filter
                        ? "text-sm font-medium"
                        : "text-sm text-gray-500"
                    }`}
                    style={
                      activeFilter === filter
                        ? {
                            color: restaurant?.metadata.primaryColor,
                            borderColor: restaurant?.metadata.primaryColor,
                          }
                        : {
                            backgroundColor: "#f6f8fa",
                            borderColor: "#e5e7eb", // neutral border for inactive
                          }
                    }
                    onClick={() => {
                      setActiveFilter(filter);
                      setTimeout(() => scrollToOrderDrinks(), 100);
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              {/* Drinks List */}
              {restaurant && (
                <DrinkList
                  cart={state.cart}
                  label={activeFilter}
                  restaurant={restaurant}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  primaryColor={restaurant.metadata.primaryColor as string}
                />
              )}
            </>
          )}
        </div>

        {!userSession ? (
          <button
            onClick={() => setShowSignInModal(true)}
            className="mt-5 mb-5 px-4 py-2 bg-blue-600 text-white rounded-full font-medium shadow-sm hover:bg-blue-700 transition"
          >
            Sign in
          </button>
        ) : (
          <button
            onClick={logout}
            className="mt-5 mb-5 px-4 py-2 bg-gray-200 text-gray-800 rounded-full font-medium shadow-sm hover:bg-gray-300 transition"
          >
            Log out
          </button>
        )}
        {restaurant && (
          <GoToCartButton
            restaurant={restaurant}
            cartCount={
              state.cart.reduce((total, item) => total + item.quantity, 0) || 0
            }
          />
        )}
        <ToastContainer />
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => {
            setSidebarOpen(false);
          }}
        />
        {policy && (
          <PolicyModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            policy={policy as Policy}
            restaurant={restaurant as Restaurant}
            onAddToCart={addPolicy}
            state={state}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
          />
        )}
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
              className="flex-1 h-11 rounded-full overflow-hidden border border-gray-200 shadow-sm"
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
