import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  HOUSE_MIXER_LABEL,
  MENU_DISPLAY_MAP,
  SHOTS_SHOOTERS_LABEL,
} from "@/constants";
import LiquorForm from "./liquor_form";
import { titleCase } from "title-case";

function DrinkItem({
  key,
  name,
  description,
  price,
  image,
  addToCart,
  drinkPath,
  primaryColor,
}: {
  key: string;
  name: string;
  description: string;
  price: number;
  image: string;
  addToCart;
  drinkPath: string[];
  primaryColor: string;
}) {
  return (
    <div className="flex items-center m-3">
      <div className="h-16 w-16 mr-3 rounded-md overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-bold">{titleCase(name)}</h3>
        <p className="text-xs text-gray-500">{description}</p>
        <p className=" font-bold" style={{ color: primaryColor }}>
          ${price}
        </p>
      </div>
      <button
        className="h-7 w-7 rounded-full flex items-center justify-center text-white"
        style={{ backgroundColor: primaryColor }}
        onClick={() => {
          const temp = [...drinkPath];
          temp.push(name);
          addToCart({ path: temp, modifiers: [] });
        }}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export const DrinkList = ({
  label,
  restaurantMenu,
  addToCart,
  primaryColor,
}: {
  label: string;
  restaurantMenu;
  addToCart;
  primaryColor: string;
}) => {
  function getNestedObject(label, menu) {
    if (label === HOUSE_MIXER_LABEL || label === SHOTS_SHOOTERS_LABEL) {
      return {};
    } else {
      const keys = MENU_DISPLAY_MAP[label];
      const x = keys.reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : null),
        menu
      );
      console.log(x);
      return x;
    }
  }
  const [drinks, setDrinks] = useState();

  useEffect(() => {
    console.log(label);
    setDrinks(getNestedObject(label, restaurantMenu));
  }, [label]);
  return (
    <div className="space-y-4">
      {label === HOUSE_MIXER_LABEL || label === SHOTS_SHOOTERS_LABEL ? (
        <LiquorForm
          type={label}
          menu={restaurantMenu}
          addToCart={addToCart}
          primaryColor={primaryColor}
        />
      ) : (
        <div>
          {Object.entries(drinks).map(([name, price], index) => (
            <DrinkItem
              key={name}
              name={name}
              description={
                "Tequila, lime, and triple sec, served on the rocks or frozen"
              }
              price={price}
              image={
                "https://s-sdistributing.com/wp-content/uploads/Bud-Light-2.png"
              }
              addToCart={addToCart}
              drinkPath={MENU_DISPLAY_MAP[label]}
              primaryColor={primaryColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};
