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
  openProcessingOrderModal,
  closeProcessingOrderModal,
}: {
  payload: any;
  refresh: () => Promise<string | null>;
  postPurchase: (transactions: Transaction[]) => Promise<void>;
  openProcessingOrderModal: () => void;
  closeProcessingOrderModal: () => void;
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
      closeProcessingOrderModal();
      await postPurchase(transactions);
    }
  };

  return (
    <button
      className="w-full py-3 px-4 rounded-full font-medium text-white"
      style={{
        background: restaurant?.metadata.primaryColor,
      }}
      disabled={loading}
      onClick={async () => {
        if (loading) return;
        setLoading(true);
        try {
          const potentialError = await refresh();
          if (potentialError) {
            triggerToast(potentialError, "error");
            return;
          }
          openProcessingOrderModal();
          const paymentData = {
            accountId: payload.accountId,
            paymentIntentId: null,
            additionalOrderData: {},
          };
          payload["paymentData"] = paymentData;
          const tapInResponse = await submitPurchase(payload);
          if (tapInResponse) {
            const { transactions, modifiedUserData } = tapInResponse;
            await handleTapInResponse(transactions, modifiedUserData);
          } else {
            triggerToast(
              "Something went wrong. Please refresh the page and try again.",
              "error"
            );
          }
        } catch (err) {
          triggerToast(
            "Something went wrong. Please refresh the page and try again.",
            "error"
          );
          console.error("Unexpected Error:", err);
        } finally {
          closeProcessingOrderModal();
          setLoading(false);
        }
      }}
    >
      <div className="flex items-center justify-center gap-2 w-full">
        <span className="font-semibold">
          {loading ? "Processing" : "Redeem"}
        </span>
        {!loading && (
          <img
            src="/tapin_icon_full_white.png"
            alt="Tap In Icon"
            className="h-5"
          />
        )}
      </div>
    </button>
  );
};

export default RedeemButton;
