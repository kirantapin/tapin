import React, { useEffect, useState } from "react";
import { useRestaurant } from "@/context/restaurant_context";
import { Cart } from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { isOpenNow } from "@/utils/time";
import { ChefHat } from "lucide-react";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useOrderDetails } from "@/context/order_details_context";

interface FulfillmentToggleProps {
  cart: Cart;
  isImmediateFulfillment: boolean;
  onToggle: (value: boolean) => void;
}

export const FulfillmentToggle: React.FC<FulfillmentToggleProps> = ({
  cart,
  isImmediateFulfillment,
  onToggle,
}) => {
  const { restaurant } = useRestaurant();
  const { triggerToast } = useBottomSheet();
  const { userDisplayName, serviceType, setShowNameInput } = useOrderDetails();

  // Get items that require fulfillment
  const fulfillableItems = restaurant
    ? cart.filter((cartItem) =>
        ItemUtils.requiresFulfillment(cartItem.item, restaurant)
      )
    : [];

  // Check if location is open
  const isLocationOpen = restaurant
    ? isOpenNow(restaurant.info.openingHours, restaurant.metadata.timeZone)
    : false;

  // If location is closed, disable immediate fulfillment
  const canImmediateFulfill = isLocationOpen === true;

  // If location is closed, force store to account
  const effectiveValue = canImmediateFulfill ? isImmediateFulfillment : false;

  // Early returns after all hooks
  if (!restaurant) return null;

  // If no fulfillable items, don't show the toggle
  if (fulfillableItems.length === 0) return null;

  // Get item descriptors for display (includes quantity, variations, and modifiers)
  const fulfillableItemDescriptors = fulfillableItems.map((cartItem) => {
    const itemName = ItemUtils.getItemName(cartItem.item, restaurant);
    const modifierNames = ItemUtils.getItemModifierNames(
      cartItem.item,
      restaurant
    );

    // Build the descriptor
    let descriptor = itemName;

    // Add variation and modifiers if they exist
    if (modifierNames.length > 0) {
      descriptor += ` (${modifierNames.join(", ")})`;
    }

    // Prepend quantity if > 1
    if (cartItem.quantity > 1) {
      descriptor = `${cartItem.quantity}x ${descriptor}`;
    }

    return descriptor;
  });

  return (
    <div className="p-4 mb-4 rounded-xl border border-gray-300 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <ChefHat
              className="w-6 h-6 flex-shrink-0"
              style={{ color: restaurant.metadata.primaryColor }}
            />
            <p className="text-md font-semibold text-gray-800 m-0">
              {!canImmediateFulfill
                ? `${restaurant.name} is closed. Items will be stored to your account.`
                : effectiveValue
                ? "Send to kitchen directly"
                : "Save to My Spot"}
            </p>
          </div>
          <p className="text-xs text-gray-600 mt-2 mr-2">
            {!canImmediateFulfill
              ? `Items will be stored to My Spot for later redemption.`
              : effectiveValue
              ? "Redeem Items now - your order will be sent to the kitchen directly."
              : "All items will be stored to your account."}
          </p>
        </div>
        <button
          onClick={() => {
            if (canImmediateFulfill) {
              if (!effectiveValue) {
                if (!userDisplayName) {
                  setShowNameInput(true, (name, serviceType) => {
                    onToggle(true);
                  });
                } else {
                  onToggle(true);
                }
              } else {
                onToggle(!effectiveValue);
              }
            } else {
              triggerToast(
                `${restaurant.name} is closed. You can still purchase items to be stored to your account.`,
                "info"
              );
            }
          }}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors ${
            canImmediateFulfill
              ? "focus:ring-gray-500"
              : "cursor-not-allowed opacity-60"
          } ${
            effectiveValue
              ? `bg-[${restaurant.metadata.primaryColor}]`
              : "bg-gray-300"
          }`}
          style={{
            backgroundColor: canImmediateFulfill
              ? effectiveValue
                ? restaurant.metadata.primaryColor
                : "#d1d5db"
              : "#d1d5db",
          }}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              effectiveValue ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      {effectiveValue && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {(userDisplayName || serviceType) && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 flex-1">
                {userDisplayName && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-600">Order name:</p>
                    <p className="text-xs font-semibold text-gray-800">
                      {userDisplayName}
                    </p>
                  </div>
                )}
                {serviceType && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-600">Order for:</p>
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium text-white"
                      style={{
                        backgroundColor: restaurant.metadata.primaryColor,
                      }}
                    >
                      {serviceType === "pickup" ? "Pickup" : "Dine In"}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowNameInput(true)}
                className="text-xs font-medium px-2 py-1"
                style={{
                  color: restaurant.metadata.primaryColor,
                }}
              >
                Change
              </button>
            </div>
          )}
          {fulfillableItemDescriptors.length > 0 && (
            <>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Items to send to kitchen directly:
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                {fulfillableItemDescriptors.map((descriptor, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700"
                  >
                    {descriptor}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
