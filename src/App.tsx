import { useAuth } from "./context/auth_context";
import React, { Suspense, useState, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import {
  BASE_PATH,
  DRINK_CHECKOUT_PATH,
  RESTAURANT_PATH,
  MY_SPOT_PATH,
  OFFERS_PAGE_PATH,
  INFO_PAGE_PATH,
  DEVICE_NOT_SUPPORTED_PATH,
} from "./constants.ts";
import SignInModal from "./components/bottom_sheets/signin_modal.tsx";
import { ToastContainer } from "react-toastify";
import OrderHistoryModal from "./components/bottom_sheets/history_modal.tsx";
import ProfileModal from "./components/bottom_sheets/profile_modal.tsx";
import { RestaurantSkeleton } from "./components/skeletons/restaurant_skeleton.tsx";
import { CheckoutSkeleton } from "./components/skeletons/checkout_skeleton.tsx";
import { MySpotSkeleton } from "./components/skeletons/my_spot_skeleton.tsx";
import { OffersSkeleton } from "./components/skeletons/offers_skeleton.tsx";
// Lazy imports
const Discovery = lazy(() => import("./pages/discovery.tsx"));
const CheckoutPage = lazy(() => import("./pages/demo_checkout.tsx"));
const NotFoundPage = lazy(() => import("./pages/not_found_page.tsx"));
const MySpotContent = lazy(() => import("./pages/my_spot_content.tsx"));
const PoliciesPage = lazy(() => import("./pages/policies.tsx"));
const RestaurantInfo = lazy(() => import("./pages/restaurant_info.tsx"));
const DeviceNotSupported = lazy(
  () => import("./pages/device_not_supported.tsx")
);
const RestaurantPage = lazy(() => import("./pages/restaurant.tsx"));

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div>
      <ToastContainer stacked className="w-full" style={{ width: "100%" }} />
      <Routes>
        <Route
          path={BASE_PATH}
          element={
            <Suspense fallback={null}>
              <Discovery />
            </Suspense>
          }
        />
        <Route
          path={RESTAURANT_PATH}
          element={
            <Suspense fallback={<RestaurantSkeleton />}>
              <RestaurantPage />
            </Suspense>
          }
        />
        <Route
          path={DRINK_CHECKOUT_PATH}
          element={
            <Suspense fallback={<CheckoutSkeleton />}>
              <CheckoutPage />
            </Suspense>
          }
        />
        <Route
          path={OFFERS_PAGE_PATH}
          element={
            <Suspense fallback={<OffersSkeleton />}>
              <PoliciesPage />
            </Suspense>
          }
        />
        <Route
          path={INFO_PAGE_PATH}
          element={
            <Suspense fallback={null}>
              <RestaurantInfo />
            </Suspense>
          }
        />
        <Route
          path={MY_SPOT_PATH}
          element={
            <Suspense fallback={<MySpotSkeleton />}>
              <MySpotContent />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={null}>
              <NotFoundPage />
            </Suspense>
          }
        />
        <Route
          path={DEVICE_NOT_SUPPORTED_PATH}
          element={
            <Suspense fallback={null}>
              <DeviceNotSupported />
            </Suspense>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
