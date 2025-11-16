import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Check, X } from "lucide-react";
import { Transaction, Restaurant, Item } from "@/types";
import { useAuth } from "@/context/auth_context";
import { supabase, supabase_local } from "@/utils/supabase_client";

import { useBottomSheet } from "@/context/bottom_sheet_context";
import CustomLogo from "../svg/custom_logo";
import { DrinkItem } from "../menu_items";
import { useQRUtils } from "@/hooks/useQRUtils";
import { NO_FULFILLED_BY } from "@/constants";
import { OpeningHoursWarning } from "../display_utils/opening_hours_warning";
import { useOrderDetails } from "@/context/order_details_context";
import { ItemUtils } from "@/utils/item_utils";
import { TransactionUtils } from "@/utils/transaction_utils";

interface SelfRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionsToRedeem: Transaction[];
  restaurant: Restaurant;
}

const SelfRedeemModal: React.FC<SelfRedeemModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  transactionsToRedeem,
}) => {
  const { setTransactions, userSession } = useAuth();
  const { triggerToast } = useBottomSheet();
  const [verifyingState, setVerifyingState] = useState<
    "loading" | "complete" | ""
  >("");
  const [updatingTransactions, setUpdatingTransactions] = useState(false);
  const [showRedeemConfirm, setShowRedeemConfirm] = useState(false);

  const { userDisplayName, serviceType, setShowNameInput, setServiceType } =
    useOrderDetails();

  const { getItemsFromTransactions } = useQRUtils();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user display name exists, if not show popup (only for user redemptions)
    // This is blocking - must have a name
    if (!staffRedemption && !userDisplayName) {
      setShowNameInput(true);
      return;
    }

    // Show confirmation dialog
    setShowRedeemConfirm(true);
  };

  const handleConfirmRedeem = async () => {
    setShowRedeemConfirm(false);
    setVerifyingState("loading");
    const response = await supabase_local.functions.invoke(
      "redeem_transactions_client",
      {
        body: {
          transactionIds: transactionsToRedeem.map(
            (transaction) => transaction.transaction_id
          ),
          userAccessToken: userSession?.access_token,
          restaurant_id: restaurant.id,
          metadata: {
            user_display_name: staffRedemption
              ? "Staff Redemption"
              : userDisplayName,
            service_type: serviceType,
          },
        },
      }
    );
    const { updatedTransactions } = response.data;
    if (response.error || response.data.error || !response.data.success) {
      triggerToast(response.data.error || "Failed to Redeem Items", "error");
      setVerifyingState("");
      return;
    }

    if (updatedTransactions.length !== transactionsToRedeem.length) {
      triggerToast("Error occurred while Redeeming Items.", "error");
      setVerifyingState("");
      return;
    }

    setTransactions((prevTransactions) =>
      prevTransactions.map((transaction) =>
        transactionsToRedeem.some(
          (redeemTransaction) =>
            redeemTransaction.transaction_id === transaction.transaction_id
        )
          ? {
              ...transaction,
              fulfilled_by: NO_FULFILLED_BY,
              fulfilled_at: new Date().toISOString(),
            } // Mark as fulfilled
          : transaction
      )
    );
    setVerifyingState("complete");
  };

  const itemsToBeRedeemed: { item: Item; purchaseDate: string }[] =
    getItemsFromTransactions(transactionsToRedeem);

  const staffRedemption = transactionsToRedeem.every(
    (transaction) =>
      !ItemUtils.requiresFulfillment(
        TransactionUtils.getTransactionItem(transaction),
        restaurant as Restaurant
      )
  );

  const modifiedOnClose = async () => {
    setUpdatingTransactions(true);
    const { data: updatedTransactions } = await supabase
      .from("transactions")
      .select("transaction_id, fulfilled_by, fulfilled_at")
      .not("fulfilled_by", "is", null)
      .in(
        "transaction_id",
        transactionsToRedeem.map((t) => t.transaction_id)
      );

    if (updatedTransactions && updatedTransactions.length > 0) {
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) => {
          const updatedTransaction = updatedTransactions.find(
            (ut) => ut.transaction_id === transaction.transaction_id
          );
          if (updatedTransaction) {
            return {
              ...transaction,
              fulfilled_by: updatedTransaction.fulfilled_by,
              fulfilled_at: updatedTransaction.fulfilled_at,
            };
          }
          return transaction;
        })
      );
    } else {
      triggerToast("No Items were redeemed", "info");
    }
    setUpdatingTransactions(false);
    onClose();
  };

  return (
    <>
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            modifiedOnClose();
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
                onClick={async () => {
                  await modifiedOnClose();
                }}
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
            <OpeningHoursWarning context="redemption" />
            {verifyingState !== "complete" ? (
              <div>
                <p className="text-black mb-0 text-lg font-semibold">
                  {staffRedemption
                    ? `Redeeming ${transactionsToRedeem.length} item${
                        transactionsToRedeem.length > 1 ? "s" : ""
                      } for customer`
                    : `You're about to redeem ${
                        transactionsToRedeem.length
                      } item${transactionsToRedeem.length > 1 ? "s" : ""}.`}
                </p>
                <p className="text-gray-500 mb-0 pt-1 text-sm">
                  {staffRedemption
                    ? "As venue staff, you can redeem these items for the customer. Make sure you have confirmed the customer's identity and that they are present."
                    : "Having trouble? Ask a staff member for assistance. If you would rather redeem your items later, then just click out of this page. Items will be saved in My Spot for up to 90 days."}
                </p>

                {!staffRedemption && userDisplayName && (
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-md text-gray-600">
                        Order name:{" "}
                        <span className="font-semibold text-md text-black">
                          {userDisplayName}
                        </span>
                      </p>
                      <button
                        onClick={() => setShowNameInput(true)}
                        className="px-3 text-sm font-medium "
                        style={{
                          color: restaurant?.metadata.primaryColor,
                        }}
                      >
                        Change
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-md text-gray-600">Order for:</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setServiceType("pickup")}
                          className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            serviceType === "pickup"
                              ? "text-white"
                              : "text-gray-600 border border-gray-300"
                          }`}
                          style={{
                            backgroundColor:
                              serviceType === "pickup"
                                ? restaurant?.metadata.primaryColor
                                : "transparent",
                          }}
                        >
                          Pickup
                        </button>
                        <button
                          onClick={() => setServiceType("dine_in")}
                          className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            serviceType === "dine_in"
                              ? "text-white"
                              : "text-gray-600 border border-gray-300"
                          }`}
                          style={{
                            backgroundColor:
                              serviceType === "dine_in"
                                ? restaurant?.metadata.primaryColor
                                : "transparent",
                          }}
                        >
                          Dine In
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4 mb-2">
                <div className="flex justify-center">
                  <div
                    className="rounded-full p-4 w-22 h-22 flex items-center justify-center"
                    style={{
                      backgroundColor: restaurant?.metadata.primaryColor,
                    }}
                  >
                    <Check className="w-14 h-14 text-white" />
                  </div>
                </div>
                <div className="text-xl text-center">
                  <span className=" font-semibold">
                    {staffRedemption
                      ? `Items have been redeemed for the customer.`
                      : `Your redemption has been sent to the ${restaurant.name} kitchen. Please confirm your order.`}
                  </span>
                </div>
                {!staffRedemption && (
                  <div className="flex items-center justify-center gap-4 text-center mb-2">
                    <p className="text-gray-600 text-md m-0">
                      Order name:{" "}
                      <span className="font-semibold text-gray-900">
                        {userDisplayName}
                      </span>
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-md">Order for:</span>
                      <button
                        className={`px-3 py-1.5 rounded-full text-xs font-medium text-white`}
                        style={{
                          backgroundColor: restaurant?.metadata.primaryColor,
                        }}
                      >
                        {serviceType === "pickup" ? "Pickup" : "Dine In"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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

          {/* Fixed Redeem Button */}
          <div className="flex-none px-6 py-4 bg-white border-t border-gray-200">
            <button
              className={`w-full py-3 rounded-full text-lg font-semibold text-white`}
              style={{
                backgroundColor: restaurant?.metadata.primaryColor,
                borderColor: restaurant?.metadata.primaryColor,
              }}
              onClick={
                verifyingState === "complete"
                  ? async () => {
                      await modifiedOnClose();
                    }
                  : handleSubmit
              }
              disabled={verifyingState === "loading"}
            >
              <div className="flex items-center justify-center gap-2 w-full">
                {verifyingState === "loading" ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : verifyingState === "complete" ? (
                  updatingTransactions ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span className="font-semibold">Close</span>
                      <img
                        src="/tapin_icon_full_white.png"
                        alt="Tap In Icon"
                        className="h-5"
                      />
                    </>
                  )
                ) : (
                  <>
                    <span className="font-semibold">Redeem</span>
                    <img
                      src="/tapin_icon_full_white.png"
                      alt="Tap In Icon"
                      className="h-5"
                    />
                  </>
                )}
              </div>
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Redeem Confirmation Dialog */}
      <AlertDialog open={showRedeemConfirm} onOpenChange={setShowRedeemConfirm}>
        <AlertDialogContent className="w-[90vw] max-w-md rounded-3xl p-6">
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {staffRedemption
                  ? "Are you ready to redeem these items for the customer?"
                  : `Are you ready to redeem these items for ${
                      serviceType === "pickup" ? "Pickup" : "Dine In"
                    }?`}
              </h2>
              <p className="text-gray-600 text-sm">
                {staffRedemption
                  ? `This will redeem these items for the customer. Make sure the customer is present and you have confirmed their identity.`
                  : `This will send your redemption order to the ${restaurant.name} kitchen. Make sure you are ready to receive your items.`}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRedeemConfirm(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRedeem}
                className="flex-1 py-3 px-4 rounded-full text-white font-medium transition-colors"
                style={{
                  backgroundColor: restaurant?.metadata.primaryColor,
                }}
              >
                Redeem
              </button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SelfRedeemModal;
