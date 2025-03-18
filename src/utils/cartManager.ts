import { emptyDealEffect, MENU_DISPLAY_MAP } from "@/constants";
import {
  Cart,
  CartItem,
  CartResultsPayload,
  DealEffectPayload,
  Item,
  Policy,
  Restaurant,
  VerifyOrderPayload,
} from "@/types";
import { supabase_local } from "./supabase_client";
import { isEqual } from "lodash";
import { priceItem } from "./pricer";

const localStorageCartTag = "_cart";
const CART_EXPIRATION_MINUTES = 10;

export class CartManager {
  cart: Cart;
  selectedPolicy: Policy | null;
  dealEffect: DealEffectPayload;
  cartResults: CartResultsPayload | null;
  errorDisplay: string | null;
  private restaurant_id: string;
  userSession: any;
  private token: string | null = null;
  private localStorageKey: string;
  constructor(restaurant_id: string, userSession: any) {
    this.restaurant_id = restaurant_id;
    this.userSession = userSession;
    const localStorageKey = `${restaurant_id}${localStorageCartTag}`;
    this.localStorageKey = localStorageKey;
    const storedCartData = localStorage.getItem(localStorageKey);

    const currentTime = Date.now();
    const isCartValid = (timestamp: number) => {
      const tenMinutesInMillis = CART_EXPIRATION_MINUTES * 60 * 1000;
      return currentTime - timestamp < tenMinutesInMillis;
    };

    if (storedCartData) {
      try {
        const parsedData = JSON.parse(storedCartData);

        if (parsedData.timestamp && isCartValid(parsedData.timestamp)) {
          // Set existing cart if timestamp is valid
          this.cart = parsedData.cart || [];
          this.selectedPolicy = parsedData.selectedPolicy || null;
          this.dealEffect = parsedData.dealEffect || emptyDealEffect;
          this.cartResults = parsedData.cartResults || null;
          this.errorDisplay = null;
          if (parsedData.token) {
            this.token = parsedData.token;
          }
          // } else {
          //   this.verifyOrder();
          // }

          return;
        }
      } catch (error) {
        console.error("Failed to parse cart data from localStorage:", error);
      }
    }

    // Initialize with default values if no valid cart is found
    this.cart = [];
    this.selectedPolicy = null;
    this.dealEffect = emptyDealEffect;
    this.cartResults = null;
    this.errorDisplay = null;
    // Save the initial cart structure to localStorage
    // this.verifyOrder();
  }

  async init() {
    if (!this.token) await this.verifyOrder();
  }

  /**
   * Saves the current cart state to localStorage with a timestamp.
   * @param {string} key - The key to save in localStorage.
   */
  private saveCartToLocalStorage() {
    const data = {
      cart: this.cart,
      selectedPolicy: this.selectedPolicy,
      dealEffect: this.dealEffect,
      cartResults: this.cartResults,
      token: this.token,
      timestamp: Date.now(),
    };

    localStorage.setItem(this.localStorageKey, JSON.stringify(data));
  }

  private async verifyOrder(): Promise<void> {
    if (!this.userSession?.user?.phone) {
      this.cart = this.cart;
      this.dealEffect = emptyDealEffect;
      this.selectedPolicy = this.selectedPolicy;
      this.cartResults = null;
      this.errorDisplay = "User must sign in.";
      this.token = null;
      this.saveCartToLocalStorage();
      return;
    }
    const payload: VerifyOrderPayload = {
      cart: this.cart,
      userDealEffect: this.dealEffect,
      policy_id: this.selectedPolicy?.policy_id || null,
      restaurant_id: this.restaurant_id,
      user_id: this.userSession?.user.phone,
    };

    try {
      const { data, error } = await supabase_local.functions.invoke(
        "verify_order",
        {
          body: payload,
        }
      );

      console.log("data", data, error);

      const returnData = data?.data;
      const errorMessage = data?.error || "";

      if (error) {
        console.error("Supabase Error:", error);
        this.errorDisplay =
          error.message || "An error occurred while verifying the order.";
        return;
      }

      if (returnData) {
        this.cart = returnData.payload.cart;
        this.dealEffect = returnData.payload.dealEffectPayload;
        this.selectedPolicy = returnData.payload.policy;
        this.cartResults = returnData.payload.cartResultsPayload;
        this.errorDisplay = errorMessage;
        this.token = returnData.jwtToken;
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      this.errorDisplay =
        "An unexpected error occurred while verifying the order.";
    }
    this.saveCartToLocalStorage();
  }

  private handleUpdateItem(
    itemKey: number,
    updatedFields: Partial<CartItem>
  ): void {
    if (itemKey <= this.cart.length) {
      this.cart = this.cart
        .map((item) =>
          item.id === itemKey ? { ...item, ...updatedFields } : item
        )
        .filter((item) => item.quantity !== 0) // Remove items with quantity 0
        .map((item, index) => ({
          ...item,
          id: index + 1, // Reassign IDs starting from 1
        }));
    } else {
      this.dealEffect = {
        ...this.dealEffect,
        freeAddedItems: this.dealEffect.freeAddedItems.map((item) =>
          item.id === itemKey ? { ...item, ...updatedFields } : item
        ),
      };
    }
  }
  public async updateItem(
    itemKey: number,
    updatedFields: Partial<CartItem>
  ): Promise<void> {
    this.handleUpdateItem(itemKey, updatedFields);
    await this.verifyOrder();
  }

  public async setPolicy(policy: Policy | null): Promise<void> {
    this.selectedPolicy = policy;
    await this.verifyOrder();
  }

  public async addToCart(item: Item, restaurant: Restaurant): Promise<void> {
    // Check if the item already exists in the cart
    const existingItemIndex = this.cart.findIndex((cartItem) =>
      isEqual(cartItem.item, item)
    );

    if (existingItemIndex >= 0) {
      // If the item exists, increment the quantity
      this.cart = this.cart.map((cartItem, index) =>
        index === existingItemIndex
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      );
    } else {
      // If the item doesn't exist, add it with the next available ID
      const maxId = this.cart.reduce(
        (max, cartItem) => Math.max(max, cartItem.id || 0),
        0
      );

      const newCartItem = {
        id: maxId + 1,
        item: item,
        quantity: 1,
        price: priceItem(item, restaurant),
        points: 100,
        point_cost: 0,
      };

      this.cart = [...this.cart, newCartItem];
    }
    await this.verifyOrder();
  }

  public getCartState() {
    return {
      cart: this.cart,
      selectedPolicy: this.selectedPolicy,
      dealEffect: this.dealEffect,
      cartResults: this.cartResults,
      errorDisplay: this.errorDisplay,
      token: this.token,
    };
  }
}
