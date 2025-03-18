import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useSupabase } from "../context/supabase_context.tsx";
import { Restaurant } from "../types";
import { useNavigate } from "react-router-dom";
import { RESTAURANT_PATH, MENU_DISPLAY_MAP } from "../constants.ts";
import { project_url } from "../utils/supabase_client.ts";
// Mock data for restaurants

export default function MenuSearchbar({ menu, handleResults }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [restaurants, setRestaurants] = useState<string[]>([]);
  const supabase = useSupabase();
  const navigate = useNavigate();


  const scrapeMenu=()=>(
    for (const [path, items] of Object.entries(MENU_DISPLAY_MAP)) {
        //add all strings from path
        //add all items
    }
  )

  useEffect(() => {
    const fetchRestaurants = async () => {
      const resultMapping = {};
    };
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
    <div className="min-h-screen flex flex-col items-center gap-8 px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for restaurants..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-4 pl-12 text-sm rounded-full border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#F5B14C] focus:border-transparent transition duration-300 ease-in-out"
          />
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black"
            size={20}
          />
        </div>
      </div>

      <div className="w-full max-w-md space-y-4">
        {restaurants &&
          restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-[#F5B14C] flex justify-between items-center"
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
                  className="w-16 h-16 object-cover rounded-md border-2 border-black"
                />
              </div>
            </div>
          ))}
        {searchResults.length === 0 && (
          <p className="text-center text-gray-600">
            No restaurants found. Try a different search term.
          </p>
        )}
      </div>
    </div>
  );
}
