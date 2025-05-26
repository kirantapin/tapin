import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "../utils/supabase_client";
import { Restaurant } from "../types";
import { useNavigate } from "react-router-dom";
import { RESTAURANT_PATH } from "../constants.ts";
import { project_url } from "../utils/supabase_client.ts";
import { setThemeColor } from "../utils/color";
import { ImageUtils } from "@/utils/image_utils.ts";
export default function RestaurantDiscovery() {
  setThemeColor();
  const [restaurants, setRestaurants] = useState<
    {
      name: string;
      id: string;
      metadata: Record<string, any>;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("restaurants")
        .select("name,id,metadata");

      console.log(data);
      if (error) console.error("Error fetching restaurants:", error.message);
      else setRestaurants(data as Restaurant[]);
      setLoading(false);
    };
    window.scrollTo(0, 0);
    fetchRestaurants();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center gap-8 px-4 py-8 bg-white">
      <img
        src="/tapin_logo_black.png"
        alt="Tap In Logo"
        width={120}
        height={40}
        className=""
      />

      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-gray-900 self-start">
        Discover Bars & Restaurants
      </h1>

      <h3 className="text-xl font-normal tracking-tighter sm:text-5xl text-gray-900 self-start">
        More Locations Coming Soon
      </h3>

      <div className="w-full max-w-md space-y-4 mr-4 ml-4">
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-800 border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="w-full max-w-md bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer transition hover:shadow-lg mr-4"
                onClick={() =>
                  navigate(RESTAURANT_PATH.replace(":id", restaurant.id))
                }
              >
                {/* Hero Image */}
                <div className="h-32 relative">
                  <img
                    src={
                      ImageUtils.getHeroImageUrl(restaurant as Restaurant) || ""
                    }
                    alt={`${restaurant.name} Hero`}
                    className="w-full h-full object-cover"
                  />

                  {/* Profile Avatar */}
                  <div className="absolute -bottom-6 left-4">
                    <img
                      src={
                        ImageUtils.getProfileImageUrl(
                          restaurant as Restaurant
                        ) || ""
                      }
                      alt={restaurant.name}
                      className="w-16 h-16 object-cover rounded-full border-3 border-white shadow-sm"
                    />
                  </div>
                </div>

                {/* Card Content */}
                <div className="pt-8 px-4 pb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {restaurant.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {restaurant.metadata.locationTag}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
