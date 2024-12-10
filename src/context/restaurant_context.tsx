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
  restaurant: Restaurant | null | undefined;
  setRestaurant: React.Dispatch<
    React.SetStateAction<Restaurant | null | undefined>
  >;
  policies: Policy[];
  setPolicies: React.Dispatch<React.SetStateAction<Policy[]>>;
  loadingRestaurantData: boolean;
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
  const [loadingRestaurantData, setLoadingRestaurantData] = useState(true);

  useEffect(() => {
    const fetch_data = async () => {
      setLoadingRestaurantData(true);
      await find_closest_restaurants();
      setLoadingRestaurantData(false);
    };
    fetch_data();
  }, []);

  const find_closest_restaurants = async () => {
    const { latitude, longitude } = await getCurrentPositionAsync();
    if (!latitude || !longitude) {
      setRestaurant(null);
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke(
        "closest_restaurant",
        {
          body: JSON.stringify({
            latitude: latitude,
            longitude: longitude,
          }),
        }
      );
      if (error) {
        setRestaurant(null);
        return;
      }
      const restaurant_data = data[0];
      await fetch_policies(restaurant_data.id);
      //set global context to store restaurant data
      setRestaurant(restaurant_data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getCurrentPositionAsync = (): Promise<{
    latitude: number;
    longitude: number;
  }> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Call resolve when the operation succeeds
          resolve(position.coords);
        },
        (error) => {
          // Call reject when the operation fails
          reject(error);
        }
      );
    });
  };
  const fetch_policies = async (restaurant_id: string) => {
    const currentTime = new Date().toISOString();

    console.log(currentTime);
    const { data, error } = await supabase
      .from("policies")
      .select("*")
      .eq("restaurant_id", restaurant_id)
      .or(
        `and(begin_time.lte.${currentTime},end_time.gte.${currentTime}),and(begin_time.is.null,end_time.is.null)`
      );
    if (error) {
      console.error("Error fetching data:", error);
    } else {
      setPolicies(data);
    }
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurant,
        setRestaurant,
        policies,
        setPolicies,
        loadingRestaurantData,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurantData = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
