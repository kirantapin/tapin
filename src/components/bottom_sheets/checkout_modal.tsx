import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import CheckoutPage from "@/pages/checkout";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
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
