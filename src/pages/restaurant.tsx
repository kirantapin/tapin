import {
  Menu,
  ShoppingBag,
  User,
  Info,
  Gift,
  Search,
  BadgeCheck,
  Beer,
  X,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/auth_context.tsx";
import { Restaurant, Policy } from "../types.ts";
import {
  MENU_DISPLAY_MAP,
  HOUSE_MIXER_LABEL,
  OFFERS_PAGE_PATH,
  NORMAL_DEAL_TAG,
  INFO_PAGE_PATH,
  LOYALTY_REWARD_TAG,
} from "../constants.ts";

import { fetch_policies } from "../utils/queries/policies.ts";
import { fetchRestaurantById } from "../utils/queries/restaurant.ts";

import { DrinkItem, DrinkList } from "@/components/menu_items.tsx";
import GoToCartButton from "@/components/go_to_cart_button.tsx";
import AccessCardSlider from "../components/sliders/access_card_slider.tsx";
import Rewards from "@/components/rewards.tsx";
import { Sidebar } from "@/components/sidebar.tsx";
import DealCard from "@/components/cards/small_policy.tsx";
import PolicyModal from "@/components/bottom_sheets/policy_modal.tsx";
import { useCartManager } from "@/hooks/useCartManager.tsx";
import { useSearch } from "@/hooks/useSearch.tsx";
import { GradientIcon, Hero } from "@/utils/gradient.tsx";
import { useBannerColor } from "@/hooks/useBannerColor.tsx";
import HighlightSlider from "@/components/sliders/highlight_slider.tsx";
import { RecentActivity } from "@/components/sliders/recent_activity.tsx";
import { MySpot } from "@/components/my_spot.tsx";
import { RestaurantSkeleton } from "@/components/skeletons/restaurant.tsx";
import { PolicySlider } from "@/components/sliders/policy_slider.tsx";

export default function RestaurantPage() {
  const { userSession, userData, transactions, setShowSignInModal } = useAuth();
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
  const { state, addToCart, removeFromCart, addPolicy } = useCartManager(
    restaurant as Restaurant,
    userSession
  );

  const { searchResults, searchQuery, setSearchQuery, clearSearch } = useSearch(
    {
      restaurant: restaurant as Restaurant,
      initialQuery: "",
    }
  );

  const scrollToOrderDrinks = () => {
    if (!orderDrinksRef.current) return;
    const elementPosition = orderDrinksRef.current.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - 20;
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!restaurant_id) {
      navigate("/not_found_page");
    }
  }, [restaurant_id]);

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
  }, [restaurant_id]);

  const titleRef = useRef<HTMLHeadingElement>(null);
  useBannerColor(titleRef, restaurant);

  if (loading) {
    return <RestaurantSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-25">
      {/* Header Icons */}
      {!isOpen && (
        <div className="absolute w-full top-0 z-50 flex justify-between items-center px-4 py-3">
          <div
            className="bg-white p-2 rounded-full"
            onClick={() => {
              setSidebarOpen(true);
            }}
          >
            <Menu className="w-5 h-5 text-black" />
          </div>

          {/* Shopping Bag & User Icons */}
          <div className="flex items-center gap-5">
            <div className="bg-white p-2 rounded-full">
              <ShoppingBag className="w-5 h-5 text-black" />
            </div>
            <div className="bg-white p-2 rounded-full">
              <User className="w-5 h-5 text-black" />
            </div>
          </div>
        </div>
      )}
      {/* Hero Image */}
      <Hero restaurant_id={restaurant_id as string} />

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
        {/* Highlight Slider */}
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

        <MySpot
          userSession={userSession}
          restaurant={restaurant}
          transactions={transactions}
        />

        {/* Recent Activity Section*/}
        <RecentActivity
          transactions={transactions}
          restaurant={restaurant as Restaurant}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          state={state}
        />
        {/* Rewards Section */}
        <div className="mt-6">
          {userData && (
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
            {state.cart && (
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
          <PolicySlider
            restaurant={restaurant}
            policies={policies}
            state={state}
            setPolicy={setPolicy}
            setIsOpen={setIsOpen}
          />

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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                const searchBarRect = e.currentTarget.getBoundingClientRect();
                window.scrollTo({
                  top: window.scrollY + searchBarRect.top - 50,
                  behavior: "smooth",
                });
              }}
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
              <DrinkList
                cart={state.cart}
                label={activeFilter}
                restaurant={restaurant}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                setActiveLabel={setActiveFilter}
              />
            </>
          )}
        </div>
        <GoToCartButton
          restaurant={restaurant}
          cartCount={
            state.cart.reduce((total, item) => total + item.quantity, 0) || 0
          }
        />
        {searchQuery && (
          <>
            <div className="h-64" />
            <div className="h-64" />
            <div className="h-64" />
          </>
        )}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => {
            setSidebarOpen(false);
          }}
          navigateToSignIn={() => {
            setSidebarOpen(false);
            setShowSignInModal(true);
          }}
          setLoading={setLoading}
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
  );
}
