import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { AuthProvider } from "./context/auth_context.tsx";
import { DeviceProvider } from "./context/device_context.tsx";
import { BrowserRouter as Router } from "react-router-dom";
import { RestaurantProvider } from "./context/restaurant_context.tsx";
import { BottomSheetProvider } from "./context/bottom_sheet_context.tsx";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <DeviceProvider>
        <AuthProvider>
          <RestaurantProvider>
            <BottomSheetProvider>
              <App />
            </BottomSheetProvider>
          </RestaurantProvider>
        </AuthProvider>
      </DeviceProvider>
    </Router>
  </React.StrictMode>
);
serviceWorkerRegistration.register();
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
