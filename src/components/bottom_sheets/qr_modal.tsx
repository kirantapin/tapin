import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Check, X } from "lucide-react";
import { Transaction, Restaurant, Item } from "@/types";
import { useAuth } from "@/context/auth_context";
import { supabase, supabase_local } from "@/utils/supabase_client";
import QRCode from "react-qr-code";
import OtpInput from "react-otp-input";

import { useBottomSheet } from "@/context/bottom_sheet_context";
import CustomLogo from "../svg/custom_logo";
import { MAX_QR_TRANSACTIONS } from "@/constants";
import { DrinkItem } from "../menu_items";

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
  const { setTransactions, userSession } = useAuth();
  const { triggerToast } = useBottomSheet();
  const [verifyingState, setVerifyingState] = useState<
    "loading" | "complete" | ""
  >("");
  const [updatingTransactions, setUpdatingTransactions] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);

  if (transactionsToRedeem.length > MAX_QR_TRANSACTIONS) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically validate the code and proceed accordingly
    const employeeCode = codeEntered;

    if (!employeeCode) {
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
          employeeCode: employeeCode,
          userAccessToken: userSession?.access_token,
          restaurant_id: restaurant.id,
        },
      }
    );
    const { updatedTransactions } = response.data;
    if (response.error || response.data.error || !response.data.success) {
      setRedeemError(response.data.error || "Failed to Redeem Items");
      setVerifyingState("");
      return;
    }

    if (updatedTransactions.length !== transactionsToRedeem.length) {
      setRedeemError(
        "Error occurred while Redeeming Items. Reach out to Tap In."
      );
      setVerifyingState("");
      return;
    }

    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transactionsToRedeem.some(
          (redeemTransaction) =>
            redeemTransaction.transaction_id === transaction.transaction_id
        )
          ? { ...transaction, fulfilled_by: employeeCode } // Mark as fulfilled
          : transaction
      )
    );
    setVerifyingState("complete");
  };

  const itemsToBeRedeemed: Item[] = [];

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
    const modifiers = (transaction.metadata.modifiers as string[]) || [];
    itemsToBeRedeemed.push({
      id: transaction.item,
      modifiers: modifiers,
    });
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
          {verifyingState !== "complete" ? (
            <div>
              <div className="flex justify-between items-center gap-1">
                <h1 className="text-3xl font-bold mb-2">Scan QR Code</h1>
                <button
                  onClick={() => setShowCodeInput(true)}
                  className="text-xs text-white rounded-full px-3 py-2"
                  style={{
                    backgroundColor: restaurant?.metadata
                      .primaryColor as string,
                  }}
                >
                  Enter Employee Code
                </button>
              </div>
              {redeemError && <div className="text-red-500">{redeemError}</div>}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  showCodeInput
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <form onSubmit={handleSubmit} className="mb-8 mt-4">
                  <div className="relative">
                    <OtpInput
                      value={codeEntered}
                      onChange={setCodeEntered}
                      numInputs={4}
                      inputType="number"
                      shouldAutoFocus
                      renderInput={(props) => (
                        <input
                          {...props}
                          style={{
                            ...props.style,
                            width: "60px",
                            height: "60px",
                          }}
                          className="text-4xl text-center border border-gray-300 rounded-lg focus:border-black focus:outline-none transition-colors"
                        />
                      )}
                      containerStyle="flex gap-4 justify-center"
                    />
                    {codeEntered && (
                      <button
                        type="button"
                        onClick={() => setCodeEntered("")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full text-white py-4 rounded-full text-lg mt-6 font-semibold"
                    style={{
                      backgroundColor:
                        codeEntered.length === 4
                          ? (restaurant?.metadata.primaryColor as string)
                          : "gray",
                    }}
                  >
                    <div className="flex items-center justify-center gap-2 w-full">
                      {verifyingState === "loading" ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <span className="font-semibold">Redeem Items</span>
                          <img
                            src="/tapin_icon_full_white.png"
                            alt="Tap In Icon"
                            className="h-5"
                          />
                        </>
                      )}
                    </div>
                  </button>
                </form>
              </div>

              <p className="text-gray-500 mb-2 pt-2">
                Having trouble? Ask a staff member for assistance.
              </p>

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
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="text-xl mb-2">
                <span className="inline font-semibold">
                  Items have been redeemed successfully and can be served.
                  <Check className="inline-block ml-2 w-7 h-7 text-green-500 align-text-bottom" />
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col">
            {itemsToBeRedeemed.map((item) => (
              <div key={item.id} className="w-full">
                <DrinkItem
                  item={item}
                  purchaseDate={null}
                  onSelect={() => {}}
                  selected={null}
                />
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QRModal;
