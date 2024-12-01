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

export const TIRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/qrcode/" element={<QRCode />} />
        <Route path="/drink_checkout" element={<DrinkCheckout />} />
      </Routes>
    </Router>
  );
};

export default TIRouter;
