import { useAuth } from "@/context/auth_context";
import { submitPurchase } from "@/utils/purchase";
import { Transaction, User } from "@/types";
import { useRestaurant } from "@/context/restaurant_context";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { useState } from "react";
const RedeemButton = ({
  payload,
  refresh,
  postPurchase,
}: {
  payload: any;
  refresh: () => Promise<string | null>;
  postPurchase: (transactions: Transaction[]) => Promise<void>;
}) => {
  const { setTransactions, setUserData } = useAuth();
  const { restaurant } = useRestaurant();
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
      await postPurchase(transactions);
    }
  };
  return (
    <button
      className="w-full py-3 px-4 rounded-full font-medium text-white"
      style={{
        background: restaurant?.metadata.primaryColor as string,
      }}
      onClick={async () => {
        setLoading(true);
        try {
          const potentialError = await refresh();
          if (potentialError) {
            //handle response error
            triggerToast(potentialError, "error");
            return;
          }
          const paymentData = {
            connectedAccountId: payload.connectedAccountId,
            paymentIntentId: null,
            additionalOrderData: {},
          };
          payload["paymentData"] = paymentData;
          console.log("payload", payload);
          const tapInResponse = await submitPurchase(payload);
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
