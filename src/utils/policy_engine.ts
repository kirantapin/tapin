// Payload sent to submit order
// Policy Id
// User id
// Restaurant id
// Items in Cart:[]
// interface Order_Payload {
//   policy_id: string | null;
//   user_id: string | null;
//   restaurant_id: string;
//   items: string[];
// }

//how an item will be detailed
//item:category
//how item is specified in the deal
//item:category
import { qualifiesForDeal, applyDeal } from "./policy_engine_utils.ts";
import {
  Cart,
  Policy,
  CartItem,
  Menu,
  DrinkMenu,
  Restaurant,
  DealEffectPayload,
} from "../types";

export class PolicyEngine {
  cart: Cart;
  restaurant: Restaurant;
  constructor(cart: Cart, restaurant: Restaurant) {
    this.cart = cart;
    this.restaurant = restaurant;
  }

  does_policy_apply(policy: Policy): boolean {
    if (!policy) {
      return true;
    }
    return qualifiesForDeal(this.cart, policy.definition, this.restaurant);
  }

  update_cart(new_cart_items: Cart) {
    this.cart = new_cart_items;
  }

  apply_policy(policy: Policy): DealEffectPayload | null {
    return applyDeal(this.cart, policy.definition, this.restaurant);
  }
}
