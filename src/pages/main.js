import React from "react";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../context/context.tsx";
import { useSupabase } from "../context/supabase_context.tsx";
import Restaurant from "./restaurant.tsx";
import { useAuth } from "../context/auth_context.tsx";
// import { AuthVerify } from "../components/auth_entry";

const Main = () => {
  // Function to handle button clicks
  const [data, setData] = useState();
  const { state, setState } = useContext(MyContext);
  const navigate = useNavigate();
  const supabase = useSupabase();
  const [loading, setLoading] = useState(true);
  const {
    userSession,
    logout,
    login,
    is_authenticated,
    restaurant,
    setRestaurant,
  } = useAuth();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {!restaurant ? (
        <div>
          <h1>TapIn</h1>
        </div>
      ) : (
        <div>
          <Restaurant restaurant={restaurant} />
          <button
            onClick={() => {
              const person = { name: "John Doe", phone: "1234567891" };
              login(person);
            }}
          >
            Test Login
          </button>
          <button onClick={logout}>Test Logout</button>
          <button
            onClick={() => {
              console.log(userSession);
              console.log(is_authenticated);
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
