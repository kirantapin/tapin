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
          immediateFulfillment: payload.immediateFulfillment || false,
          fulfillmentInfo: payload.fulfillmentInfo,
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

// export const createRedemptionCode = async (
//   accessToken: string,
//   transactionIds: string[],
//   restaurantId: string
// ): Promise<{ success: boolean; error: string | null; code: string | null }> => {
//   try {
//     const { data, error } = await supabase_local.functions.invoke(
//       "handle_code_redemption",
//       {
//         body: {
//           userAccessToken: accessToken,
//           restaurant_id: restaurantId,
//           transaction_ids: transactionIds,
//           type: "create",
//         },
//       }
//     );
//     if (error || !data) {
//       console.error("Error creating redemption code:", error);
//       return {
//         success: false,
//         error: "Error creating redemption code",
//         code: null,
//       };
//     }
//     if (data.error || !data.success || !data.code) {
//       return {
//         success: false,
//         error: data.error || "Error creating redemption code",
//         code: null,
//       };
//     }
//     return { success: true, error: null, code: data.code };
//   } catch (error) {
//     console.error("Error creating redemption code:", error);
//     return {
//       success: false,
//       error: "Error creating redemption code",
//       code: null,
//     };
//   }
// };
