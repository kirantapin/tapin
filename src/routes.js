import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Main from "./pages/main";
import QRCode from "./pages/qr_code";
import Restaurant from "./pages/restaurant";
import { DrinkCheckout } from "./components/drink_checkout";

export const TIRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/qrcode/:transaction_id" element={<QRCode />} />
        <Route path="/drink_select/:template" element={<DrinkCheckout />} />
      </Routes>
    </Router>
  );
};

export default TIRouter;
