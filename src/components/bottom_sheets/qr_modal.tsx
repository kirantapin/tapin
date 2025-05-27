import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { X } from "lucide-react";
import { Transaction, Restaurant } from "@/types";
import { useAuth } from "@/context/auth_context";
import { supabase, supabase_local } from "@/utils/supabase_client";
import QRCode from "react-qr-code";

import { ItemUtils } from "@/utils/item_utils";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import CustomLogo from "../svg/custom_logo";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionsToRedeem: Transaction[];
  restaurant: Restaurant;
}

const QRModal: React.FC<QRModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  transactionsToRedeem,
}) => {
  const [codeEntered, setCodeEntered] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const { userData, setTransactions } = useAuth();
  const { triggerToast } = useBottomSheet();
  const [verifyingState, setVerifyingState] = useState("");
  const [updatingTransactions, setUpdatingTransactions] = useState(false);

  if (transactionsToRedeem.length > 4) {
    triggerToast(
      "Please try to redeem again with a fewer number of items.",
      "error"
    );
    onClose();
    return null;
  }

  const formatTransactions = (): string => {
    const displayList = [];
    for (const transaction of transactionsToRedeem) {
      displayList.push(transaction.transaction_id);
    }
    return JSON.stringify(displayList);
  };

  function determineErrorCorrectionLevel(value: string): "L" | "M" | "Q" | "H" {
    const length = value.length;

    if (length <= 50) return "L"; // light data
    if (length <= 100) return "M"; // moderate
    if (length <= 200) return "Q"; // dense
    return "H"; // very dense, highest correction
  }

  const formatCode = () => {
    const digitsOnly = codeEntered.replace(/\D/g, "");

    // Ensure it's at least 10 digits long (US phone numbers without country code)
    if (digitsOnly.length === 10) {
      return `1${digitsOnly}`; // Add US country code
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
      return `${digitsOnly}`; // Ensure +1 format
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically validate the code and proceed accordingly
    const employeeId = formatCode();

    if (!employeeId) {
      setRedeemError("Number provided is not valid");
      return;
    }
    setVerifyingState("loading");
    const response = await supabase_local.functions.invoke(
      "redeem_transactions_client",
      {
        body: {
          transactionIds: transactionsToRedeem.map(
            (transaction) => transaction.transaction_id
          ),
          employeeId: employeeId,
          userId: userData?.id,
        },
      }
    );
    const { updatedTransactions } = response.data;
    if (response.error || response.data.error || !response.data.success) {
      setRedeemError("Failed to Redeem Transactions");
      setVerifyingState("");
      return;
    }

    if (updatedTransactions.length !== transactionsToRedeem.length) {
      setRedeemError(
        "Error occurred while Redeeming Transactions. Reach out to TapIn."
      );
      setVerifyingState("");
      return;
    }

    setVerifyingState("complete");
    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transactionsToRedeem.some(
          (redeemTransaction) =>
            redeemTransaction.transaction_id === transaction.transaction_id
        )
          ? { ...transaction, fulfilled_by: employeeId } // Mark as fulfilled
          : transaction
      )
    );
    //create component that shows a loader if loading, but a check mark if complete and a button to go back to home page.
    //you might need to reretrieve transactions
  };
  const itemFrequencyMap: Record<string, number> = {};

  if (transactionsToRedeem.length <= 0 || !restaurant) {
    return null;
  }

  // Check if all transactions are from the same restaurant and unfulfilled
  const allSameRestaurant = transactionsToRedeem.every(
    (transaction) =>
      transaction.restaurant_id === transactionsToRedeem[0].restaurant_id
  );
  const allUnfulfilled = transactionsToRedeem.every(
    (transaction) => transaction.fulfilled_by === null
  );

  if (!allSameRestaurant || !allUnfulfilled) {
    onClose();
    triggerToast("Something went wrong. Please try again.", "error");
    return;
  }

  transactionsToRedeem.forEach((transaction) => {
    const itemDescription = ItemUtils.getItemName(
      {
        id: transaction.item,
        modifiers: (transaction.metadata.modifiers as string[]) || [],
      },
      restaurant
    );
    itemFrequencyMap[itemDescription] =
      (itemFrequencyMap[itemDescription] || 0) + 1;
  });

  const modifiedOnClose = async () => {
    setUpdatingTransactions(true);
    const { data: updatedTransactions } = await supabase
      .from("transactions")
      .select("transaction_id, fulfilled_by")
      .in(
        "transaction_id",
        transactionsToRedeem.map((t) => t.transaction_id)
      );

    if (updatedTransactions) {
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) => {
          const updatedTransaction = updatedTransactions.find(
            (ut) => ut.transaction_id === transaction.transaction_id
          );
          if (updatedTransaction) {
            return {
              ...transaction,
              fulfilled_by: updatedTransaction.fulfilled_by,
            };
          }
          return transaction;
        })
      );
    }
    setUpdatingTransactions(false);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={async () => await modifiedOnClose()}>
      <SheetContent
        side="bottom"
        className="h-[80vh] rounded-t-3xl [&>button]:hidden p-0 flex flex-col gap-0"
      >
        <SheetHeader className="flex-none px-6 pt-6 pb-4 border-b">
          <div className="flex justify-between items-center">
            <CustomLogo
              primaryColor={restaurant?.metadata.primaryColor as string}
              size={124}
            />
            <button
              onClick={async () => await modifiedOnClose()}
              className="text-black text-sm font-normal p-2 rounded-full bg-gray-200 flex items-center gap-1 focus:outline-none"
            >
              {updatingTransactions ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
              ) : (
                <X size={20} />
              )}
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pt-4">
          <h1 className="text-3xl font-bold mb-4">Scan QR Code</h1>
          {/* <p className="text-xl text-gray-500">
            Or have an employee enter their code to redeem the purchase.
            Unredeemed Items will be saved to your account.
          </p> */}

          <div className="w-full aspect-square flex items-center justify-center rounded-xl">
            <QRCode
              size={256}
              style={{
                height: "auto",
                maxWidth: "100%",
                width: "100%",
                padding: "30px",
              }}
              value={formatTransactions()}
              viewBox={`0 0 256 256`}
              radius={15}
              level={determineErrorCorrectionLevel(formatTransactions())}
            />
          </div>

          <div>
            {Object.entries(itemFrequencyMap).map(([item, frequency]) => (
              <div key={item} className="p-2 border-b">
                <span className="font-normal">{frequency} x</span> {item}
              </div>
            ))}
          </div>

          {redeemError && <div>{redeemError}</div>}

          {/* <form onSubmit={handleSubmit} className="mb-8 mt-4">
            <div className="relative">
              <input
                id="qr-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={codeEntered}
                onChange={(e) => setCodeEntered(e.target.value)}
                className="w-full bg-[#FFFFFF] rounded-full p-4 pr-12 text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#000000] border border-black"
                placeholder="Or Ask For Employee Code To Redeem"
              />
              {codeEntered && (
                <button
                  type="button"
                  onClick={() => setCodeEntered("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="w-full text-white py-4 rounded-full text-lg mt-4 font-semibold"
              style={{
                backgroundColor: restaurant?.metadata.primaryColor as string,
              }}
            >
              <div className="flex items-center justify-center gap-2 w-full">
                <span className="font-semibold">Submit Code</span>
                <img
                  src="/tapin_icon_full_white.png"
                  alt="Tap In Icon"
                  className="h-5"
                />
              </div>
            </button>
          </form> */}

          {/* {verifyingState && <div>{verifyingState}</div>}
          {verifyingState === "complete" && (
            <div onClick={onClose}>Go Back Home</div>
          )} */}

          <p className="text-center text-black mb-6">
            Having trouble? Ask a staff member for assistance.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QRModal;
