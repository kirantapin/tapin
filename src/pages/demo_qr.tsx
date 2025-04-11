import React, { useState, useEffect } from "react";
import { ArrowLeft, QrCode, X } from "lucide-react";
import { useSupabase } from "../context/supabase_context.tsx";
import { useAuth } from "../context/auth_context.tsx";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Transaction } from "../types.ts";
import { BASE_PATH, RESTAURANT_PATH } from "../constants.ts";
import { itemToStringDescription } from "@/utils/parse.ts";
import { supabase_local } from "@/utils/supabase_client.ts";
import { QRCode } from "react-qrcode-logo";
export default function DemoQR({
  onBack,
  onSkip,
}: {
  onBack: () => void;
  onSkip: () => void;
}) {
  const [codeEntered, setCodeEntered] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const supabase = useSupabase();
  const { userData, transactions, setTransactions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: restaurant_id } = useParams();
  const [transactionsToRedeem, setTransactionsToRedeem] = useState<
    Transaction[]
  >(location.state?.transactions || []);
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

  useEffect(() => {
    if (!transactionsToRedeem || transactionsToRedeem.length === 0) return;

    // Set up a listener for all transaction IDs
    const transactionIds = transactionsToRedeem.map((t) => t.transaction_id);
    const channel = supabase
      .channel("transaction_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `transaction_id=in.(${transactionIds.join(",")})`, // Use IN filter for multiple IDs
        },
        (payload) => {
          const updatedTransactionId = payload.new.transaction_id;
          console.log("here");

          setTransactions((prevTransactions) => {
            // Update the transactions state
            const updatedTransactions = prevTransactions.map((transaction) =>
              transaction.transaction_id === updatedTransactionId
                ? { ...transaction, is_fulfilled: payload.new.is_fulfilled }
                : transaction
            );

            // Check if all transactions are fulfilled
            const allFulfilled = transactionsToRedeem.every((t) =>
              updatedTransactions.some(
                (ut: Transaction) =>
                  ut.transaction_id === t.transaction_id && ut.fulfilled_by
              )
            );

            if (allFulfilled) {
              console.log("inside here");
              setVerifyingState("complete");
            }
            console.log(updatedTransactions);
            return updatedTransactions;
          });
        }
      )
      .subscribe();

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      supabase.removeChannel(channel);
      console.log("removing channel");
    };
  }, [transactionsToRedeem]);

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

  transactionsToRedeem.forEach((transaction) => {
    const itemDescription = itemToStringDescription(
      {
        id: transaction.item,
        modifiers: transaction.metadata.modifiers || [],
      },
      restaurant
    );
    itemFrequencyMap[itemDescription] =
      (itemFrequencyMap[itemDescription] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => {
            console.log("arrow left");
            navigate(RESTAURANT_PATH.replace(":id", restaurant_id as string));
          }}
          className=" hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => {
            console.log("redeem later button");
            navigate(RESTAURANT_PATH.replace(":id", restaurant_id as string));
          }}
          className="text-[#F5B14C] hover:text-[#E4A43B] transition-colors"
        >
          Redeem Later
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-4">Scan QR Code</h1>
      <p className="text-xl text-gray-500 mb-8">
        Scan the QR code at the restaurant to check in and unlock offers.
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
            <span className="font-bold">{frequency}x</span> {item}
          </div>
        ))}
      </div>

      {redeemError && <div>{redeemError}</div>}

      <form onSubmit={handleSubmit} className="mb-8">
        <label htmlFor="qr-code" className="block text-lg mb-2">
          Or have the Bartender redeem manually
        </label>
        <div className="relative">
          <input
            id="qr-code"
            type="text" // Keeps the input type as text
            inputMode="numeric" // Suggests numeric keyboard on mobile
            pattern="[0-9]*" // Helps enforce numeric input
            value={codeEntered}
            onChange={(e) => setCodeEntered(e.target.value)}
            className="w-full bg-[#FFFFFF] rounded-xl p-4 pr-12 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5B14C]"
            placeholder="Enter Employee Phone Number"
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
          className="w-full bg-[#F5B14C] text-black py-4 rounded-full text-lg mt-4 hover:bg-[#E4A43B] transition-colors"
        >
          Submit Code
        </button>
      </form>
      {verifyingState && <div>{verifyingState}</div>}
      {verifyingState === "complete" && (
        <div
          onClick={() => {
            console.log("go back home button");
            navigate(RESTAURANT_PATH.replace(":id", restaurant_id));
          }}
        >
          Go Back Home
        </div>
      )}

      <p className="text-center text-gray-500">
        Having trouble? Ask a staff member for assistance.
      </p>
      <button
        onClick={() => {
          console.log(transactionsToRedeem);
        }}
      >
        test
      </button>
    </div>
  );
}
