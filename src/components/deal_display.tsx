import React, { useState } from "react";
import { Cart, DealEffectPayload, Item } from "../types";
import { CheckoutLineItem } from "./checkout_line_item.tsx";

interface DealDisplayProps {
  cart: Cart;
  dealEffect: DealEffectPayload;
  onUpdate: (
    total_price: number,
    total_points: number,
    rendering: JSX.Element
  ) => void;
}
export const DealDisplay: React.FC<DealDisplayProps> = ({
  cart,
  dealEffect,
  onUpdate,
}) => {
  const renderModifications = () => {
    //calculate the cart price
    let total_price: number = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let total_points: number = cart.reduce(
      (sum, item) => sum + item.points * item.quantity,
      0
    );

    let rendering: JSX.Element = (
      <>
        {dealEffect?.freeAddedItems.map(
          (item: { item: Item; quantity: number }, index: number) => (
            <li key={index}>
              <CheckoutLineItem
                item={{
                  id: index,
                  item: item.item,
                  quantity: item.quantity,
                  price: 0,
                  points: 0,
                }}
                onUpdate={() => console.log("hello")}
                lockedFields={["quantity", ...Object.keys(item.item)]}
              />
            </li>
          )
        )}
      </>
    );
    //go through modified items
    for (const modification of dealEffect?.modifiedItems || []) {
      const modifiedItem = cart.find((item) => item.id === modification.id);
      if (!modifiedItem) {
        continue;
      }
      switch (modification.modificationType) {
        case "apply_percent_discount":
          const percent_deduction =
            modifiedItem.price * modification.amount * modification.quantity;
          total_price -= percent_deduction;
          break;
        case "apply_fixed_discount":
          const fixed_deduction =
            Math.min(modifiedItem.price, modification.amount) *
            modification.quantity;
          total_price -= fixed_deduction;
          break;
        case "apply_point_multiplier":
          const added_points =
            (modification.amount - 1.0) *
            modifiedItem.points *
            modification.quantity;
          total_points += added_points;
          break;
      }
    }
    console.log(total_price);
    //go through
    if (dealEffect?.wholeCartModification) {
      const modification = dealEffect?.wholeCartModification;
      switch (dealEffect.wholeCartModification.modificationType) {
        case "apply_fixed_order_discount":
          total_price -= modification.amount;
          break;
        case "apply_order_point_multiplier":
          total_points *= modification.amount;
          break;
        case "apply_order_percent_discount":
          total_price *= 1.0 - modification.amount;
          break;
        case "apply_blanket_price":
          total_price = modification.amount;
          break;
      }
    }
    const fullRendering: JSX.Element = (
      <div>
        {rendering}
        <div>Total Price: {total_price}</div>
        <div>Total Points: {total_points}</div>
      </div>
    );
    onUpdate(total_price, total_points, fullRendering);
  };

  React.useEffect(() => {
    renderModifications();
  }, [cart, dealEffect]);

  return null;
};
