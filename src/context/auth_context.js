import React, { createContext, useState, useEffect, useContext } from "react";
import { useSupabase } from "./supabase_context";
import moment from "moment-timezone";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Define the state you want to share
  const supabase = useSupabase();
  const [userSession, setUserSession] = useState(() => {
    // Initialize user session from local storage (if available)
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [userData, setUserData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [foundRestaurant, setFoundRestaurant] = useState();
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    if (userSession) {
      fetch_user_data(userSession);
      fetch_transaction_data(userSession);
      const fetch_data = async () => {
        const restaurant_data = await find_closest_restaurants();
        fetch_policies(restaurant_data.id);
      };
      fetch_data();
    } else {
      setUserData(null);
    }
  }, [userSession]);

  const fetch_policies = async (restaurant_id) => {
    const currentTime = new Date().toISOString();

    console.log(currentTime);
    const { data, error } = await supabase
      .from("policies")
      .select("*")
      .eq("restaurant_id", restaurant_id)
      .lte("begin_time", currentTime)
      .gte("end_time", currentTime);
    console.log("here");
    console.log(data);
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setPolicies(data);
    }
  };

  const fetch_user_data = async (user) => {
    if (user) {
      try {
        const phone = user.phone;
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", phone)
          .single();
        if (error) {
          console.error("Error fetching user:", error);
          setUserSession(null);
          return;
        }
        setUserData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    } else {
      setUserData(null);
    }
  };

  const find_closest_restaurants = async () => {
    // console.log("hello");
    try {
      const { data, error } = await supabase.functions.invoke(
        "closest_restaurant",
        {
          body: JSON.stringify({ foo: "bar" }),
        }
      );
      if (error) throw error;
      const restaurant_data = data[0];
      //set global context to store restaurant data
      setFoundRestaurant(restaurant_data);
      return restaurant_data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetch_transaction_data = async (userSession) => {
    console.log("inside fetch transaction data");
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const formattedDate = ninetyDaysAgo.toISOString();
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userSession.phone)
      .gte("created_at", formattedDate)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    setTransactions(data);
  };

  const validateSession = async (userSession) => {
    try {
      // Step 1: Get tokens from localStorage
      const access_token = userSession.accessToken;
      const refresh_token = userSession.refreshToken;

      // Either Token is missing
      if (!access_token || !refresh_token) {
        console.log("No tokens found");
        logout();
        return false;
      }

      // Step 2: Set the current access token in the Supabase client
      supabase.auth.setAuth(access_token);

      // Step 3: Check if the access token is still valid
      const { data: user, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        // Step 4: Try to refresh the session if the access token is invalid
        const { data, error: refreshError } =
          await supabase.auth.refreshSession({
            refresh_token: refresh_token,
          });

        if (refreshError || !data) {
          console.error("Error refreshing session:", refreshError);
          logout();
          return false;
        }

        // Save the new access and refresh tokens
        userSession.accessToken = data.session.access_token;
        userSession.refreshToken = data.session.refresh_token;
        login(userSession);

        return true;
      }

      // If access token is valid, return the user
      return true;
    } catch (err) {
      console.error("Unexpected error:", err);
      logout();
      return false;
    }
  };

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUserSession(userData);
  };

  // Function to log out the user
  const logout = () => {
    localStorage.removeItem("user");
    setUserSession(null);
  };

  const is_authenticated = !!userSession;

  return (
    <AuthContext.Provider
      value={{
        userSession,
        login,
        logout,
        is_authenticated,
        userData,
        setUserData,
        transactions,
        setTransactions,
        foundRestaurant,
        policies,
        setPolicies,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
