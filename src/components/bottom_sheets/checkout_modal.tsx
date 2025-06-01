import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import CheckoutPage from "@/pages/checkout";
import { X } from "lucide-react";
import { useBottomSheet } from "@/context/bottom_sheet_context";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { closeCheckoutModal } = useBottomSheet();
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="flex flex-col h-full max-h-screen bg-white text-black p-0 [&>button]:hidden"
      >
        <CheckoutPage />
      </SheetContent>
    </Sheet>
  );
};

export default CheckoutModal;
