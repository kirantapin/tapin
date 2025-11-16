import React, { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { X } from "lucide-react";
import { Transaction, Restaurant, Item } from "@/types";
import CustomLogo from "../svg/custom_logo";
import { useNavigate, useLocation } from "react-router-dom";
import { MY_SPOT_PATH } from "@/constants";
import { DrinkItem } from "../menu_items";
import { useQRUtils } from "@/hooks/useQRUtils";
import { ItemUtils } from "@/utils/item_utils";

interface NonRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionsToRedeem: Transaction[];
  restaurant: Restaurant;
}

const NonRedeemModal: React.FC<NonRedeemModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  transactionsToRedeem,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getItemsFromTransactions } = useQRUtils();

  const itemsToBeRedeemed = getItemsFromTransactions(transactionsToRedeem);

  // Get unique item IDs and group by fulfillment requirement
  const { requiresFulfillmentItems, noFulfillmentItems } = useMemo(() => {
    // Get unique item IDs
    const uniqueItemIds = [
      ...new Set(itemsToBeRedeemed.map((item) => item.item.id)),
    ];

    const requiresFulfillment: Item[] = [];
    const noFulfillment: Item[] = [];

    uniqueItemIds.forEach((itemId) => {
      // Get the first occurrence of this item to check fulfillment

      const itemData = { id: itemId };

      if (ItemUtils.requiresFulfillment(itemData, restaurant)) {
        requiresFulfillment.push(itemData);
      } else {
        noFulfillment.push(itemData);
      }
    });

    return {
      requiresFulfillmentItems: requiresFulfillment,
      noFulfillmentItems: noFulfillment,
    };
  }, [itemsToBeRedeemed, restaurant]);

  // Check if user is already on My Spot page
  const isOnMySpotPage = location.pathname.includes(
    MY_SPOT_PATH.replace(":id", restaurant.id)
  );

  const handleGoToMySpot = () => {
    onClose();
    if (!isOnMySpotPage) {
      navigate(MY_SPOT_PATH.replace(":id", restaurant.id), {
        state: { type: "Passes" },
      });
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <SheetContent
        side="bottom"
        className="h-[80vh] rounded-t-3xl [&>button]:hidden p-0 flex flex-col gap-0"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <SheetHeader className="flex-none px-6 pt-6 pb-4 border-b">
          <div className="flex justify-between items-center">
            <CustomLogo
              primaryColor={restaurant?.metadata.primaryColor}
              size={124}
            />
            <button
              className="text-black text-sm font-normal p-2 rounded-full bg-gray-200 flex items-center gap-1 focus:outline-none"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 pt-4">
          {/* Warning Message */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Mixed Item Redemptions
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              You have selected items with mixed redemption types. These cannot
              be redeemed together. Please redeem them individually in the My
              Spot page.
            </p>
            {/* Explain which items can be redeemed together */}
            {requiresFulfillmentItems.length > 0 && (
              <div className="mb-3">
                <p className="text-gray-700 text-sm font-medium mb-1">
                  Can be redeemed together:
                </p>
                <p className="text-gray-600 text-xs">
                  {requiresFulfillmentItems
                    .map((item) => ItemUtils.getItemName(item, restaurant))
                    .join(", ")}
                </p>
              </div>
            )}
            {noFulfillmentItems.length > 0 && (
              <div>
                <p className="text-gray-700 text-sm font-medium mb-1">
                  Must be redeemed by staff:
                </p>
                <p className="text-gray-600 text-xs">
                  {noFulfillmentItems
                    .map((item) => ItemUtils.getItemName(item, restaurant))
                    .join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex flex-col gap-3 mb-6">
            <button
              className="w-full py-3 px-4 rounded-full text-white font-medium transition-colors"
              style={{
                backgroundColor: restaurant?.metadata.primaryColor,
              }}
              onClick={handleGoToMySpot}
            >
              {isOnMySpotPage ? "Close" : "Go to My Spot"}
            </button>
          </div>

          {/* Items List */}
          <div className="flex flex-col -mx-4 mb-6">
            {itemsToBeRedeemed.map((item) => (
              <div key={item.item.id} className="w-full">
                <DrinkItem
                  item={item.item}
                  purchaseDate={item.purchaseDate}
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

export default NonRedeemModal;
