import React, { useEffect, useState } from "react";
import Restaurant from "./restaurant";
import { useAuth } from "../context/auth_context";
import { TEST_USER } from "../constants";
import Discovery from "./discovery";

const Main: React.FC = () => {
  const { userSession, logout, login } = useAuth();

  return (
    <div>
      {restaurant === undefined ? (
        <div>
          <h1>TapIn</h1>
          <p>Fetching data ...</p>
        </div>
      ) : restaurant === null ? (
        <div>
          <Discovery />
        </div>
      ) : (
        <div>
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
