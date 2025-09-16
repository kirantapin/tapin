import { ArrowUp } from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth_context.tsx";
import { Restaurant, Transaction } from "../types.ts";
import { MAX_QR_TRANSACTIONS } from "../constants.ts";

import GoToCartButton from "@/components/buttons/go_to_cart_button.tsx";
import AccessCardSlider from "@/components/sliders/access_card_slider.tsx";
import Rewards from "@/components/rewards.tsx";
import { Sidebar } from "@/components/sidebar.tsx";
import { Hero } from "@/components/display_utils/hero.tsx";
import { useBannerColor } from "@/hooks/useBannerColor.tsx";
import HighlightSlider from "@/components/sliders/highlight_slider.tsx";
import { RecentActivity } from "@/components/sliders/recent_activity.tsx";
import { MySpot } from "@/components/my_spot.tsx";
import { PolicySlider } from "@/components/sliders/policy_slider.tsx";
import { ActionButtons } from "@/components/sliders/action_buttons.tsx";
import { useRestaurant } from "@/context/restaurant_context.tsx";
import BundleSlider from "@/components/sliders/bundle_slider.tsx";
import { useBottomSheet } from "@/context/bottom_sheet_context.tsx";
import LocationMarkerIcon from "@/components/svg/location_tag.tsx";
import { isOpenNow } from "@/utils/time.ts";
import FollowButton from "@/components/buttons/follow_button.tsx";
import { useUTMParams } from "@/hooks/useUTMParams.tsx";
import MainMenu from "@/components/display_utils/main_menu.tsx";
import CookieFooter from "@/components/display_utils/cookie_footer.tsx";

export default function RestaurantPage() {
  const { userSession, transactions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurant, policyManager, userOwnershipMap } = useRestaurant();
  const policies = policyManager?.policies;

  const orderDrinksRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { state, addToCart, removeFromCart, triggerToast, openBundleModal } =
    useBottomSheet();
  const { openQrModal } = useBottomSheet();
  const utmParams = useUTMParams({
    restaurant,
    openBundleModal,
    triggerToast,
  });

  const handleLocation = () => {
    let state = location.state;

    // If page was reloaded, check sessionStorage
    if (!state) {
      const raw = sessionStorage.getItem("postReloadState");
      if (raw) {
        state = JSON.parse(raw);
        sessionStorage.removeItem("postReloadState");
      }
    }

    const qrFlag = state?.qr as boolean | undefined;
    let message = state?.message as
      | {
          type: "success" | "error" | "info";
          message: string;
        }
      | undefined;

    if (qrFlag) {
      const qrTransactions = state?.transactions as Transaction[];
      if (qrTransactions.length > MAX_QR_TRANSACTIONS) {
        message = {
          type: "info",
          message: `This QR code only represents ${MAX_QR_TRANSACTIONS} purchased items, your other items can be found in My Spot`,
        };
      }
      openQrModal(qrTransactions.slice(0, MAX_QR_TRANSACTIONS));
    }

    if (message) {
      triggerToast(message.message, message.type, 5000);
    }

    // Clean up location.state to avoid re-triggering on internal nav
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
    const handleScroll = () => {
      if (orderDrinksRef.current) {
        const orderDrinksTop = orderDrinksRef.current.offsetTop;
        const scrollTop = window.scrollY;
        setShowScrollToTop(scrollTop >= orderDrinksTop);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    handleLocation();
  }, []);

  const [titleElement, setTitleElement] = useState<HTMLHeadingElement | null>(
    null
  );

  const titleRefCallback = (element: HTMLHeadingElement | null) => {
    setTitleElement(element); // This will trigger a re-render and useEffect
  };

  useBannerColor(titleElement, restaurant);

  if (!restaurant) return null;

  return (
    <div className="min-h-screen bg-gray-25">
      {/* Hero Image */}
      <Hero setSidebarOpen={setSidebarOpen} />

      {/* Restaurant Info */}
      <div className="mt-10 px-5">
        <div className="flex items-center justify-between gap-2">
          <h1
            ref={titleRefCallback} // Use the callback ref instead
            className="text-2xl font-bold truncate"
          >
            {restaurant?.name}
          </h1>

          {/* White background mask to cover inner part */}
          <FollowButton />
        </div>
        <div className="flex items-center gap-1 mt-1 mb-4">
          <LocationMarkerIcon fillColor="#6B7280" />
          <span className="text-sm text-gray-500 ml-1">
            {restaurant?.metadata.locationTag}
          </span>
          {isOpenNow(
            restaurant?.info.openingHours,
            restaurant?.metadata.timeZone
          ) !== undefined && (
            <>
              <span className="text-sm text-gray-500 ml-1">•</span>
              <span
                className="text-sm ml-1 font-semibold"
                style={{ color: restaurant?.metadata.primaryColor }}
              >
                {isOpenNow(
                  restaurant?.info.openingHours,
                  restaurant?.metadata.timeZone
                )
                  ? "Open Now"
                  : "Closed"}
              </span>
            </>
          )}
        </div>
        {/* Action Buttons */}
        <ActionButtons scrollToOrderDrinks={scrollToOrderDrinks} />
        {/* Highlight Slider */}

        <HighlightSlider displayOne={false} />

        {/* My Spot Section */}
        <MySpot userSession={userSession} transactions={transactions} />

        {/* Recent Activity Section*/}
        <RecentActivity
          transactions={transactions}
          restaurant={restaurant as Restaurant}
        />
        {/* Rewards Section */}
        <div className="mt-2">
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
            unlockedFirst={true}
          />

          {Object.keys(userOwnershipMap).length > 0 && (
            <div className="mt-2">
              <h1 className="text-xl font-bold">Great Value</h1>
              <BundleSlider />
            </div>
          )}

          <MainMenu
            orderDrinksRef={orderDrinksRef}
            scrollToOrderDrinks={scrollToOrderDrinks}
          />
        </div>

        {/* Scroll to Top Button */}
        {showScrollToTop && (
          <button
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className={`fixed z-40 w-14 h-14 bg-white rounded-full shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_10px_10px_-5px_rgba(0,0,0,0.2)] flex items-center justify-center left-3 mb-5`}
            style={{
              color: "white",
              backgroundColor: restaurant?.metadata.primaryColor,
              bottom:
                state.cart.reduce((total, item) => total + item.quantity, 0) > 0
                  ? "74px" // 20 (h-20) + 4 spacing = 24 spacing from bottom
                  : "0px", // Just 4 spacing from bottom
            }}
          >
            <ArrowUp className="w-7 h-7" />
          </button>
        )}

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
        <CookieFooter />
      </div>
    </div>
  );
}
