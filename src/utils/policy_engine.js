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
import { qualifiesForDeal, applyDeal } from "./policy_engine_tester";

class DealEngine {
  // Constructor function to initialize object properties
  //initialize the deal engine with whatever items are in cart
  //also initialize with previous transaction the user has made in specified timeframe, or this could just be user_id
  //also initialize with restaurant id

  constructor(cart, previous_transactions, restaurant) {
    //cart_items should be a list of json objects {item, price, point value}
    this.cart = cart;
    this.previous_transactions = previous_transactions;
    this.restaurant_id = restaurant;
  }
  get_total_price() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
  does_policy_apply(policy) {
    return qualifiesForDeal(this.cart, policy);
  }

  update_cart_items(new_cart_items) {
    this.cart_item = new_cart_items;
  }

  apply_policy(policy) {
    return applyDeal(this.cart, policy);
  }
}
//takes in a set of items and prices given the restaurant menu
function price_items(items) {}
