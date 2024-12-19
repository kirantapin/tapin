import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { DrinkForm, DrinkMenu, Menu, Restaurant } from "../../types";

export const HouseMixerTemplate: React.FC<DrinkForm> = ({
  restaurant,
  onUpdate,
  transaction,
}) => {
  const liquorItems = Object.keys(restaurant.menu.drink.liquor).filter(
    (key) => key !== "default" // Exclude the 'default' key
  );

  const [selectedLiquor, setSelectedLiquor] = useState<string | null>(null);
  const [selectedMixer, setSelectedMixer] = useState<string | null>(null);

  useEffect(() => {
    if (selectedLiquor && selectedMixer) {
      const houseMixerMeta = {
        name: `${selectedLiquor} and ${selectedMixer}`,
        modifiers: "",
        liquorType: selectedLiquor,
        mixer: selectedMixer,
        liquorBrand: restaurant.menu.drink.liquor[selectedLiquor].default,
      };
      onUpdate(houseMixerMeta);
    }
  }, [selectedLiquor, selectedMixer]);
  // Handle input changes
  const handleChange = (key: string, e: ChangeEvent<HTMLSelectElement>) => {
    console.log(key, e.target.value);
    const value = e.target.value;
    if (key === "liquorType") {
      setSelectedLiquor(value);
    } else if (key === "mixer") {
      setSelectedMixer(value);
    }
  };

  return (
    <div>
      <button
        onClick={() => {
          console.log(transaction.metadata);
        }}
      >
        see transaction
      </button>
      <form>
        <div>
          <label htmlFor="menu-item">Select a Liquor:</label>
          <p>Liquor</p>
          <select
            id="menu-item"
            value={selectedLiquor || ""}
            onChange={(e) => {
              handleChange("liquorType", e);
            }}
            required
          >
            {liquorItems.map((liquor, index) => (
              <option key={index} value={liquor}>
                {liquor}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="menu-item">Select a Mixer:</label>
          <p>Mixer</p>
          <select
            id="menu-item"
            value={selectedMixer || ""}
            onChange={(e) => handleChange("mixer", e)}
            required
          >
            {["coke", "sprite", "water", "lemonade"].map((mixer, index) => (
              <option key={index} value={mixer}>
                {mixer}
              </option>
            ))}
          </select>
        </div>
      </form>
    </div>
  );
};
