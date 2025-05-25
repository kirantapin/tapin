import { Search, X } from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/auth_context.tsx";
import { Restaurant, Transaction } from "../types.ts";
import { MENU_DISPLAY_MAP, HOUSE_MIXER_LABEL } from "../constants.ts";

import { DrinkItem, DrinkList } from "@/components/menu_items.tsx";
import GoToCartButton from "@/components/go_to_cart_button.tsx";
import AccessCardSlider from "../components/sliders/access_card_slider.tsx";
import Rewards from "@/components/rewards.tsx";
import { Sidebar } from "@/components/sidebar.tsx";
import { useSearch } from "@/hooks/useSearch.tsx";
import { Hero } from "@/components/display_utils/hero.tsx";
import { useBannerColor } from "@/hooks/useBannerColor.tsx";
import HighlightSlider from "@/components/sliders/highlight_slider.tsx";
import { RecentActivity } from "@/components/sliders/recent_activity.tsx";
import { MySpot } from "@/components/my_spot.tsx";
// import { RestaurantSkeleton } from "@/components/skeletons/restaurant_skeleton.tsx";
import { PolicySlider } from "@/components/sliders/policy_slider.tsx";
import { ActionButtons } from "@/components/sliders/action_buttons.tsx";
import { useRestaurant } from "@/context/restaurant_context.tsx";
import BundleSlider from "@/components/sliders/bundle_slider.tsx";
import { useBottomSheet } from "@/context/bottom_sheet_context.tsx";
import LocationMarkerIcon from "@/components/svg/location_tag.tsx";
import { isOpenNow } from "@/utils/time.ts";
import LoadingPage from "@/components/skeletons/loading_page.tsx";

export default function RestaurantPage() {
  const { userSession, transactions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurant, policyManager, userOwnershipMap } = useRestaurant();
  const policies = policyManager?.policies;
  const { id } = useParams<{ id: string }>();
  const [activeFilter, setActiveFilter] = useState(HOUSE_MIXER_LABEL);
  const orderDrinksRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const { state, addToCart, removeFromCart, triggerToast } = useBottomSheet();
  const { openQrModal } = useBottomSheet();

  const { searchResults, searchQuery, setSearchQuery, clearSearch } = useSearch(
    {
      restaurant: restaurant as Restaurant,
      initialQuery: "",
    }
  );

  const handleLocation = () => {
    const qrFlag = location.state?.qr as boolean | undefined;
    const message = location.state?.message as
      | {
          type: "success" | "error" | "info";
          message: string;
        }
      | undefined;
    if (qrFlag) {
      const qrTransactions = location.state?.transactions as Transaction[];
      openQrModal(qrTransactions);
    }
    if (message) {
      triggerToast(message.message, message.type);
    }
    navigate(location.pathname, { replace: true, state: null });
  };

  const scrollToOrderDrinks = () => {
    if (!orderDrinksRef.current) return;

    orderDrinksRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    handleLocation();
  }, []);

  const [titleElement, setTitleElement] = useState<HTMLHeadingElement | null>(
    null
  );

  const titleRefCallback = (element: HTMLHeadingElement | null) => {
    setTitleElement(element); // This will trigger a re-render and useEffect
  };

  // Now useBannerColor can use titleElement instead of ref
  useBannerColor(titleElement, restaurant);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  if (!restaurant) return <LoadingPage />;

  return (
    <div className="min-h-screen bg-gray-25">
      {/* Hero Image */}
      <Hero restaurant_id={id as string} setSidebarOpen={setSidebarOpen} />

      {/* Restaurant Info */}
      <div className="mt-10 px-5">
        <div className="flex items-center gap-2">
          <h1
            ref={titleRefCallback} // Use the callback ref instead
            className="text-2xl font-bold"
          >
            {restaurant?.name}
          </h1>
        </div>
        <div className="flex items-center gap-1 mt-1 mb-4">
          {/* <MapPin className="w-4 h-4 text-gray-500" /> */}
          <LocationMarkerIcon fillColor="#6B7280" />
          <span className="text-sm text-gray-500 ml-1">
            {restaurant?.metadata.locationTag}
          </span>
          {isOpenNow(restaurant?.info.openingHours) !== undefined && (
            <>
              <span className="text-sm text-gray-500 ml-1">•</span>
              <span
                className="text-sm ml-1 font-semibold"
                style={{ color: restaurant?.metadata.primaryColor as string }}
              >
                {isOpenNow(restaurant?.info.openingHours)
                  ? "Open Now"
                  : "Closed"}
              </span>
            </>
          )}
        </div>
        {/* Action Buttons */}
        <ActionButtons scrollToOrderDrinks={scrollToOrderDrinks} />
        {/* Highlight Slider */}

        <HighlightSlider
          addToCart={async (itemId: string) => {
            await addToCart({ id: itemId, modifiers: [] }, true);
          }}
          policies={policies || []}
        />

        {/* My Spot Section */}
        <MySpot userSession={userSession} transactions={transactions} />

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
          <Rewards viewAll={false} />

          <div className="mt-8">
            {state.cart && (
              <AccessCardSlider
                restaurant={restaurant}
                cart={state.cart}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                displayCartPasses={false}
                dealEffect={null}
              />
            )}
          </div>
          {/* Awesome Deals Section */}
          <PolicySlider
            restaurant={restaurant}
            policies={policies || []}
            state={state}
          />

          {userOwnershipMap &&
            Object.values(userOwnershipMap).some((isOwned) => !isOwned) && (
              <div className="mt-2">
                <h1 className="text-xl font-bold">Great Value</h1>
                <BundleSlider />
              </div>
            )}

          <div
            ref={orderDrinksRef}
            className="sticky top-0 z-10 bg-white border-b shadow-[0_4px_6px_-6px_rgba(0,0,0,0.1)] pt-1 -mx-4 px-4"
          >
            <div className="flex justify-between items-center mb-3 mt-3">
              <h2 className="text-xl font-bold">Order Drinks</h2>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-12 pr-4 py-3 border rounded-full text-base outline-none"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                onClick={() => {
                  setTimeout(() => {
                    scrollToOrderDrinks();
                  }, 200);
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
            <div
              className="flex gap-3 mb-4 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar"
              ref={scrollContainerRef}
            >
              {Object.keys(MENU_DISPLAY_MAP).map((filter) => (
                <button
                  key={filter}
                  ref={(el) => {
                    if (el) {
                      buttonRefs.current.set(filter, el);
                    }
                  }}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap border transition-all duration-150 font-medium ${
                    activeFilter === filter
                      ? "text-sm"
                      : "text-sm text-gray-500"
                  }`}
                  style={
                    activeFilter === filter
                      ? {
                          color: restaurant?.metadata.primaryColor as string,
                          borderColor: restaurant?.metadata
                            .primaryColor as string,
                        }
                      : {
                          backgroundColor: "#f6f8fa",
                          borderColor: "#e5e7eb", // neutral border for inactive
                        }
                  }
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter(filter);
                    const button = buttonRefs.current.get(filter);
                    const container = scrollContainerRef.current;
                    if (button && container) {
                      const scrollLeft = button.offsetLeft - 10;
                      container.scrollTo({
                        left: scrollLeft,
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          {searchResults.length > 0 ? (
            <div
              style={{
                height: `calc(100vh - ${
                  (orderDrinksRef.current?.offsetHeight || 0) + 10
                }px)`,
              }}
            >
              <pre className="whitespace-pre-wrap break-words">
                {searchResults.map((searchResult, index) => (
                  <DrinkItem
                    key={searchResult}
                    cart={state.cart}
                    restaurant={restaurant as Restaurant}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                    item={{ id: searchResult, modifiers: [] }}
                  />
                ))}
              </pre>
            </div>
          ) : (
            <>
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
        <Sidebar
          restaurant={restaurant as Restaurant}
          isOpen={sidebarOpen}
          onClose={() => {
            setSidebarOpen(false);
          }}
        />
      </div>
    </div>
  );
}
