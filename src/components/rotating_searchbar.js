import React, { useState } from "react";
import { submit_drink_order } from "../utils/submit_drink_order";

const SearchBar = ({ action, menu }) => {
  const [query, setQuery] = useState("");

  // Handle input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (query.trim()) {
      const data = await submit_drink_order(query, menu); // Trigger the search function
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
