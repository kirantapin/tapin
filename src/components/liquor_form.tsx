import React, { useState } from "react";
import {
  HOUSE_MIXER_LABEL,
  MENU_DISPLAY_MAP,
  DRINK_MENU_TAG,
} from "@/constants";
import { titleCase } from "title-case";

const LiquorForm = ({ type, menu, addToCart, primaryColor }) => {
  const [selectedLiquor, setSelectedLiquor] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mixer, setMixer] = useState("");
  const [modifiers, setModifiers] = useState<string[]>([]);
  const [currentCustomModifier, setCurrentCustomModifier] =
    useState<string>("");

  const liquorMenu = MENU_DISPLAY_MAP[type].reduce(
    (acc, key) => (acc && acc[key] ? acc[key] : undefined),
    menu
  );
  const liquors = Object.keys(liquorMenu);

  const handleSelectLiquor = (liquor) => {
    setSelectedLiquor(liquor);
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedLiquor) {
      return;
    }
    const formData =
      type === HOUSE_MIXER_LABEL
        ? { liquor: selectedLiquor, mixer }
        : { liquor: selectedLiquor };

    const liquorPath = structuredClone(MENU_DISPLAY_MAP[type]);
    liquorPath.push(selectedLiquor);
    liquorPath.push("house");
    addToCart({ path: liquorPath, modifiers: modifiers });

    setSelectedLiquor("");
    setMixer("");
  };

  const addModifier = (modifier: string) => {
    if (modifier.trim() && !modifiers.includes(modifier.trim())) {
      setModifiers((prevModifiers) => [...prevModifiers, modifier.trim()]);
    }
  };

  const removeModifier = (modifier: string) => {
    setModifiers((prevModifiers) =>
      prevModifiers.filter((mod) => mod !== modifier)
    );
  };

  const toggleModifier = (modifier: string) => {
    if (modifiers.includes(modifier)) {
      removeModifier(modifier);
    } else {
      addModifier(modifier);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border rounded-lg shadow-md"
    >
      <div className="relative">
        <label
          htmlFor="liquor"
          className="block text-sm font-medium text-gray-700"
        >
          Liquor
        </label>
        <div
          className="mt-1 p-2 border border-gray-300 rounded-md shadow-sm cursor-pointer flex justify-between items-center"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
        >
          <span>{titleCase(selectedLiquor) || "Select a liquor"}</span>
          <svg
            className={`w-5 h-5 transform ${
              isDropdownOpen ? "rotate-180" : "rotate-0"
            } transition-transform`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>

        {isDropdownOpen && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
            {liquors.map((liquor) => (
              <div
                key={liquor}
                onClick={() => handleSelectLiquor(liquor)}
                className="p-2 cursor-pointer"
                style={{
                  backgroundColor:
                    selectedLiquor === liquor
                      ? `${primaryColor}33` // Adds opacity (33 = 20% opacity)
                      : "transparent",
                }}
              >
                {titleCase(liquor)}
              </div>
            ))}
          </div>
        )}
      </div>

      {type === HOUSE_MIXER_LABEL && (
        <div>
          <label
            htmlFor="mixer"
            className="block text-sm font-medium text-gray-700"
          >
            Mixer
          </label>
          <input
            type="text"
            id="mixer"
            value={mixer}
            onChange={(e) => setMixer(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            placeholder="e.g., Coke, Orange Juice"
            required
          />
        </div>
      )}
      {type === HOUSE_MIXER_LABEL && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Modifiers
          </label>
          <div className="flex gap-2 mt-2">
            {["Double", "Triple"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleModifier(option.toLowerCase())}
                className={`px-4 py-2 border rounded-md cursor-pointer transition ${
                  modifiers.includes(option.toLowerCase())
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          {/* Custom Modifier Input */}
          <input
            type="text"
            value={currentCustomModifier}
            onChange={(e) => setCurrentCustomModifier(e.target.value)}
            className="mt-2 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Custom modifier (e.g., Extra Ice, Less Sweet)"
          />
          <button
            type="button"
            onClick={() => {
              addModifier(currentCustomModifier);
              setCurrentCustomModifier("");
            }}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Add Modifier
          </button>

          {/* Display Selected Modifiers */}
          {modifiers.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">
                Selected Modifiers:
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {modifiers.map((mod) => (
                  <div
                    key={mod}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-300 rounded-md cursor-pointer"
                    onClick={() => removeModifier(mod)}
                  >
                    {mod}
                    <span className="text-xs text-red-600 font-bold">✕</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        className="w-full  text-white py-2 rounded-md transition"
        style={{ backgroundColor: primaryColor }}
      >
        Add To Cart
      </button>
    </form>
  );
};

export default LiquorForm;
