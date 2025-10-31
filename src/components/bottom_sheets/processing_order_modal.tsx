import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useRestaurant } from "@/context/restaurant_context";
import CustomLogo from "../svg/custom_logo";

interface ProcessingOrderModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

const ProcessingOrderModal: React.FC<ProcessingOrderModalProps> = ({
  isOpen,
}) => {
  const { restaurant } = useRestaurant();
  if (!restaurant) {
    return null;
  }
  return (
    <Sheet open={isOpen} onOpenChange={() => {}}>
      <SheetContent
        side="bottom"
        className="h-[25vh] rounded-t-3xl [&>button]:hidden p-0 gap-0 flex flex-col bg-white"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* TapIn Icon in top left */}
        <div className="absolute top-6 left-6 z-10">
          <CustomLogo
            primaryColor={restaurant?.metadata.primaryColor || "#000000"}
            size={124}
          />
        </div>

        {/* Loading Spinner in top right */}
        <div className="absolute top-6 right-6 z-10">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div
              className="absolute inset-0 border-4 rounded-full animate-spin"
              style={{ borderTopColor: restaurant?.metadata.primaryColor }}
            ></div>
          </div>
        </div>

        {/* Main content area with message */}
        <div className="flex flex-col items-center justify-center gap-6 px-6 mt-8 flex-1">
          <p className="text-lg font-semibold text-gray-800 text-center">
            One moment, we are processing your order...
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProcessingOrderModal;
