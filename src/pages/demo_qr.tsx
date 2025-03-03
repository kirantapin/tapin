import React, { useState, useEffect } from "react";
import { ArrowLeft, QrCode, X } from "lucide-react";
import { useSupabase } from "../context/supabase_context.tsx";
import { useAuth } from "../context/auth_context.tsx";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Transaction } from "../types.ts";
import { BASE_PATH, RESTAURANT_PATH } from "../constants.ts";
import QRCode from "react-qr-code";

export default function DemoQR({
  onBack,
  onSkip,
}: {
  onBack: () => void;
  onSkip: () => void;
}) {
  const [codeEntered, setCodeEntered] = useState("");
  const supabase = useSupabase();
  const { transactions, setTransactions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: restaurant_id } = useParams();
  const [transactionsToRedeem, setTransactionsToRedeem] = useState<
    Transaction[]
  >(location.state?.transactions || []);

  const formatTransactions = (): string => {
    const displayList = [];
    for (const transaction of transactionsToRedeem) {
      displayList.push({
        transaction_id: transaction.transaction_id,
        item: transaction.item,
        category: transaction.category,
        metadata: transaction.metadata,
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
              navigate("../");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically validate the code and proceed accordingly
    console.log("Code submitted:", codeEntered);
  };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => {
            navigate(RESTAURANT_PATH.replace(":id", restaurant_id as string));
          }}
          className=" hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => {
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
          viewBox={`0 0 256 256`}
        />
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <label htmlFor="qr-code" className="block text-lg mb-2">
          Or enter code manually
        </label>
        <div className="relative">
          <input
            id="qr-code"
            type="text"
            value={codeEntered}
            onChange={(e) => setCodeEntered(e.target.value)}
            className="w-full bg-[#FFFFFF] rounded-xl p-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F5B14C]"
            placeholder="Enter QR code"
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
          className="w-full bg-[#F5B14C] text-black py-4 rounded-full text-lg font-medium mt-4 hover:bg-[#E4A43B] transition-colors"
        >
          Submit Code
        </button>
      </form>

      <p className="text-center text-gray-500">
        Having trouble? Ask a staff member for assistance.
      </p>
    </div>
  );
}
