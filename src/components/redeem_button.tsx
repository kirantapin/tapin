import { RESTAURANT_PATH } from "@/constants";
import { useAuth } from "@/context/auth_context";
import { submitPurchase } from "@/utils/purchase";
import { useNavigate } from "react-router-dom";
import { Transaction, User } from "@/types";
import { useRestaurant } from "@/context/restaurant_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useState } from "react";
const RedeemButton = ({
  payload,
  refresh,
  clearCart,
}: {
  payload: any;
  refresh: () => Promise<string | null>;
  clearCart: () => void;
}) => {
  const { setTransactions, setUserData } = useAuth();
  const { restaurant } = useRestaurant();
  const navigate = useNavigate();
  const { triggerToast } = useBottomSheet();
  const [loading, setLoading] = useState(false);
  const handleTapInResponse = async (
    transactions: Transaction[],
    modifiedUserData: User
  ) => {
    if (modifiedUserData) {
      setUserData(modifiedUserData);
    }
    if (!transactions || transactions?.length == 0) {
      throw new Error("No transactions received or created");
    } else {
      setTransactions((prevTransactions) => [
        ...prevTransactions,
        ...transactions,
      ]);
      await clearCart();
      navigate(RESTAURANT_PATH.replace(":id", payload.restaurant_id), {
        state: {
          transactions: transactions,
          qr: true,
          message: { type: "success", message: "Purchase successful" },
        },
      });
    }
  };
  return (
    <button
      className="w-full py-3 px-4 rounded-full font-medium text-white"
      style={{
        background: restaurant?.metadata.primaryColor as string,
      }}
      onClick={async () => {
        try {
          const potentialError = await refresh();
          if (potentialError) {
            //handle response error
            triggerToast(potentialError, "error");
            return;
          }
          setLoading(true);
          const paymentData = {
            connectedAccountId: payload.connectedAccountId,
            paymentIntentId: null,
            additionalOrderData: {},
          };
          payload["paymentData"] = paymentData;
          const tapInResponse = await submitPurchase(payload);
          console.log("tapInResponse", tapInResponse);
          if (tapInResponse) {
            const { transactions, modifiedUserData } = tapInResponse;
            await handleTapInResponse(transactions, modifiedUserData);
          }
        } catch (err) {
          console.error("Unexpected Error:", err);
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="flex items-center justify-center gap-2 w-full">
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        ) : (
          <>
            <span className="font-semibold">Redeem</span>
            <img
              src="/tapin_icon_full_white.png"
              alt="Tap In Icon"
              className="h-5"
            />
          </>
        )}
      </div>
    </button>
  );
};

export default RedeemButton;
