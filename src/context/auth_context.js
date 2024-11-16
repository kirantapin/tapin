import React, { createContext, useState, useEffect, useContext } from "react";
import { useSupabase } from "./supabase_context";
// Create a context with default values (optional)
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Define the state you want to share
  const [userSession, setUserSession] = useState(() => {
    // Initialize user session from local storage (if available)
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [userData, setUserData] = useState(null);
  const supabase = useSupabase();

  useEffect(() => {
    if (userSession) {
      fetch_user_data(userSession);
    } else {
      setUserData(null);
    }
  }, [userSession]);

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
      value={{ userSession, login, logout, is_authenticated, userData }}
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
