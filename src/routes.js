import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Main from "./pages/main";
import QRCode from "./pages/qr_code.tsx";
import Restaurant from "./pages/restaurant.tsx";
import { DrinkCheckout } from "./pages/drink_checkout.tsx";
import { SignIn } from "./pages/signin_page.tsx";
import {
  BASE_PATH,
  QR_CODE_PATH,
  DRINK_CHECKOUT_PATH,
  SIGNIN_PATH,
} from "./constants.ts";

export const TIRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path={BASE_PATH} element={<Main />} />
        <Route path={QR_CODE_PATH} element={<QRCode />} />
        <Route path={DRINK_CHECKOUT_PATH} element={<DrinkCheckout />} />
        <Route path={SIGNIN_PATH} element={<SignIn />} />
      </Routes>
    </Router>
  );
};

export default TIRouter;
