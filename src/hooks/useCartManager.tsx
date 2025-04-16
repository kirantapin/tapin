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

export function useCartManager(
  restaurant: Restaurant | null,
  userSession: UserSession | null
) {
  const cartManagerRef = useRef<CartManager | null>(null);
  const [state, dispatch] = useReducer(cartReducer, initialState);

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
        console.log("reinitializing cart manager", new Date().toISOString());
        cartManagerRef.current = new CartManager(restaurant.id, userSession);
      }
      //updated user sesssion is different from what is stored in cart manager
      if (!isEqual(cartManagerRef.current.userSession, userSession)) {
        //login or change of account(however through the frontend it isn't possible to change accounts so most likely a login)
        if (userSession) {
          await cartManagerRef.current.newUserSession(userSession);
        } else {
          //logout, first wipe the cart, then create a new Cart Manager so it reflects the new session
          await cartManagerRef.current.clearCart();
          cartManagerRef.current = new CartManager(restaurant.id, userSession);
        }
      }
      dispatch(cartManagerRef.current.getCartState());
    };

    initCartManager();
  }, [restaurant, userSession]);

  // Cart operations
  const addToCart = async (item: Item) => {
    console.log(cartManagerRef.current);
    if (!cartManagerRef.current || !restaurant) return;
    const result = await cartManagerRef.current.addToCart(item, restaurant);
    dispatch(cartManagerRef.current.getCartState());

    if (result) {
      triggerToast(result, "error");
    } else {
      triggerToast("Item added to cart", "success");
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!cartManagerRef.current) return;
    const result = await cartManagerRef.current.removeFromCart(itemId);
    dispatch(cartManagerRef.current.getCartState());

    if (result) {
      triggerToast(result, "error");
    }
  };

  const addPolicy = async (policy: Policy) => {
    if (!cartManagerRef.current) return;
    const result = await cartManagerRef.current.addPolicy(policy);
    dispatch(cartManagerRef.current.getCartState());

    if (result) {
      triggerToast(result, "error");
    } else {
      triggerToast("Deal added successfully", "success");
    }
  };

  const removePolicy = async (policy: Policy) => {
    if (!cartManagerRef.current) return;
    const result = await cartManagerRef.current.removePolicy(policy);
    dispatch(cartManagerRef.current.getCartState());

    if (result) {
      triggerToast(result, "error");
    } else {
      triggerToast("Deal removed successfully", "success");
    }
  };

  const refreshCart = async (): Promise<string | null> => {
    if (!cartManagerRef.current) return null;
    const result = await cartManagerRef.current.refresh();
    dispatch(cartManagerRef.current.getCartState());
    return result;
  };

  const clearCart = async () => {
    if (!cartManagerRef.current) return;
    cartManagerRef.current.clearCart();
    dispatch(cartManagerRef.current.getCartState());
  };

  const getActivePolicies = () => {
    if (!cartManagerRef.current) return [];
    return cartManagerRef.current.getActivePolicies();
  };

  const triggerToast = (message: string, type: "success" | "error") => {
    toast[type](message, {
      className: "font-[Gilroy]",
      autoClose: 2000,
    });
  };

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
    isPreEntry: state.cart.some((item) =>
      ItemUtils.isPassItem(item.item.id, restaurant as Restaurant)
    ),
  };
}
