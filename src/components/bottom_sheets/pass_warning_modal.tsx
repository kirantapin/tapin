import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import { Transaction, Restaurant } from "@/types";
import CustomLogo from "../svg/custom_logo";
import { DrinkItem } from "../menu_items";
import { useQRUtils } from "@/hooks/useQRUtils";
import { useBottomSheet } from "@/context/bottom_sheet_context";

interface PassWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionsToRedeem: Transaction[];
  restaurant: Restaurant;
}

const PassWarningModal: React.FC<PassWarningModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  transactionsToRedeem,
}) => {
  const { getItemsFromTransactions } = useQRUtils();
  const { openQrModal } = useBottomSheet();
  const [showHowToRedeemDialog, setShowHowToRedeemDialog] = useState(false);

  const itemsToBeRedeemed = getItemsFromTransactions(transactionsToRedeem);

  const handleVenueStaffClick = () => {
    onClose();
    openQrModal(transactionsToRedeem, true);
  };

  const handleHowToRedeemClick = () => {
    setShowHowToRedeemDialog(true);
  };

  return (
    <>
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-yellow-600"
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
                Show this Page to {restaurant.name} Staff
              </h2>
              <p className="text-gray-600 text-sm">
                Present this page to venue staff to redeem your{" "}
                {transactionsToRedeem.length} item
                {transactionsToRedeem.length > 1 ? "s" : ""}.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mb-6">
              <button
                className="w-full py-3 px-4 rounded-full text-white font-medium transition-colors"
                style={{
                  backgroundColor: restaurant?.metadata.primaryColor,
                }}
                onClick={handleVenueStaffClick}
              >
                I am venue staff
              </button>
              <button
                className="w-full py-3 px-4 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                onClick={handleHowToRedeemClick}
              >
                How to redeem these items
              </button>
            </div>

            {/* Items List */}
            <div className="flex flex-col -mx-4">
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

      {/* How to Redeem Dialog */}
      <AlertDialog
        open={showHowToRedeemDialog}
        onOpenChange={setShowHowToRedeemDialog}
      >
        <AlertDialogContent className="w-[90vw] max-w-md rounded-3xl p-6">
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                How to Redeem These Items
              </h2>
              <p className="text-gray-600 text-sm">
                A {restaurant.name} staff member needs to manually redeem your
                items on your device.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-sm font-semibold">1</span>
                </div>
                <p className="text-gray-700 text-sm">
                  Select which items you want to redeem
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-sm font-semibold">2</span>
                </div>
                <p className="text-gray-700 text-sm">
                  Have a staff member tap "I am venue staff" to access the
                  redemption interface
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-sm font-semibold">3</span>
                </div>
                <p className="text-gray-700 text-sm">
                  The staff member will complete the redemption process on your
                  device
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHowToRedeemDialog(false)}
              className="w-full py-3 px-4 rounded-full text-white font-medium transition-colors"
              style={{
                backgroundColor: restaurant?.metadata.primaryColor,
              }}
            >
              Got it
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PassWarningModal;
