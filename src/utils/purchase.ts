import { PaymentPayLoad } from "@/types";
import { supabase_local } from "./supabase_client";

export const submitPurchase = async (payload: PaymentPayLoad) => {
  try {
    const { data, error } = await supabase_local.functions.invoke(
      "submit_order",
      {
        body: {
          userAccessToken: payload.userAccessToken,
          restaurant_id: payload.restaurant_id,
          totalWithTip: payload.totalWithTip,
          cart: payload.state.cart,
          userDealEffect: payload.state.dealEffect,
          userCartResults: payload.state.cartResults,
          token: payload.state.token,
          paymentData: payload.paymentData,
        },
      }
    );
    if (error || !data) {
      console.error("Error submitting purchase:", error);
      return null;
    }
    if (data.error) {
      return null;
    }
    const { transactions, modifiedUserData } = data;
    return { transactions, modifiedUserData };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
