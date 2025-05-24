import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PhoneInputComponent } from "../signin/phone_input";
import { Verification } from "../signin/verification";
import { supabase } from "../../utils/supabase_client";
import { X } from "lucide-react";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import LiquorForm from "../liquor_form";
import { useRestaurant } from "@/context/restaurant_context";
import { HOUSE_MIXER_LABEL } from "@/constants";

interface LiquorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
}

const LiquorFormModal: React.FC<LiquorFormModalProps> = ({
  isOpen,
  onClose,
  type,
}) => {
  const { restaurant } = useRestaurant();
  const { addToCart } = useBottomSheet();
  const primaryColor = restaurant?.metadata.primaryColor as string;

  if (!restaurant || !primaryColor) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-3xl [&>button]:hidden p-0 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="flex-none px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <SheetTitle className="text-2xl font-bold">
                Make A Drink
              </SheetTitle>
              <button
                onClick={() => {
                  onClose();
                }}
                className="text-gray-500 bg-gray-200 rounded-full p-2 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto min-h-0">
            <LiquorForm
              type={type}
              restaurant={restaurant}
              addToCart={addToCart}
              primaryColor={primaryColor}
              afterAdd={() => {
                onClose();
              }}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LiquorFormModal;
