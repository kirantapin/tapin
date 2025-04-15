import { useAuth } from "./context/auth_context";

import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import Discovery from "./pages/discovery.tsx";
import {
  BASE_PATH,
  QR_CODE_PATH,
  DRINK_CHECKOUT_PATH,
  SIGNIN_PATH,
  RESTAURANT_PATH,
  DISCOVER_PATH,
  LOYALTY_REWARD_PATH,
  PREVIOUS_TRANSACTIONS_PATH,
  OFFERS_PAGE_PATH,
  SINGLE_POLICY_PAGE_PATH,
  INFO_PAGE_PATH,
  DEVICE_NOT_SUPPORTED_PATH,
} from "./constants.ts";
import SignIn from "./components/signin/signin.tsx";
import CheckoutPage from "./pages/demo_checkout.tsx";
import DemoQR from "./pages/demo_qr.tsx";
import NotFoundPage from "./pages/not_found_page.tsx";
import RestaurantPage from "./pages/restaurant.tsx";
import TransactionList from "./pages/previous_transactions.tsx";
import PoliciesPage from "./pages/policies.tsx";
import RestaurantInfo from "./pages/restaurant_info.tsx";
import SignInModal from "./components/signin/signin_modal.tsx";
import { ToastContainer } from "react-toastify";
import DeviceNotSupported from "./pages/device_not_supported.tsx";
import OrderHistoryModal from "./components/bottom_sheets/history_modal.tsx";
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
        <Route path={BASE_PATH} element={<Discovery />} />
        <Route path={DISCOVER_PATH} element={<Discovery />} />
        <Route path={SIGNIN_PATH} element={<SignIn />} />
        <Route path={RESTAURANT_PATH} element={<RestaurantPage />} />
        <Route path={DRINK_CHECKOUT_PATH} element={<CheckoutPage />} />
        <Route path={OFFERS_PAGE_PATH} element={<PoliciesPage />} />
        <Route path={INFO_PAGE_PATH} element={<RestaurantInfo />} />
        <Route
          path={PREVIOUS_TRANSACTIONS_PATH}
          element={<TransactionList />}
        />
        <Route
          path={QR_CODE_PATH}
          element={
            <DemoQR
              onBack={() => {
                console.log("hello");
              }}
              onSkip={() => {
                console.log("hello");
              }}
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
        <Route
          path={DEVICE_NOT_SUPPORTED_PATH}
          element={<DeviceNotSupported />}
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
