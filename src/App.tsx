import { useAuth } from "./context/auth_context";
import React, { Suspense, useState, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import {
  BASE_PATH,
  DRINK_CHECKOUT_PATH,
  RESTAURANT_PATH,
  DISCOVER_PATH,
  PREVIOUS_TRANSACTIONS_PATH,
  OFFERS_PAGE_PATH,
  INFO_PAGE_PATH,
  DEVICE_NOT_SUPPORTED_PATH,
} from "./constants.ts";
import SignInModal from "./components/signin/signin_modal.tsx";
import { ToastContainer } from "react-toastify";
import OrderHistoryModal from "./components/bottom_sheets/history_modal.tsx";
import { RestaurantSkeleton } from "./components/skeletons/restaurant.tsx";
import StickyTest from "./pages/sticky_test.tsx";

// Lazy imports
const Discovery = lazy(() => import("./pages/discovery.tsx"));
const CheckoutPage = lazy(() => import("./pages/demo_checkout.tsx"));
const NotFoundPage = lazy(() => import("./pages/not_found_page.tsx"));
const TransactionList = lazy(() => import("./pages/previous_transactions.tsx"));
const PoliciesPage = lazy(() => import("./pages/policies.tsx"));
const RestaurantInfo = lazy(() => import("./pages/restaurant_info.tsx"));
const DeviceNotSupported = lazy(
  () => import("./pages/device_not_supported.tsx")
);
const RestaurantPage = lazy(() => import("./pages/restaurant.tsx"));

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const {
    showSignInModal,
    setShowSignInModal,
    showOrderHistoryModal,
    setShowOrderHistoryModal,
  } = useAuth();

  return (
    <div>
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />
      <OrderHistoryModal
        isOpen={showOrderHistoryModal}
        onClose={() => setShowOrderHistoryModal(false)}
      />
      <AppLoader />
      <ToastContainer stacked className="w-full" style={{ width: "100%" }} />
      <Routes>
        <Route
          path={BASE_PATH}
          element={
            <Suspense fallback={<div>...loading</div>}>
              <Discovery />
            </Suspense>
          }
        />
        <Route
          path={DISCOVER_PATH}
          element={
            <Suspense fallback={<div>...loading</div>}>
              <Discovery />
            </Suspense>
          }
        />
        <Route
          path={"/sticky_test"}
          element={
            <Suspense fallback={<div>...loading</div>}>
              <StickyTest />
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
            <Suspense fallback={<div>...loading</div>}>
              <CheckoutPage />
            </Suspense>
          }
        />
        <Route
          path={OFFERS_PAGE_PATH}
          element={
            <Suspense fallback={<div>...loading</div>}>
              <PoliciesPage />
            </Suspense>
          }
        />
        <Route
          path={INFO_PAGE_PATH}
          element={
            <Suspense fallback={<div>...loading</div>}>
              <RestaurantInfo />
            </Suspense>
          }
        />
        <Route
          path={PREVIOUS_TRANSACTIONS_PATH}
          element={
            <Suspense fallback={<div>...loading</div>}>
              <TransactionList />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<div>...loading</div>}>
              <NotFoundPage />
            </Suspense>
          }
        />
        <Route
          path={DEVICE_NOT_SUPPORTED_PATH}
          element={
            <Suspense fallback={<div>...loading</div>}>
              <DeviceNotSupported />
            </Suspense>
          }
        />
      </Routes>
    </div>
  );
};

// Loader Component with Navigation Logic
const AppLoader: React.FC = () => {
  const { loadingUser } = useAuth();
  const [loading, setLoading] = useState(true);

  if (loadingUser) {
    // Display a loader while fetching data
    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}
      >
        <h1>Loading...</h1>
      </div>
    );
  }

  return null; // Render nothing once loading is done
};

export default App;
