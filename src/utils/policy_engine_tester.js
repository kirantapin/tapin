export function qualifiesForDeal(cart, deal) {
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  for (const condition of deal.conditions || []) {
    if (condition.type === "minimum_quantity") {
      // Check if the total quantity of specified items meets the condition
      const totalQuantity = cart
        .filter((item) => condition.itemIds.includes(item.itemId))
        .reduce((sum, item) => sum + item.quantity, 0);
      if (totalQuantity < condition.quantity) {
        console.log(
          `Deal does not apply: You need at least ${
            condition.quantity
          } of ${condition.itemIds.join(
            ", "
          )} in your cart, but you only have ${totalQuantity}.`
        );
        return false;
      }
    }

    if (condition.type === "minimum_cart_total") {
      // Check if the total cart value meets the condition
      if (cartTotal < condition.amount) {
        console.log(
          `Deal does not apply: Your cart total is $${cartTotal}, but it needs to be at least $${condition.amount}.`
        );
        return false;
      }
    }
  }

  console.log("Deal applies: All conditions met.");
  return true; // Passes all conditions
}

export function applyDeal(cart, deal) {
  if (!qualifiesForDeal(cart, deal)) {
    return cart; // No changes if the deal doesn't qualify
  }

  const updatedCart = [...cart]; // Copy the cart

  for (const action of deal.actions || []) {
    //add free item currently checks if an instance of item with price =0 already exists if it does it just increments that quantity else it just adds and instance of the free item to the updated cart.
    if (action.type === "add_free_item") {
      const freeItemIndex = updatedCart.findIndex(
        (item) => item.itemId === action.itemId && item.price === 0
      );
      if (freeItemIndex !== -1) {
        updatedCart[freeItemIndex].quantity += action.quantity;
      } else {
        updatedCart.push({
          itemId: action.itemId,
          quantity: action.quantity,
          price: 0, // Free item
        });
      }
    } else if (action.type === "apply_discount") {
      // apply a percentage discount to specific items(or all items if action.itemIds is not defined) up to a maximum number of items specified by deal
      let discountedItems = 0;
      updatedCart.forEach((item) => {
        if (
          (!action.itemIds ||
            action.itemIds.length === 0 ||
            action.itemIds.includes(item.itemId)) &&
          discountedItems < (action.maxDiscountedItems || Infinity)
        ) {
          const discount = (item.price * action.discountPercentage) / 100;
          item.price -= discount;
          discountedItems += 1;
        }
      });
    } else if (action.type === "apply_fixed_discount") {
      //the purpose is to apply a fixed discount amount to specific items(or all items) up to a max number of discounted items.
      let discountedItems = 0;
      updatedCart.forEach((item, index) => {
        if (
          (!action.itemIds || action.itemIds.includes(item.itemId)) &&
          discountedItems < (action.maxDiscountedItems || Infinity)
        ) {
          let itemsToDiscount = Math.min(
            item.quantity,
            action.maxDiscountedItems - discountedItems
          ); // How many items can still be discounted?

          if (itemsToDiscount > 0) {
            // Reduce the original item quantity
            item.quantity -= itemsToDiscount;

            // Prevent zero-quantity items
            if (item.quantity === 0) {
              updatedCart.splice(index, 1); // Remove the item from the cart if none left
            }

            // Add a new cart entry for discounted items
            updatedCart.push({
              itemId: item.itemId,
              quantity: itemsToDiscount,
              price: Math.max(item.price - action.amount, 0), // Prevent negative prices
            });

            // Update the counter for how many items have been discounted
            discountedItems += itemsToDiscount;
          }
        }
      });
    } else if (action.type === "apply_point_multiplier") {
      let multipliedItems = 0;
      updatedCart.forEach((item) => {
        if (
          (!action.itemIds || action.itemIds.includes(item.itemId)) &&
          multipliedItems < (action.maxMultipliedItems || Infinity)
        ) {
          item.pointsMultiplier =
            (item.pointsMultiplier || item.price * 100) * action.multiplier;
          multipliedItems += 1;
        }
      });
    } else if (action.type === "apply_order_discount") {
      // Apply discount to the whole cart
      updatedCart.totalDiscount =
        (updatedCart.totalDiscount || 0) + action.amount;
    } else if (action.type === "apply_order_point_multiplier") {
      // Apply point multiplier to the whole cart
      if (!updatedCart.orderPointsMultiplier) {
        const totalPrice = updatedCart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        updatedCart.orderPointsMultiplier = totalPrice * 100; // Base points
      }

      // Apply the multiplier
      updatedCart.orderPointsMultiplier *= action.multiplier;
    }
  }

  return updatedCart;
}

//test functions
const bogoDeal = {
  id: "bogo_item_1",
  conditions: [{ type: "minimum_quantity", itemIds: ["item_1"], quantity: 1 }],
  actions: [{ type: "add_free_item", itemId: "item_2", quantity: 1 }],
};
const buyXGetNext50Off = {
  id: "buy_x_get_50_off",
  conditions: [{ type: "minimum_quantity", itemIds: ["item_1"], quantity: 2 }],
  actions: [
    {
      type: "apply_discount",
      itemIds: ["item_1"],
      discountPercentage: 50,
      maxDiscountedItems: 1,
    },
  ],
};
const buyXPointMultiplierOrder = {
  id: "buy_x_point_multiplier_order",
  conditions: [{ type: "minimum_quantity", itemIds: ["item_1"], quantity: 1 }],
  actions: [{ type: "apply_order_point_multiplier", multiplier: 2 }],
};
const generalDiscount = {
  id: "general_discount",
  actions: [
    { type: "apply_order_discount", amount: 10 }, // $10 off the whole cart
  ],
};
const general10PercentOff = {
  id: "general_10_percent_off",
  actions: [
    {
      type: "apply_discount", // Action to apply a percentage discount
      itemIds: [], // Empty means it applies to all items in the cart
      discountPercentage: 10, // 10% off
      maxDiscountedItems: Infinity, // No limit on the number of items
    },
  ],
};
const buyXGetFixedDiscount = {
  id: "buy_x_get_fixed_discount",
  conditions: [{ type: "minimum_quantity", itemIds: ["item_1"], quantity: 3 }],
  actions: [{ type: "apply_fixed_discount", amount: 5, maxDiscountedItems: 3 }],
};

const buyOneGetSecond5Off = {
  id: "buy_one_get_second_5_off",
  conditions: [
    {
      type: "minimum_quantity", // Condition is based on quantity
      itemIds: ["item_1"], // Applies to `item_1`
      quantity: 2, // Must have at least 2 `item_1` in the cart
    },
  ],
  actions: [
    {
      type: "apply_fixed_discount", // Action applies a fixed discount
      itemIds: ["item_1"], // Discount applies to `item_1`
      amount: 5, // $5 discount
      maxDiscountedItems: 1, // Discount applies to 1 item
    },
  ],
};

const spend20Get7Off = {
  id: "spend_20_get_7_off",
  conditions: [
    {
      type: "minimum_cart_total", // Ensures the total cart value meets the condition
      amount: 20, // Minimum spend of $20
    },
  ],
  actions: [
    {
      type: "apply_order_discount", // Discount applies to the whole order
      amount: 7, // $7 off the total
    },
  ],
};

// How to structure a deal

// Conditions:
// conditions list contains objects that all must pass for the user to qualify for the deal
// The two types of conditions you can create are minimum cart total which simply accepts an amount,
// and minumum quantity, for this you specify what items and how many of it must be in cart.

//Actions:
// This describes what action to perform on the cart
// add free item
// apply discount
// apply_fixed_discount
// apply point multiplier
// apply order discount
// apply_order_point_multiplier

const cart = [{ itemId: "item_1", quantity: 2, price: 20 }];
console.log(cart);
const deal = buyOneGetSecond5Off;
if (qualifiesForDeal(cart, deal)) {
  const updatedCart = applyDeal(cart, deal);
  console.log("Updated Cart:", updatedCart);
} else {
  console.log("Cart does not qualify for the deal.");
}
