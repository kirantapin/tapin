import React, { useState } from "react";
import { submit_drink_order } from "../utils/submit_drink_order.ts";
import { Restaurant } from "../types.ts";

interface SearchBarProps {
  action: (data: any) => void; // Replace `any` with a more specific type if you know the structure of the data
  restaurant_id: string; // Replace `any` with a specific type that represents the menu structure
}

const SearchBar: React.FC<SearchBarProps> = ({ action, restaurant_id }) => {
  const [query, setQuery] = useState("");

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      const data = await submit_drink_order(query, restaurant_id); // Trigger the search function
      if (!data) {
        throw Error("submit drink order result is null");
      }
      action(data);
      setQuery(""); // Clear the input field
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleInputChange}
        className="search-input"
      />
      <button type="submit" className="search-button">
        Get Drink
      </button>
    </form>
  );
};

export default SearchBar;
