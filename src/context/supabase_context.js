// src/context/SupabaseContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabase_client";

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
  const [client] = useState(supabase);

  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  );
};

// Custom hook for easy access to Supabase client
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};
