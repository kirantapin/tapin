import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth_context";
import { Transaction } from "@/types";
import { RESTAURANT_PATH } from "@/constants";
import { ChevronLeft, GlassWater, Ticket, HandCoins, Info } from "lucide-react";
import { ItemUtils } from "@/utils/item_utils";
import { useRestaurant } from "@/context/restaurant_context";
import { PreviousTransactionItem } from "@/components/menu_items";
import { setThemeColor } from "@/utils/color";
import ManageBundles from "@/components/manage_bundles";
import { MySpotSkeleton } from "@/components/skeletons/my_spot_skeleton";
import { useBottomSheet } from "@/context/bottom_sheet_context";

const tagMap: Record<string, { tag: string; icon: any }> = {
  Passes: { tag: "Passes", icon: Ticket },
  Orders: { tag: "Orders", icon: GlassWater },
  "My Bundles": { tag: "My Bundles", icon: HandCoins },
};
const MySpotContent: React.FC = () => {
  setThemeColor();
  const { transactions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [type, setType] = useState<string>(location.state?.type || "Passes");
  const [activeFilter, setActiveFilter] = useState<string>(
    type === "Passes" ? "Passes" : type === "Orders" ? "Orders" : "My Bundles"
  );

  const { restaurant, setCurrentRestaurantId } = useRestaurant();
  const [groupedTransactions, setGroupedTransactions] = useState<
    Record<
      string,
      {
        transactions: Transaction[];
        maxQuantity: number;
        currentQuantity: number;
      }
    >
  >({});
  const { openQrModal } = useBottomSheet();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filterTransactions = () => {
    if (!restaurant) return;
    const filtered = transactions.filter(
      (transaction) =>
        transaction.restaurant_id === restaurant.id &&
        transaction.fulfilled_by === null &&
        ItemUtils.getMenuItemFromItemId(transaction.item, restaurant) &&
        ItemUtils.isPassItem(transaction.item, restaurant) ===
          (activeFilter === "Passes" ? true : false)
    );

    // Group transactions by item ID + modifiers
    const groupedTransactions = filtered.reduce((acc, transaction) => {
      const key =
        transaction.item +
        "|" +
        (transaction.metadata.modifiers || []).join(",");

      if (!acc[key]) {
        acc[key] = {
          transactions: [],
          maxQuantity: 0,
          currentQuantity: 0,
        };
      }
      acc[key].transactions.push(transaction);
      acc[key].maxQuantity = acc[key].transactions.length;
      acc[key].currentQuantity = 0;
      return acc;
    }, {} as Record<string, { transactions: Transaction[]; maxQuantity: number; currentQuantity: number }>);

    setGroupedTransactions(groupedTransactions);
  };

  useEffect(() => {
    if (!restaurant) return;
    if (activeFilter === "Passes") {
      filterTransactions();
    } else if (activeFilter === "Orders") {
      filterTransactions();
    } else if (activeFilter === "My Bundles") {
      setGroupedTransactions({});
    }
  }, [transactions, activeFilter, restaurant]);

  const addItem = (key: string) => {
    setGroupedTransactions((prev) => {
      const newGroupedTransactions = { ...prev };
      if (
        newGroupedTransactions[key].currentQuantity <
        newGroupedTransactions[key].maxQuantity
      ) {
        newGroupedTransactions[key].currentQuantity += 1;
      }
      return newGroupedTransactions;
    });
  };
  const removeItem = (key: string) => {
    setGroupedTransactions((prev) => {
      const newGroupedTransactions = { ...prev };
      if (newGroupedTransactions[key].currentQuantity > 0) {
        newGroupedTransactions[key].currentQuantity -= 1;
      }
      return newGroupedTransactions;
    });
  };

  const grabSelectedTransactions = () => {
    return Object.entries(groupedTransactions).reduce(
      (acc, [key, { transactions, maxQuantity, currentQuantity }]) => {
        if (currentQuantity > 0) {
          acc.push(...transactions.slice(0, currentQuantity));
        }
        return acc;
      },
      [] as Transaction[]
    );
  };

  const selectedTransactions = grabSelectedTransactions();

  if (!restaurant) {
    return <MySpotSkeleton />;
  }

  return (
    <div className="px-3 overflow-x-hidden">
      <div className="flex items-center p-4 sticky top-0 bg-white shadow-sm border-b -mx-3 z-10">
        {/* Back button - absolute positioning to keep it in left corner */}
        <div className="absolute left-4">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/10"
            onClick={() => {
              navigate(RESTAURANT_PATH.replace(":id", restaurant.id));
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Title - centered with flex-1 */}
        <h1 className="flex-1 text-xl font-semibold text-center">My Spot</h1>
      </div>

      <div className="flex gap-3 mb-2 overflow-x-auto pb-2 no-scrollbar mt-6">
        {Object.keys(tagMap).map((filter) => (
          <button
            key={tagMap[filter].tag}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium border ${
              activeFilter === tagMap[filter].tag ? "" : "text-gray-500"
            }`}
            style={
              activeFilter === tagMap[filter].tag
                ? {
                    color: restaurant.metadata.primaryColor as string,
                    borderColor: restaurant.metadata.primaryColor as string,
                  }
                : { backgroundColor: "#f6f8fa", borderColor: "#e5e7eb" }
            }
            onClick={() => {
              setType(tagMap[filter].tag);
              setActiveFilter(tagMap[filter].tag);
            }}
          >
            {React.createElement(tagMap[filter].icon, {
              className: "w-4 h-4 inline-block mr-1.5",
            })}
            {tagMap[filter].tag}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-amber-50 rounded-lg p-3 mb-1 mx-3 border border-gray-200">
        <Info className="w-5 h-5 text-amber-600" />
        <p className="text-black text-sm font-semibold">
          Unredeemed Items expire after 90 days.
        </p>
      </div>

      {Object.keys(groupedTransactions).length === 0 ? (
        activeFilter === "My Bundles" ? (
          <ManageBundles restaurant={restaurant} />
        ) : (
          <p className="text-black font-semibold flex items-center justify-center h-[50vh]">
            You have no unredeemed transactions.
          </p>
        )
      ) : (
        <>
          {/* Transactions List */}
          <ul className="bg-white rounded-lg overflow-hidden space-y-4 pb-24">
            {Object.entries(groupedTransactions).map(
              ([key, { transactions, maxQuantity, currentQuantity }]) => {
                const existingItem = ItemUtils.getMenuItemFromItemId(
                  transactions[0].item,
                  restaurant
                );

                if (!existingItem) return null;

                return (
                  <PreviousTransactionItem
                    key={key}
                    item={{
                      id: transactions[0].item,
                      modifiers: transactions[0].metadata?.modifiers || [],
                    }}
                    currentQuantity={currentQuantity}
                    maxQuantity={maxQuantity}
                    restaurant={restaurant}
                    increment={() => addItem(key)}
                    decrement={() => removeItem(key)}
                  />
                );
              }
            )}
          </ul>

          {/* Redeem Button */}
          <div className="fixed bottom-0 left-0 right-0 flex flex-col gap-2 bg-white py-4 px-4 border-t rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button
              className={`w-full py-3 rounded-full text-white font-semibold ${
                selectedTransactions.length > 0 ? "" : "bg-gray-400 "
              }`}
              style={
                selectedTransactions.length > 0
                  ? {
                      backgroundColor: restaurant.metadata
                        .primaryColor as string,
                    }
                  : { backgroundColor: "#969292" }
              }
              onClick={() => openQrModal(selectedTransactions)}
              disabled={selectedTransactions.length === 0}
            >
              Redeem{" "}
              {selectedTransactions.length > 0
                ? `( ${selectedTransactions.length} )`
                : ""}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MySpotContent;
