import React, { useEffect, useState } from "react";
import { Sheet } from "react-modal-sheet";
import { ArrowLeft, X } from "lucide-react";
import { Transaction, Order, Restaurant } from "@/types";
import { useAuth } from "@/context/auth_context";
import { supabase, supabase_local } from "@/utils/supabase_client";
import { QRCode } from "react-qrcode-logo";
import { itemToStringDescription } from "@/utils/parse";
import { toast } from "react-toastify";

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

  const [verifyingState, setVerifyingState] = useState("");

  const formatTransactions = (): string => {
    const displayList = [];
    for (const transaction of transactionsToRedeem) {
      displayList.push({
        transaction_id: transaction.transaction_id,
        item: transaction.item,
      });
    }
    return JSON.stringify(displayList);
  };

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
    console.log(response);
    const { success, updatedTransactions, error } = response.data;
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
    toast["error"]("Something went wrong. Please try again.", {
      className: "font-[Gilroy]",
      autoClose: 2000,
    });
    return;
  }

  transactionsToRedeem.forEach((transaction) => {
    const itemDescription = itemToStringDescription(
      {
        id: transaction.item,
        modifiers: (transaction.metadata.modifiers as string[]) || [],
      },
      restaurant
    );
    itemFrequencyMap[itemDescription] =
      (itemFrequencyMap[itemDescription] || 0) + 1;
  });
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={[0.7, 0]}
      initialSnap={0}
      tweenConfig={{
        duration: 0.2,
        ease: [0.4, 0, 0.6, 1],
      }}
    >
      <Sheet.Container className="rounded-t-3xl">
        <Sheet.Content>
          <div className="bg-white text-black p-6 overflow-y-auto">
            <div className="flex justify-end items-center mb-8">
              <button
                onClick={onClose}
                className="text-black font-normal py-2 px-4  rounded-full bg-gray-200"
              >
                Redeem Later
              </button>
            </div>

            <h1 className="text-3xl font-bold mb-4">Scan QR Code</h1>
            <p className="text-xl text-gray-500 mb-8">
              Scan the QR code at the restaurant or have an employee enter their
              code to redeem the purchase.
            </p>

            <div className="aspect-square w-full max-w-xs mx-auto bg-white flex items-center justify-center mb-8 rounded-xl">
              <QRCode
                size={1024}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={formatTransactions()}
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

            <form onSubmit={handleSubmit} className="mb-8 mt-4">
              <div className="relative">
                <input
                  id="qr-code"
                  type="text" // Keeps the input type as text
                  inputMode="numeric" // Suggests numeric keyboard on mobile
                  pattern="[0-9]*" // Helps enforce numeric input
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
                className="w-full bg-[linear-gradient(225deg,#CAA650,#F4E4A8)] text-black py-4 rounded-full text-lg mt-4 hover:bg-[#E4A43B] transition-colors"
              >
                Submit Code
              </button>
            </form>
            {verifyingState && <div>{verifyingState}</div>}
            {verifyingState === "complete" && (
              <div onClick={onClose}>Go Back Home</div>
            )}

            <p className="text-center text-black">
              Having trouble? Ask a staff member for assistance.
            </p>
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop />
    </Sheet>
  );
};

export default QRModal;
