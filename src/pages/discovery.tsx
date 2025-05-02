import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useSupabase } from "../context/supabase_context.tsx";
import { Restaurant } from "../types";
import { useNavigate } from "react-router-dom";
import { RESTAURANT_PATH } from "../constants.ts";
import { project_url } from "../utils/supabase_client.ts";
import { setThemeColor } from "../utils/color";
export default function RestaurantDiscovery() {
  setThemeColor();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = useSupabase();
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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    const filteredResults = restaurants.filter(
      (restaurant) =>
        restaurant.id.toLowerCase().includes(term.toLowerCase()) ||
        restaurant.name.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filteredResults);
  };

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

      <div className="w-full max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for restaurants..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-4 pl-12 text-sm rounded-full border border-black focus:outline-none focus:ring-2 focus:ring-[#CAA650] focus:border-transparent transition duration-300 ease-in-out"
          />
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black"
            size={20}
          />
        </div>
      </div>

      <div className="w-full max-w-md space-y-4 mr-4 ml-8">
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-800 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="p-4 rounded-xl bg-white shadow-md transition-shadow  border-l-8 flex justify-between items-center mr-4"
                style={{
                  borderLeftColor: restaurant.metadata.primaryColor,
                }}
                onClick={() =>
                  navigate(RESTAURANT_PATH.replace(":id", restaurant.id))
                }
              >
                <h2 className="text-lg font-semibold text-gray-900">
                  {restaurant.name}
                </h2>
                <div>
                  <img
                    src={`${project_url}/storage/v1/object/public/restaurant_images/${restaurant.id}_profile.png`}
                    alt={restaurant.name}
                    className="w-16 h-16 object-cover rounded-md "
                  />
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
