import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase_client";
import { Restaurant } from "../types";
import { useNavigate } from "react-router-dom";
import { RESTAURANT_PATH } from "../constants.ts";
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
                className="w-full max-w-md bg-white rounded-2xl overflow-hidden cursor-pointer mr-4 border  border-gray-300"
                onClick={() =>
                  navigate(RESTAURANT_PATH.replace(":id", restaurant.id))
                }
              >
                {/* Hero Image */}
                <div className="h-32 relative">
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                  <img
                    src={
                      ImageUtils.getHeroImageUrl(restaurant as Restaurant) || ""
                    }
                    alt={`${restaurant.name} Hero`}
                    className="w-full h-full object-cover relative z-0 transition-opacity duration-300"
                    onLoad={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                    style={{ opacity: 0 }}
                  />

                  {/* Profile Avatar */}
                  <div className="absolute -bottom-4 left-4 z-20">
                    <img
                      src={
                        ImageUtils.getProfileImageUrl(
                          restaurant as Restaurant
                        ) || ""
                      }
                      alt={restaurant.name}
                      className="w-16 h-16 object-cover rounded-full border border-1 border-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3),0_10px_10px_-5px_rgba(0,0,0,0.2)]"
                    />
                  </div>
                </div>

                {/* Card Content */}
                <div className="pt-6 px-4 pb-4">
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
