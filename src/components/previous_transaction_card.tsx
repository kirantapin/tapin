import React, { useEffect, useState } from "react";
import { Transaction, Restaurant } from "../types";
import { isEqual } from "lodash";
import { HouseMixerTemplate } from "./templates/house_mixer";

function isDrinkTransactionIncomplete(transaction: Transaction): boolean {
  const meta = transaction.metadata;
  console.log(transaction.metadata);
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

interface PrevTransactionCardProps {
  restaurant: Restaurant;
  transaction: Transaction;
  onUpdate: (action: string, transaction: Transaction) => void;
}

export const PrevTransactionCard: React.FC<PrevTransactionCardProps> = ({
  transaction,
  restaurant,
  onUpdate,
}) => {
  const [selected, setSelected] = useState<boolean>(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction>(transaction);

  useEffect(() => {
    if (selected) {
      onUpdate("add", selectedTransaction);
    } else {
      onUpdate("remove", selectedTransaction);
    }
  }, [selected]);

  useEffect(() => {
    onUpdate("modify", selectedTransaction);
  }, [selectedTransaction]);

  const updateMetadata = (values: Record<string, string>) => {
    setSelectedTransaction((prevSelectedTransaction) => ({
      ...prevSelectedTransaction,
      metadata: {
        ...prevSelectedTransaction.metadata, // Preserve existing metadata
        ...values, // Overwrite or add new key-value pairs from `values`
      },
    }));
  };

  return (
    <div style={{ padding: "20px" }}>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li
          key={transaction.transaction_id}
          onClick={() => {
            setSelected((prevSelected) => {
              if (prevSelected) {
                setSelectedTransaction(transaction);
              }
              return !prevSelected;
            });
          }}
          style={{
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            cursor: "pointer",
            backgroundColor: selected ? "#d3f9d8" : "#fff",
          }}
        >
          <div>
            <strong>
              {selectedTransaction.metadata?.name ||
                selectedTransaction.category}
            </strong>
          </div>
          <div>
            {new Intl.DateTimeFormat("en-US", {
              month: "long",
              day: "numeric",
            }).format(new Date(transaction.created_at))}
          </div>
        </li>
        {selected &&
          isDrinkTransactionIncomplete(transaction) &&
          restaurant && (
            <HouseMixerTemplate
              restaurant={restaurant}
              onUpdate={updateMetadata}
              transaction={transaction}
            />
          )}
      </ul>
    </div>
  );
};
