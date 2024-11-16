import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Main from "./pages/main";
import QRCode from "./pages/qr_code";
import Restaurant from "./pages/restaurant";
import Checkout from "./pages/checkout";

export const TIRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/qrcode" element={<QRCode />} />
      </Routes>
    </Router>
  );
};

export default TIRouter;
