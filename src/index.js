import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { AuthProvider } from "./context/auth_context.tsx";
import { SupabaseProvider } from "./context/supabase_context.tsx";
import { RestaurantProvider } from "./context/restaurant_context.tsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <SupabaseProvider>
    <AuthProvider>
      <RestaurantProvider>
        <App />
      </RestaurantProvider>
    </AuthProvider>
  </SupabaseProvider>
);
serviceWorkerRegistration.register();
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
