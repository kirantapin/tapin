import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth_context";
import { Transaction, Restaurant } from "@/types";
import { convertUtcToLocal, itemToStringDescription } from "@/utils/parse";
import { fetchRestaurantById } from "@/utils/queries/restaurant";
import { PASS_MENU_TAG, RESTAURANT_PATH } from "@/constants";
import { ArrowLeft } from "lucide-react";
import { checkoutStyles } from "@/styles/checkout_styles";
import { rest } from "lodash";
import { ItemUtils } from "@/utils/item_utils";

// Transaction List Component
const TransactionList: React.FC = () => {
  const { transactions, userData } = useAuth(); // Fetch transactions and user context
  const { id: restaurant_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [showPasses, setShowPasses] = useState<boolean>(
    location.state?.showPasses || false
  );
  const [activeFilter, setActiveFilter] = useState(
    showPasses ? "Passes" : "Orders"
  );
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [completedTransactions, setCompletedTransactions] = useState<
    Transaction[]
  >([]);
  const [selectedTransactions, setSelectedTransactions] = useState<
    Transaction[]
  >([]);

  useEffect(() => {
    if (!restaurant_id) return; // If no restaurant_id, do nothing

    // Filter transactions based on restaurant_id and only show unredeemed transactions
    const fetchData = async () => {
      const restaurantData = await fetchRestaurantById(restaurant_id);
      if (!restaurantData) {
        navigate("/not_found_page");
      }

      setRestaurant(restaurantData as Restaurant);
    };
    fetchData();
    const filtered = transactions.filter(
      (transaction) =>
        transaction.restaurant_id === restaurant_id &&
        transaction.fulfilled_by === null &&
        (transaction.item[0] === PASS_MENU_TAG) === showPasses
    );
    const completed = transactions.filter(
      (transaction) =>
        transaction.restaurant_id === restaurant_id &&
        transaction.fulfilled_by !== null
    );

    setCompletedTransactions(completed);
    setFilteredTransactions(filtered);
  }, [transactions, restaurant_id, showPasses]);

  // Handle selecting/deselecting transactions
  const handleSelectTransaction = (transaction: Transaction) => {
    console.log(transaction);
    setSelectedTransactions(
      (prevSelected) =>
        prevSelected.some(
          (t) => t.transaction_id === transaction.transaction_id
        )
          ? prevSelected.filter(
              (t) => t.transaction_id !== transaction.transaction_id
            ) // Deselect if already selected
          : [...prevSelected, transaction] // Add the full transaction object
    );
  };

  // Handle Redeem Button Click
  const handleRedeem = async () => {
    try {
      // TODO: Add API call to update transactions as redeemed in Supabase
      // Example: Call Supabase to update 'fulfilled_by' field with currentUser ID
      navigate(QR_CODE_PATH.replace(":id", restaurant_id), {
        state: {
          transactions: selectedTransactions,
        },
      });
    } catch (error) {
      console.error("Error navigating to redeem page:", error);
    }
  };

  if (!restaurant) {
    return <div>Loading...</div>;
  }

  return (
    <div className={checkoutStyles.pageContainer}>
      <button className="mb-8">
        <ArrowLeft
          className="w-6 h-6"
          onClick={() => {
            navigate(RESTAURANT_PATH.replace(":id", restaurant_id));
          }}
        />
      </button>
      <div className="flex justify-center">
        {restaurant && (
          <h2 className="text-xl font-bold mb-4 text-center">
            Your Transactions at {restaurant.name}
          </h2>
        )}
      </div>
      <div className="flex gap-3 mb-4 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar ml-1">
        {["Passes", "Orders"].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
              activeFilter === filter ? " border " : "border text-gray-500"
            }`}
            style={
              activeFilter === filter
                ? {
                    color: restaurant?.metadata.primaryColor,
                    borderColor: restaurant?.metadata.primaryColor,
                    backgroundColor: `${restaurant?.metadata.primaryColor}33`,
                  }
                : {}
            }
            onClick={() => {
              setShowPasses(filter === "Passes");
              setActiveFilter(filter);
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {filteredTransactions.length === 0 ? (
        <p className="text-gray-500">No transactions available.</p>
      ) : (
        <>
          {/* Transactions List */}
          <ul className="bg-white rounded-lg overflow-hidden divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <li
                key={transaction.transaction_id}
                className="p-4 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
              >
                <div
                  className="flex items-center gap-3"
                  onClick={() => {
                    handleSelectTransaction(transaction);
                  }}
                >
                  {/* Checkbox for selection */}
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-red-500 focus:ring-red-500"
                    checked={selectedTransactions.includes(transaction)}
                    onChange={() => handleSelectTransaction(transaction)}
                  />
                  <div>
                    <p className="font-semibold text-gray-700">
                      {ItemUtils.getItemName(
                        {
                          id: transaction.item,
                          modifiers: transaction.metadata.modifiers || [],
                        },
                        restaurant
                      )}
                    </p>
                    <p className="text-gray-500">
                      ${transaction.price?.toFixed(2)}
                    </p>
                    <p className="text-gray-500">
                      {convertUtcToLocal(transaction.created_at)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Redeem Button */}
          <button
            className={`w-full mt-4 py-2 rounded-lg text-white font-semibold ${
              selectedTransactions.length > 0 ? "" : "bg-gray-400 "
            }`}
            style={
              selectedTransactions.length > 0
                ? { background: restaurant?.metadata.primaryColor }
                : {}
            }
            onClick={handleRedeem}
            disabled={selectedTransactions.length === 0}
          >
            Redeem{" "}
            {selectedTransactions.length > 0
              ? `(${selectedTransactions.length})`
              : ""}
          </button>
        </>
      )}

      <>
        {/* Transactions List */}
        <ul className="bg-white shadow-lg rounded-lg overflow-hidden divide-y divide-gray-200">
          {completedTransactions.map((transaction) => (
            <li
              key={transaction.transaction_id}
              className="p-4 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                {/* Checkbox for selection */}
                <div>
                  <p className="font-semibold text-gray-700">
                    {ItemUtils.getItemName(
                      {
                        id: transaction.item,
                        modifiers: transaction.metadata.modifiers || [],
                      },
                      restaurant
                    )}
                  </p>
                  <p className="text-gray-500">
                    ${transaction.price?.toFixed(2)}
                  </p>
                  <p className="text-gray-500">{transaction.created_at}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </>
    </div>
  );
};

export default TransactionList;
