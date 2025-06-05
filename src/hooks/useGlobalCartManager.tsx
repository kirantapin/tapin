import { useEffect, useRef, useState, useReducer } from "react";
import { toast } from "react-toastify";
import { CartManager } from "../utils/cartManager";
import {
  Cart,
  Item,
  Policy,
  Restaurant,
  CartItem,
  DealEffectPayload,
  CartResultsPayload,
} from "../types";
import { UserSession } from "../types";
import { emptyDealEffect } from "@/constants";
import { ItemUtils } from "@/utils/item_utils";
import { isEqual } from "lodash";
import { useWatcher } from "./useWatcher";

interface CartState {
  cart: Cart;
  dealEffect: DealEffectPayload;
  selectedPolicy: Policy | null;
  cartResults: CartResultsPayload | null;
  errorDisplay: string | null;
  token: string | null;
}

const initialState: CartState = {
  cart: [],
  dealEffect: emptyDealEffect,
  selectedPolicy: null,
  cartResults: null,
  errorDisplay: null,
  token: null,
};

const cartReducer = (state: CartState, action: Partial<CartState>) => {
  return { ...state, ...action };
};

export function useGlobalCartManager(
  restaurant: Restaurant | null,
  userSession: UserSession | null,
  global: boolean = true
) {
  const cartManagerRef = useRef<CartManager | null>(null);
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const triggerToast = (
    message: string,
    type: "success" | "error" | "info",
    duration?: number
  ): void => {
    toast[type](message, {
      icon:
        type === "error" ? undefined : (
          <img
            src="/tapin_icon_black.png"
            alt=""
            style={{ width: 24, height: 24 }}
          />
        ),
      className:
        "font-[Gilroy] font-semibold text-black rounded-b-2xl rounded-t-none overflow-hidden shadow-lg",
      autoClose: duration || 2000,
    });
  };

  // Initialize CartManager
  useEffect(() => {
    if (!restaurant?.id) return;

    const initCartManager = async () => {
      //either initial page load or change of restaurant
      if (
        !cartManagerRef.current ||
        cartManagerRef.current.restaurant_id !== restaurant.id
      ) {
        //reset cart managers state
        cartManagerRef.current = new CartManager(
          restaurant.id,
          userSession,
          global
        );
      }
      //updated user sesssion is different from what is stored in cart manager
      if (!isEqual(cartManagerRef.current.userSession, userSession)) {
        if (userSession) {
          if (
            userSession.user.id === cartManagerRef.current.userSession?.user?.id
          ) {
            //this is a refresh of the tokens
            cartManagerRef.current.userSession = userSession;
          } else {
            //this is a login
            await cartManagerRef.current.newUserSession(userSession);
          }
        } else {
          //logout, first wipe the cart, then create a new Cart Manager so it reflects the new session
          cartManagerRef.current.clearCart();
          cartManagerRef.current = new CartManager(
            restaurant.id,
            userSession,
            global
          );
        }
      }
      dispatch(cartManagerRef.current.getCartState());
    };

    initCartManager();
  }, [restaurant, userSession]);

  // Cart operations
  const addToCart = async (item: Item, showToast?: boolean): Promise<void> => {
    if (!cartManagerRef.current || !restaurant) return;
    const result = await cartManagerRef.current.addToCart(item);
    if (result) {
      triggerToast(result, "error", 4000);
    } else {
      if (showToast) {
        triggerToast("Item added to cart", "success");
      }
      dispatch(cartManagerRef.current.getCartState());
    }
  };

  const removeFromCart = async (itemId: number): Promise<void> => {
    if (!cartManagerRef.current) return;
    const result = await cartManagerRef.current.removeFromCart(itemId);

    if (result) {
      triggerToast(result, "error");
    } else {
      dispatch(cartManagerRef.current.getCartState());
    }
  };

  const addPolicy = async (
    bundle_id: string | null,
    policy_id: string,
    userPreference: Item | null
  ): Promise<void> => {
    if (!cartManagerRef.current) return;
    const result = await cartManagerRef.current.addPolicy(
      bundle_id,
      policy_id,
      userPreference
    );

    if (result) {
      if (global) {
        triggerToast(result, "error", 4000);
      }
    } else {
      if (global) {
        triggerToast("Deal added successfully", "success");
      }
      dispatch(cartManagerRef.current.getCartState());
    }
  };

  const removePolicy = async (policy_id: string): Promise<void> => {
    if (!cartManagerRef.current) return;
    const result = await cartManagerRef.current.removePolicy(policy_id);

    if (result) {
      if (global) {
        triggerToast(result, "error");
      }
    } else {
      if (global) {
        triggerToast("Deal removed", "success");
      }
      dispatch(cartManagerRef.current.getCartState());
    }
  };

  const refreshCart = async (): Promise<string | null> => {
    if (!cartManagerRef.current) return null;
    const result = await cartManagerRef.current.refresh();
    if (!result) {
      dispatch(cartManagerRef.current.getCartState());
    }
    return result;
  };

  const clearCart = async (): Promise<void> => {
    if (!cartManagerRef.current) return;
    cartManagerRef.current.clearCart();
    dispatch(cartManagerRef.current.getCartState());
  };

  const getActivePolicies = (): string[] => {
    if (!cartManagerRef.current) return [];
    return cartManagerRef.current.getActivePolicies();
  };

  useWatcher({
    cart: state.cart,
    restaurant: restaurant as Restaurant,
    triggerToast,
    refreshCart,
  });

  return {
    state,
    dispatch,
    addToCart,
    removeFromCart,
    addPolicy,
    removePolicy,
    refreshCart,
    clearCart,
    getActivePolicies,
    cartManager: cartManagerRef.current,
    triggerToast,
  };
}
