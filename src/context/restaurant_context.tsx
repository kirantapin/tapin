import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { useSupabase } from "./supabase_context.tsx";
import { Restaurant, Policy } from "../types.ts";

interface RestaurantContextProps {
  //undefined should mean restaurant is still in a loading process null is restaurant is not selected
  restaurant: Restaurant | null | undefined;
  setRestaurant: React.Dispatch<
    React.SetStateAction<Restaurant | null | undefined>
  >;
  policies: Policy[];
  setPolicies: React.Dispatch<React.SetStateAction<Policy[]>>;
}

interface RestaurantProviderProps {
  children: ReactNode; // React children passed to the provider
}
export const RestaurantContext = createContext<
  RestaurantContextProps | undefined
>(undefined);

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({
  children,
}) => {
  // Define the state you want to share
  const supabase = useSupabase();

  const [restaurant, setRestaurant] = useState<Restaurant | null | undefined>();
  const [policies, setPolicies] = useState<Policy[]>([]);

  return (
    <RestaurantContext.Provider
      value={{
        restaurant,
        setRestaurant,
        policies,
        setPolicies,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurantData = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error(
      "useRestaurantData must be used within an RestaurantProvider"
    );
  }
  return context;
};
