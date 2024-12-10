import React, { useState, useEffect } from "react";
import { Cart, DealEffectPayload, Item, CartItem } from "../types";
import { CheckoutLineItem } from "./checkout_line_item.tsx";

export const useDealDisplay = (
  cart: Cart,
  dealEffect: DealEffectPayload,
  onUpdate: (itemId: number, modifiedItem: CartItem) => void
) => {
  const [rendering, setRendering] = useState<JSX.Element>();

  const renderModifications = () => {
    // Calculate the cart price and prepare rendering
    let rendering: JSX.Element[] = [];
    const preDealTotalPrice = cart.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    const preDealPointCost = cart.reduce((total, item) => {
      return total + item.point_cost * item.quantity;
    }, 0);

    const preDealPoints = cart.reduce((total, item) => {
      return total + item.points * item.quantity;
    }, 0);

    rendering.push(<div>Subtotal {preDealTotalPrice}</div>);
    rendering.push(<div>Points {preDealPoints}</div>);
    rendering.push(<div>Point Cost {preDealPointCost}</div>);

    rendering = [
      ...rendering,
      ...(dealEffect?.freeAddedItems.map(
        (item: { item: Item; quantity: number }, index: number) => {
          return (
            <li key={index}>
              <CheckoutLineItem
                item={{
                  id: index,
                  item: item.item,
                  quantity: item.quantity,
                  price: 0,
                  points: 0,
                  point_cost: 0,
                }}
                onUpdate={onUpdate}
                lockedFields={["quantity", ...Object.keys(item.item)]}
              />
            </li>
          );
        }
      ) || []),
    ];

    // Process modified items
    for (const modification of dealEffect?.modifiedItems || []) {
      const modifiedItem = cart.find((item) => item.id === modification.id);
      if (!modifiedItem) {
        continue;
      }
      switch (modification.modificationType) {
        case "apply_fixed_discount":
          // Add logic for fixed discount
          const discount_deal = Math.min(
            modifiedItem.price,
            modification.amount
          );
          const total_fixed_discount = discount_deal * modification.quantity;
          rendering.push(
            <div key="apply_fixed_discount">
              -${total_fixed_discount.toFixed(2)}
            </div>
          );
          break;
        case "apply_point_multiplier":
          // Add logic for point multiplier
          break;
        case "apply_point_cost":
          // Add logic for point cost
          break;
        case "apply_percent_discount":
          const total_percent_discount =
            modification.amount * modifiedItem.price * modification.quantity;
          rendering.push(
            <div key="apply_fixed_discount">
              -${total_percent_discount.toFixed(2)}
            </div>
          );
          break;
      }
    }

    // Process whole cart modifications
    if (dealEffect?.wholeCartModification) {
      const modification = dealEffect?.wholeCartModification;
      switch (modification.modificationType) {
        case "apply_fixed_order_discount":
          // Add logic for fixed order discount
          rendering.push(
            <div key="apply_fixed_order_discount">
              Order Discount: -${modification.amount.toFixed(2)}
            </div>
          );
          break;
        case "apply_order_point_multiplier":
          // Add logic for order point multiplier
          rendering.push(
            <div key="apply_order_point_multiplier">
              Points multiplied: {modification.amount.toFixed(2)}
            </div>
          );
          break;
        case "apply_order_percent_discount":
          // Add logic for percent discount
          const percentOrderDiscount =
            (preDealTotalPrice * modification.amount) / 100;
          rendering.push(
            <div key="apply_order_percent_discount">
              {modification.amount}% Order Discount: -$
              {percentOrderDiscount.toFixed(2)}
            </div>
          );
          break;
        case "apply_blanket_price":
          // Add logic for blanket price
          rendering.push(
            <div key="apply_blanket_price">
              Blanket Price Applied: ${modification.amount.toFixed(2)}
            </div>
          );
          break;
        case "apply_blanket_point_cost":
          rendering.push(
            <div key="apply_blanket_point_cost">-{modification.amount}pts</div>
          );
          break;
      }
    }

    const fullRendering: JSX.Element = <div>{rendering}</div>;
    setRendering(fullRendering);
  };

  useEffect(() => {
    renderModifications();
  }, [cart, dealEffect]);

  return { rendering };
};
