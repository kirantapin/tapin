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
import BundleSlider from "../sliders/bundle_slider";
import { useRestaurant } from "@/context/restaurant_context";

interface AllBundlesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AllBundlesModal: React.FC<AllBundlesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { restaurant } = useRestaurant();
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="h-[70vh] rounded-t-3xl [&>button]:hidden p-0"
      >
        <div className="flex flex-col">
          <SheetHeader className="flex-none px-6 pt-6 pb-4">
            <div className="flex justify-between items-start">
              <SheetTitle className="text-2xl font-bold">
                {restaurant?.name} Bundles
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
        </div>
        <BundleSlider />
      </SheetContent>
    </Sheet>
  );
};

export default AllBundlesModal;
