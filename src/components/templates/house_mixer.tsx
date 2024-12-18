import React, { useState, ChangeEvent, FormEvent } from "react";
import { DrinkForm, Menu, Restaurant } from "../../types";

const HouseMixerTemplate: React.FC<DrinkForm> = ({ restaurant }) => {
  // Set up state for form fields
  const liquorItems = Object.keys(restaurant.menu["liquor" as keyof Menu]);
  const [selectedItem, setSelectedItem] = useState<string | null>();

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedItem(e.target.value); // Get the selected value from the dropdown
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="menu-item">Select a Liquor:</label>
        <select
          id="menu-item"
          value={selectedItem || ""}
          onChange={handleChange}
          required
        >
          {liquorItems.map((liquor, index) => (
            <option key={index} value={liquor}>
              {liquor}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

export default HouseMixerTemplate;
