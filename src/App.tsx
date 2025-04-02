import { useAuth } from "./context/auth_context";

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

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
  POLICIES_PAGE_PATH,
  OFFERS_PAGE_PATH,
  SINGLE_POLICY_PAGE_PATH,
  INFO_PAGE_PATH,
} from "./constants.ts";
import SignIn from "./pages/signin/signin.tsx";
import CheckoutPage from "./pages/demo_checkout.tsx";
import { Check } from "lucide-react";
import DemoQR from "./pages/demo_qr.tsx";
import NotFoundPage from "./pages/not_found_page.tsx";
import CoverDeals from "./pages/cover_deals.tsx";
import RestaurantPage from "./pages/restaurant.tsx";
import RewardsPage from "./pages/rewards.tsx";
import TransactionList from "./pages/previous_transactions.tsx";
import PoliciesPage from "./pages/policies.tsx";
import SinglePolicyPage from "./pages/single_policy_page.tsx";
import { supabase } from "./utils/supabase_client.ts";
import { PhoneInput } from "./pages/signin/phone_input.tsx";
import { Verification } from "./pages/signin/verification.tsx";
import RestaurantInfo from "./pages/restaurant_info.tsx";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { showSignInModal, setShowSignInModal } = useAuth();

  return (
    <Router>
      {showSignInModal && (
        <SignInModal onClose={() => setShowSignInModal(false)} />
      )}
      <AppLoader />
      <Routes>
        <Route path={BASE_PATH} element={<Discovery />} />
        <Route path={DISCOVER_PATH} element={<Discovery />} />
        <Route path={SIGNIN_PATH} element={<SignIn />} />
        <Route path={RESTAURANT_PATH} element={<RestaurantPage />} />
        <Route path={DRINK_CHECKOUT_PATH} element={<CheckoutPage />} />
        <Route path={LOYALTY_REWARD_PATH} element={<RewardsPage />} />
        <Route path={OFFERS_PAGE_PATH} element={<PoliciesPage />} />
        <Route path={SINGLE_POLICY_PAGE_PATH} element={<SinglePolicyPage />} />
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
        <Route path="/cover_deals" element={<CoverDeals />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
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

const SignInModal = ({ onClose }: { onClose: () => void }) => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    requestAnimationFrame(() => {
      setVisible(true);
    });
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); // match transition duration
  };

  // Handle phone number submission
  const handlePhoneSubmit = async (phone: string) => {
    setErrorMessage(""); // Clear previous errors
    const formattedPhoneNumber = `+1${phone}`;
    setPhoneNumber(formattedPhoneNumber);

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhoneNumber,
    });

    if (error) {
      console.error("Error sending OTP:", error.message);
      setErrorMessage("Failed to send OTP. Please try again.");
    } else {
      console.log("OTP sent successfully.");
      setStep("verify");
    }
  };

  // Handle OTP verification
  const handleVerify = async (code: string) => {
    setErrorMessage(""); // Clear previous errors
    const { data: session, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: code,
      type: "sms",
    });

    if (error) {
      console.error("Error verifying OTP:", error.message);
      setErrorMessage("Invalid OTP. Please try again.");
    } else if (session) {
      console.log("User authenticated:", session.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div
        className={`bg-white w-full max-w-md rounded-t-2xl shadow-xl transition-transform duration-300 transform ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="p-6 relative h-[85vh] overflow-y-auto">
          <button
            onClick={handleClose}
            className="absolute font-4xl top-2 right-3 text-gray-500 hover:text-black"
          >
            ✕
          </button>

          <h2 className="text-xl font-bold mb-4">Sign In</h2>

          {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}

          {step === "phone" ? (
            <PhoneInput onClose={handleClose} onSubmit={handlePhoneSubmit} />
          ) : (
            <Verification
              phoneNumber={phoneNumber}
              onBack={() => setStep("phone")}
              onVerify={handleVerify}
            />
          )}
        </div>
      </div>
    </div>
  );
};
