import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Transaction, Restaurant } from "../types";
import { QR_CODE_PATH } from "../constants";
import { isEqual, rest } from "lodash";
import { PrevTransactionCard } from "./previous_transaction_card";

function isDrinkTransactionIncomplete(transaction: Transaction): boolean {
  const meta = transaction.metadata;
  switch (transaction.category) {
    case "House Mixer":
      if (meta["liquorType"] && meta["mixer"]) {
        return false;
      }
      break;

    case "Classic Cocktail":
      if (meta["name"]) {
        return false;
      }
      break;

    case "Beer and Cider":
      if (meta["name"]) {
        return false;
      }
      break;

    case "Shot or Shooter":
      if (meta["liquorType"]) {
        return false;
      }
      break;

    case "Specialty Option":
      if (meta["name"]) {
        return false;
      }
      break;
  }

  return true;
}

interface PrevTransactionProps {
  transactions: Transaction[];
  restaurant: Restaurant;
}

export const PrevTransactionDisplay: React.FC<PrevTransactionProps> = ({
  transactions,
  restaurant,
}) => {
  const [selectedTransactions, setSelectedTransactions] = useState<
    Transaction[]
  >([]);
  const navigate = useNavigate();

  const goToQRCodePage = () => {
    navigate(QR_CODE_PATH, { state: { transactions: selectedTransactions } });
  };

  const handleUpdatedTransaction = (
    action: string,
    transaction: Transaction
  ) => {
    setSelectedTransactions((prevTransactions) => {
      switch (action) {
        case "add":
          // Add the transaction if it's not already in the array
          if (
            !prevTransactions.some(
              (t) => t.transaction_id === transaction.transaction_id
            )
          ) {
            return [...prevTransactions, transaction];
          }
          return prevTransactions; // No change if the transaction is already present

        case "remove":
          // Remove the transaction by filtering it out
          return prevTransactions.filter(
            (t) => t.transaction_id !== transaction.transaction_id
          );

        case "modify":
          // Update the transaction if it exists in the array
          return prevTransactions.map((t) =>
            t.transaction_id === transaction.transaction_id ? transaction : t
          );

        default:
          console.warn(`Unknown action: ${action}`);
          return prevTransactions; // Return the state unchanged for unknown actions
      }
    });
  };

  const isAllInfoFilled = selectedTransactions.every((transaction) => {
    if (isDrinkTransactionIncomplete(transaction)) {
      return false;
    }
    return true; // Non-vague transactions don't need extra info
  });

  return (
    <div style={{ padding: "20px" }}>
      <button
        onClick={() => {
          console.log(transactions);
        }}
      >
        see transactions
      </button>
      <h1>Transaction List</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {transactions
          .filter((transaction) => transaction.restaurant_id === restaurant.id)
          .map((transaction) => (
            <PrevTransactionCard
              restaurant={restaurant}
              transaction={transaction}
              onUpdate={handleUpdatedTransaction}
            />
          ))}
      </ul>
      {selectedTransactions.length > 0 && isAllInfoFilled && (
        <button
          onClick={goToQRCodePage}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          disabled={selectedTransactions.length === 0}
        >
          Redeem
        </button>
      )}
    </div>
  );
};
