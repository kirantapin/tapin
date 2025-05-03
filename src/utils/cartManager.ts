import {
  ADD_ITEM,
  ADD_POLICY,
  emptyDealEffect,
  NEW_USER_SESSION,
  REFRESH,
  REMOVE_ITEM,
  REMOVE_POLICY,
} from "@/constants";
import {
  Cart,
  CartResultsPayload,
  DealEffectPayload,
  Item,
  Policy,
  VerifyOrderPayload,
} from "@/types";
import { supabase_local } from "./supabase_client";

const localStorageCartTag = "_cart";
const CART_EXPIRATION_MINUTES = 15;

export class CartManager {
  cart: Cart;
  dealEffect: DealEffectPayload;
  cartResults: CartResultsPayload | null;
  errorDisplay: string | null;
  restaurant_id: string;
  userSession: any | null;
  private token: string | null = null;
  private localStorageKey: string;
  global: boolean;
  constructor(
    restaurant_id: string,
    userSession: any | null,
    global: boolean = false
  ) {
    this.restaurant_id = restaurant_id;
    this.userSession = userSession;
    this.global = global;
    const localStorageKey = `${restaurant_id}${localStorageCartTag}`;
    this.localStorageKey = localStorageKey;

    const storedCartData = this.global
      ? localStorage.getItem(this.localStorageKey)
      : null;

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
          this.dealEffect = parsedData.dealEffect || emptyDealEffect;
          this.cartResults = parsedData.cartResults || null;
          this.errorDisplay = null;
          if (parsedData.token) {
            this.token = parsedData.token;
          }
          return;
        }
      } catch (error) {
        console.error("Failed to parse cart data from localStorage:", error);
      }
    }

    // Initialize with default values if no valid cart is found
    this.cart = [];
    this.dealEffect = emptyDealEffect;
    this.cartResults = null;
    this.errorDisplay = null;
    this.saveCartToLocalStorage();
  }

  /**
   * Saves the current cart state to localStorage with a timestamp.
   * @param {string} key - The key to save in localStorage.
   */
  private saveCartToLocalStorage() {
    if (!this.global) {
      return;
    }
    const data = {
      cart: this.cart,
      dealEffect: this.dealEffect,
      cartResults: this.cartResults,
      token: this.token,
      timestamp: Date.now(),
    };

    localStorage.setItem(this.localStorageKey, JSON.stringify(data));
  }

  private async verifyOrder(
    type: string,
    content:
      | Item
      | string
      | number
      | {
          policy_id: string;
          bundle_id: string | null;
          userPreference: string | null;
        }
  ): Promise<void> {
    console.log("verifyOrder", type, content);

    const payload: VerifyOrderPayload = {
      cart: this.cart,
      userDealEffect: this.dealEffect,
      restaurant_id: this.restaurant_id,
      cartResults: this.cartResults,
      userAccessToken: this.userSession?.access_token,
      request: { type: type, content: content },
      jwtToken: this.token,
    };

    console.log("before verify order payload", payload);

    try {
      const { data, error } = await supabase_local.functions.invoke(
        "verify_order",
        {
          body: payload,
        }
      );
      const returnData = data?.data;
      const errorMessage = data?.error || "";
      console.log("returnData", returnData);
      if (error) {
        console.error("Supabase Error:", error);
        this.errorDisplay =
          error.message || "An error occurred while verifying the cart.";
        return;
      }

      if (returnData) {
        this.cart = returnData.payload.cart;
        this.dealEffect = returnData.payload.dealEffectPayload;
        this.cartResults = returnData.payload.cartResultsPayload;
        this.errorDisplay = errorMessage;
        this.token = returnData.jwtToken;
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      this.errorDisplay =
        "An unexpected error occurred while verifying the cart.";
    }
    this.saveCartToLocalStorage();
  }

  public async addPolicy(
    bundle_id: string | null,
    policy: Policy,
    userPreference: string | null = null
  ): Promise<string | null> {
    console.log("adding policy", policy);
    await this.verifyOrder(ADD_POLICY, {
      policy_id: policy.policy_id,
      bundle_id: bundle_id,
      userPreference: userPreference,
    });
    if (this.errorDisplay) {
      return this.errorDisplay;
    }
    return null;
  }

  public async removePolicy(policy: Policy): Promise<string | null> {
    await this.verifyOrder(REMOVE_POLICY, policy.policy_id);
    console.log("inside remove policy", this.getCartState());
    if (this.errorDisplay) {
      return this.errorDisplay;
    }
    return null;
  }

  public async addToCart(item: Item): Promise<string | null> {
    await this.verifyOrder(ADD_ITEM, item);
    if (this.errorDisplay) {
      return this.errorDisplay;
    }
    return null;
  }

  public async removeFromCart(itemId: number): Promise<string | null> {
    await this.verifyOrder(REMOVE_ITEM, itemId);
    if (this.errorDisplay) {
      return this.errorDisplay;
    }
    return null;
  }

  public getCartState() {
    return {
      cart: this.cart,
      dealEffect: this.dealEffect,
      cartResults: this.cartResults,
      errorDisplay: this.errorDisplay,
      token: this.token,
    };
  }

  public getActivePolicies(): string[] {
    const policyIds = this.dealEffect.modifiedItems
      .map((item) => item.policy_id)
      .concat(this.dealEffect.addedItems.map((item) => item.policy_id));
    if (this.dealEffect.wholeCartModification?.policy_id) {
      policyIds.push(this.dealEffect.wholeCartModification.policy_id);
    }
    return policyIds;
  }

  public async refresh(): Promise<string | null> {
    await this.verifyOrder(REFRESH, "");
    if (this.errorDisplay) {
      return this.errorDisplay;
    }
    return null;
  }

  public async newUserSession(userSession: any) {
    await this.verifyOrder(NEW_USER_SESSION, userSession.access_token);
    this.userSession = userSession;
    if (this.errorDisplay) {
      return this.errorDisplay;
    }
    this.saveCartToLocalStorage();
  }

  public clearCart() {
    this.cart = [];
    this.dealEffect = emptyDealEffect;
    this.cartResults = null;
    this.token = null;
    this.errorDisplay = null;
    this.saveCartToLocalStorage();
  }
}
