import React, { useEffect, useState } from "react";
import { useSupabase } from "../context/supabase_context";
import { Restaurant } from "../types";
import { RestaurantDiscoveryCard } from "../components/restaurant_discovery_card.tsx";
import { Wrapper } from "../styles/styles.ts";
import { Banner } from "../styles/styles.ts";
import ScrollToolbar from "../components/scroll_toolbar.tsx";

const Discovery: React.FC = () => {
  const supabase = useSupabase();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data, error } = await supabase.from("restaurants").select("*"); // Fetch all columns
      console.log(data);
      if (error) {
        console.error("Error fetching restaurants:", error.message);
      } else {
        setRestaurants(data);
      }
    };

    fetchRestaurants();
  }, []);
  return (
    <div>
      <Banner>TapIn</Banner>
      <Wrapper>
        {restaurants.map((restaurant, index) => (
          <RestaurantDiscoveryCard restaurant={restaurant} />
        ))}
      </Wrapper>
      <ScrollToolbar />
    </div>
  );
};

export default Discovery;
