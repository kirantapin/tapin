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
    if (!restaurant?.id || !userSession) return;

    const initCartManager = async () => {
      if (
        !cartManagerRef.current ||
        cartManagerRef.current.userSession !== userSession
      ) {
        cartManagerRef.current = new CartManager(restaurant.id, userSession);
        await cartManagerRef.current.init();
        dispatch(cartManagerRef.current.getCartState());
      }
    };

    initCartManager();
  }, [restaurant, userSession]);

  // Cart operations
  const addToCart = async (item: Item) => {
    if (!cartManagerRef.current || !restaurant) return;
    const result = await cartManagerRef.current.addToCart(item, restaurant);
    dispatch(cartManagerRef.current.getCartState());

    if (result) {
      toast.error(result);
    } else {
      toast.success("Item added to cart");
    }
  };

  const removeFromCart = async (itemId: number) => {
    if (!cartManagerRef.current) return;
    const result = await cartManagerRef.current.removeFromCart(itemId);
    dispatch(cartManagerRef.current.getCartState());

    if (result) {
      toast.error(result);
    }
  };

  const addPolicy = async (policy: Policy) => {
    if (!cartManagerRef.current) return;
    const result = await cartManagerRef.current.addPolicy(policy);
    dispatch(cartManagerRef.current.getCartState());

    if (result) {
      toast.error(result);
    } else {
      toast.success("Deal added successfully");
    }
  };

  const removePolicy = async (policy: Policy) => {
    if (!cartManagerRef.current) return;
    const result = await cartManagerRef.current.removePolicy(policy);
    dispatch(cartManagerRef.current.getCartState());

    if (result) {
      toast.error(result);
    } else {
      toast.success("Deal removed successfully");
    }
  };

  const refreshCart = async () => {
    if (!cartManagerRef.current) return;
    const result = await cartManagerRef.current.refresh();
    dispatch(cartManagerRef.current.getCartState());
    return result;
  };

  const getActivePolicies = () => {
    if (!cartManagerRef.current) return [];
    return cartManagerRef.current.getActivePolicies();
  };

  return {
    state,
    dispatch,
    addToCart,
    removeFromCart,
    addPolicy,
    removePolicy,
    refreshCart,
    getActivePolicies,
    cartManager: cartManagerRef.current,
  };
}
