import { RESTAURANT_PATH } from "@/constants";
import { useAuth } from "@/context/auth_context";
import { submitPurchase } from "@/utils/purchase";
import { useNavigate } from "react-router-dom";
import { Transaction, User } from "@/types";
import { toast } from "react-toastify";
const RedeemButton = ({
  payload,
  sanityCheck,
  clearCart,
}: {
  payload: any;
  sanityCheck: () => Promise<string | null>;
  clearCart: () => void;
}) => {
  const { setTransactions, setUserData } = useAuth();
  const navigate = useNavigate();
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
      clearCart();
      navigate(RESTAURANT_PATH.replace(":id", payload.restaurant_id), {
        state: {
          transactions: transactions,
          qr: true,
        },
      });
    }
  };
  return (
    <button
      className=" bg-[linear-gradient(90deg,#CAA650,#F4E4A8)] w-full py-3 px-4 rounded-full font-medium text-white"
      onClick={async () => {
        try {
          const potentialError = await sanityCheck();
          console.log("potentialError", potentialError);
          if (potentialError) {
            //handle response error
            toast(potentialError, {
              type: "error",
            });
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
          console.log("tapInResponse", tapInResponse);
          if (tapInResponse) {
            const { transactions, modifiedUserData } = tapInResponse;
            handleTapInResponse(transactions, modifiedUserData);
          }
        } catch (err) {
          console.error("Unexpected Error:", err);
        }
      }}
    >
      Redeem
    </button>
  );
};

export default RedeemButton;
