import { useAuth } from "./context/auth_context";

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Main from "./pages/main";
import QRCode from "./pages/qr_code.tsx";
import Restaurant from "./pages/restaurant.tsx";
import { DrinkCheckout } from "./pages/drink_checkout.tsx";
// import { SignIn } from "./pages/signin_page.tsx";
import RestaurantPage from "./pages/restaurant.tsx";
import Discovery from "./pages/discovery.tsx";
import FigmaPage from "./pages/demo_restaurant.tsx";
import {
  BASE_PATH,
  QR_CODE_PATH,
  DRINK_CHECKOUT_PATH,
  SIGNIN_PATH,
  RESTAURANT_PATH,
  DISCOVER_PATH,
} from "./constants.ts";
import Demo2 from "./pages/demo_restaurant2.tsx";
import SignIn from "./pages/signin/signin.tsx";
import CheckoutPage from "./pages/demo_checkout.tsx";
import { Check } from "lucide-react";
import DemoQR from "./pages/demo_qr.tsx";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);

  return (
    <Router>
      <AppLoader />
      <Routes>
        <Route path={BASE_PATH} element={<Discovery />} />
        <Route path={RESTAURANT_PATH} element={<RestaurantPage />} />
        <Route path={DISCOVER_PATH} element={<Discovery />} />
        <Route path={QR_CODE_PATH} element={<QRCode />} />
        <Route path={DRINK_CHECKOUT_PATH} element={<DrinkCheckout />} />
        {/* <Route path={SIGNIN_PATH} element={<SignIn />} /> */}
        <Route path={"/demo/:id"} element={<FigmaPage />} />
        <Route path={"/demo2/:id"} element={<Demo2 />} />
        <Route path={"/demo_signin"} element={<SignIn />} />
        <Route path={"/demo_checkout"} element={<CheckoutPage />} />
        <Route
          path={"demo_qr"}
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
      </Routes>
    </Router>
  );
};

// Loader Component with Navigation Logic
const AppLoader: React.FC = () => {
  const { loadingUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
