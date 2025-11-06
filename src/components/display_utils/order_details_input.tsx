import React, { useState, useEffect } from "react";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Restaurant } from "@/types";
import { useOrderDetails, ServiceType } from "@/context/order_details_context";

interface OrderDetailsInputProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onNameSubmit: (name: string, serviceType: ServiceType) => void;
}

export const OrderDetailsInput: React.FC<OrderDetailsInputProps> = ({
  restaurant,
  isOpen,
  onOpenChange,
  onNameSubmit,
}) => {
  const { userDisplayName, serviceType, setServiceType } = useOrderDetails();
  const [tempName, setTempName] = useState("");

  // Reset temp name when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTempName(userDisplayName || "");
    }
  }, [isOpen, userDisplayName]);

  const handleNameSubmit = () => {
    const nameToUse = tempName.trim() || userDisplayName || "";

    if (nameToUse) {
      onNameSubmit(nameToUse, serviceType);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[90vw] max-w-md rounded-3xl p-6">
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              What's your name?
            </h2>
            <p className="text-gray-600 text-sm">
              Provide your name for the order. This will be saved for future
              orders.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-black focus:outline-none text-lg"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNameSubmit();
                }
              }}
            />

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

            <div className="flex gap-3">
              <button
                onClick={() => {
                  onOpenChange(false);
                  setTempName("");
                }}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNameSubmit}
                className="flex-1 py-3 px-4 rounded-full text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor:
                    tempName.trim().length > 0
                      ? restaurant?.metadata.primaryColor
                      : "gray",
                }}
                disabled={tempName.trim().length === 0}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
