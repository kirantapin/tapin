import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Minus } from "lucide-react";
import {
  HOUSE_MIXER_LABEL,
  MENU_DISPLAY_MAP,
  PASS_INDICATOR,
  PASS_MENU_TAG,
  SHOTS_SHOOTERS_LABEL,
} from "@/constants";
import LiquorForm from "./liquor_form";
import { titleCase } from "title-case";
import { Cart, Restaurant, SingleMenuItem } from "@/types";
import { project_url } from "@/utils/supabase_client";
import { isEqual } from "lodash";

function DrinkItem({
  key,
  cart,
  restaurant_id,
  name,
  menuItem,
  addToCart,
  removeFromCart,
  drinkPath,
  primaryColor,
}: {
  key: string;
  cart: Cart;
  restaurant_id: string;
  name: string;
  menuItem: SingleMenuItem;
  addToCart;
  removeFromCart;
  drinkPath: string[];
  primaryColor: string;
}) {
  const isPass = drinkPath[0] === PASS_MENU_TAG;
  const cartItem = cart.find((item) => isEqual(item.item.path, drinkPath));
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="flex items-stretch m-3 border p-3 rounded-3xl bg-white">
      {/* Image */}
      <div className="h-24 w-24 mr-4 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 p-3">
        <img
          src={
            menuItem.imageUrl ||
            `${project_url}/storage/v1/object/public/restaurant_images/${restaurant_id}_profile.png`
          }
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Text + Price + Button */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-base">{titleCase(name)}</h3>
            {isPass && (
              <span className="text-xs text-gray-500 ml-2">
                {menuItem.for_date}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">
            {menuItem.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="font-bold text-base">${menuItem.price.toFixed(2)}</p>

          {quantity > 0 ? (
            <div className="flex items-center bg-white rounded-full px-3 py-1 ">
              <button
                onClick={() =>
                  removeFromCart(cartItem?.id, { quantity: quantity - 1 })
                }
                className="w-6 h-6 flex items-center justify-center rounded-full"
                style={{ backgroundColor: primaryColor }}
              >
                {quantity > 1 ? (
                  <Minus className="w-4 h-4 text-white" />
                ) : (
                  <Trash2 className="w-4 h-4 text-white" />
                )}
              </button>
              <span className="mx-3 text-sm font-semibold text-gray-800">
                {quantity}
              </span>
              <button
                onClick={() =>
                  addToCart({
                    path: drinkPath,
                    modifiers: [],
                  })
                }
                className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <button
              className="h-7 w-7 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: primaryColor }}
              onClick={() => {
                addToCart({ path: drinkPath, modifiers: [] });
              }}
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const DrinkList = ({
  cart,
  label,
  restaurant,
  addToCart,
  removeFromCart,
  primaryColor,
}: {
  cart: Cart;
  label: string;
  restaurant: Restaurant;
  addToCart;
  removeFromCart;
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
      return x;
    }
  }
  const drinks = useMemo(() => {
    return getNestedObject(label, restaurant.menu);
  }, [label, restaurant.menu]);

  return (
    <div className="space-y-4">
      {label === HOUSE_MIXER_LABEL || label === SHOTS_SHOOTERS_LABEL ? (
        <LiquorForm
          type={label}
          menu={restaurant.menu}
          addToCart={addToCart}
          primaryColor={primaryColor}
        />
      ) : label === "Passes" ? (
        <div>
          {Object.entries(drinks).map(([name, dateObjects], index) =>
            Object.entries(dateObjects).map(([date, itemInfo], index) => {
              console.log(drinks);
              console.log(name, date, itemInfo);
              itemInfo["for_date"] = date;
              return (
                <DrinkItem
                  key={name}
                  cart={cart}
                  restaurant_id={restaurant.id}
                  name={name}
                  menuItem={itemInfo}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  drinkPath={[...MENU_DISPLAY_MAP[label], name, date]}
                  primaryColor={primaryColor}
                />
              );
            })
          )}
        </div>
      ) : (
        <div>
          {Object.entries(drinks).map(([name, menuItem], index) => (
            <DrinkItem
              key={name}
              cart={cart}
              restaurant_id={restaurant.id}
              name={name}
              menuItem={menuItem}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              drinkPath={[...MENU_DISPLAY_MAP[label], name]}
              primaryColor={primaryColor}
            />
          ))}
        </div>
      )}
    </div>
  );
};
