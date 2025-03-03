import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useSupabase } from "../context/supabase_context.tsx";
import { Restaurant } from "../types";
import { useNavigate } from "react-router-dom";
import { RESTAURANT_PATH } from "../constants.ts";
import { project_url } from "../utils/supabase_client.ts";
// Mock data for restaurants

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

export default function RestaurantDiscovery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const supabase = useSupabase();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data, error } = await supabase.from("restaurants").select("*");
      if (error) console.error("Error fetching restaurants:", error.message);
      else setRestaurants(data);
    };
    fetchRestaurants();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);
    const filteredResults = restaurants.filter(
      (restaurant) =>
        restaurant.id.toLowerCase().includes(term) ||
        restaurant.name.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filteredResults);
  };

  return (
    <div className="min-h-screen flex flex-col items-center gap-8 px-4 py-8 bg-gray-50">
      <img
        src="/tapin_logo_black.png"
        alt="Tap In Logo"
        width={120}
        height={40}
        className=""
      />

      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-gray-900">
        Discover Bars & Restaurants
      </h1>

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
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
