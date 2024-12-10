import React, { useEffect, useState } from "react";
import Restaurant from "./restaurant";
import { useAuth } from "../context/auth_context";
import { useRestaurantData } from "../context/restaurant_context";
// import { AuthVerify } from "../components/auth_entry";
import { TEST_USER } from "../constants";

const Main: React.FC = () => {
  const { userSession, logout, login } = useAuth();

  const { restaurant, setRestaurant } = useRestaurantData();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {restaurant === undefined ? (
        <div>
          <h1>TapIn</h1>
          <p>Fetching data ...</p>
        </div>
      ) : restaurant === null ? (
        <div>
          <h1>Discovery</h1>
        </div>
      ) : (
        <div>
          <Restaurant restaurant={restaurant} />
          <button
            onClick={() => {
              login(TEST_USER);
            }}
          >
            Test Login
          </button>
          <button onClick={logout}>Test Logout</button>
          <button
            onClick={() => {
              console.log(userSession);
            }}
          >
            Print User Info
          </button>
        </div>
      )}
    </div>
  );
};

export default Main;
