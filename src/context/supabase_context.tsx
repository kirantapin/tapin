// src/context/SupabaseContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase_client.ts";

type SupabaseContextType = SupabaseClient;

const SupabaseContext = createContext<SupabaseContextType>(supabase);

interface SupabaseProviderProps {
  children: ReactNode; // React children to render inside the provider
}

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({
  children,
}) => {
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
