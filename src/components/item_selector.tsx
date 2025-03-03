import React, { useState, useEffect, useRef } from "react";

export function ItemSelector({ menu, handleSelected }) {
  const [selectedPath, setSelectedPath] = useState([]);
  const [item, setItem] = useState();

  const handleSelect = (key, value) => {
    console.log(key, value);
    if (typeof value === "object") {
      // Navigate deeper into the menu
      setSelectedPath([...selectedPath, key]);
      setItem(undefined);
    } else {
      // Select an item (leaf node)
      setSelectedPath([...selectedPath, key]);
      setItem(key);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    setSelectedPath(selectedPath.slice(0, -1));
    setItem(undefined);
  };

  // Resolve current level based on path
  const currentMenu = selectedPath.reduce((acc, key) => acc[key] || {}, menu);

  return (
    <div>
      {menu && (
        <div>
          {" "}
          <h3>Current Selection Path: {selectedPath.join(" > ") || "Root"}</h3>
          {selectedPath.length > 0 && (
            <button type="button" onClick={handleBack}>
              ⬅️ Back
            </button>
          )}
          <ul>
            {Object.entries(currentMenu)
              .filter(([key]) => key !== "default")
              .map(([key, value]) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => handleSelect(key, value)}
                  >
                    {key} {typeof value === "object" ? "📂" : `(${value})`}
                  </button>
                </li>
              ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              if (selectedPath.length == 0) {
                console.error("no selected path and no item");
                return;
              }
              handleSelected(selectedPath);
            }}
          >
            Select
          </button>
          <button
            type="button"
            onClick={() => {
              console.log(selectedPath);
            }}
          >
            test
          </button>
        </div>
      )}
    </div>
  );
}
