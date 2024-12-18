import React, { useState } from "react";
import { CartItem } from "../../types";

interface CheckoutLineItemProps {
  item: CartItem;
  onUpdate: (itemId: number, modifiedItem: CartItem) => void;
  lockedFields: string[];
}
export const CheckoutLineItem: React.FC<CheckoutLineItemProps> = ({
  lockedFields,
  item,
  onUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [modifiedItem, setModifiedItem] = useState(item);

  // Toggle expanded view
  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // Handle changes to the drink details
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!lockedFields.includes(name)) {
      if (name === "quantity" || name == "price") {
        setModifiedItem((prev) => ({
          ...prev,
          [name]:
            name === "quantity" || name === "price" ? Number(value) : value,
        }));
      } else {
        setModifiedItem((prev) => ({
          ...prev,
          item: {
            ...prev.item,
            [name]: value,
          },
        }));
      }
    }
  };

  // Handle save action
  const handleSave = (itemId: number) => {
    onUpdate(itemId, modifiedItem); // Pass modified drink to parent component
    setIsExpanded(false); // Collapse the expanded view
  };

  return (
    <div
      style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}
    >
      {/* Line Item */}
      <div onClick={toggleExpand} style={{ cursor: "pointer" }}>
        <strong>
          {item.item.item === "drink"
            ? item.item.name
              ? item.item.name
              : item.item.category
            : item.item.item}
        </strong>{" "}
        - ${item.price} x {item.quantity}
        {item.item.item === "drink" && !item.item.name && (
          <span style={{ fontSize: "0.8em", marginLeft: "5px" }}>
            Drink has not been specified, you can still purchase it and it will
            be stored in your account but it cannot be redeemed right now.
          </span>
        )}
      </div>

      {/* Expanded Template */}
      {isExpanded && (
        <div style={{ marginTop: "10px" }}>
          <label>
            Category:{" "}
            <input
              type="text"
              name="category"
              value={modifiedItem.item.category || ""}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            Name:{" "}
            <input
              type="text"
              name="name"
              value={modifiedItem.item.name || ""}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>Price: {modifiedItem.price}</label>
          <br />
          <label>
            Quantity:{" "}
            <input
              type="number"
              name="quantity"
              value={modifiedItem.quantity}
              onChange={handleChange}
            />
          </label>
          <br />
          <button
            onClick={() => {
              handleSave(modifiedItem.id || 0);
            }}
            style={{ marginRight: "10px" }}
          >
            Save
          </button>
          <button onClick={toggleExpand}>Cancel</button>
        </div>
      )}
    </div>
  );
};
