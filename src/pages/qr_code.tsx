import { useEffect, useState } from "react";
import { useSupabase } from "../context/supabase_context.tsx";
import { useRestaurantData } from "../context/restaurant_context.tsx";
import { useAuth } from "../context/auth_context.tsx";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Transaction } from "../types.ts";
import { BASE_PATH } from "../constants.ts";
import QRCode from "react-qr-code";

export const QRCodeScreen = () => {
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
              console.log("All transactions fulfilled, exiting.");
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

  return (
    <div>
      <div
        style={{
          height: "auto",
          margin: "0 auto",
          maxWidth: 256,
          width: "100%",
        }}
      >
        <QRCode
          size={1024}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={formatTransactions()}
          viewBox={`0 0 256 256`}
        />
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => {
            navigate(`/restaurant/${restaurant_id}`);
          }}
        >
          Redeem Later
        </button>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => {
            console.log(transactionsToRedeem);
          }}
        >
          Test
        </button>
      </div>
    </div>
  );
};

export default QRCodeScreen;
