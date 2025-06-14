import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
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
        className="h-[80vh] rounded-t-3xl [&>button]:hidden p-0 flex flex-col gap-0 overflow-x-hidden"
      >
        <SheetHeader className="flex-none px-4 pt-6 pb-4 border-b border-gray-200">
          <div className="flex justify-between items-start w-full">
            <SheetTitle className="text-2xl font-bold truncate">
              {restaurant?.name} Bundles
            </SheetTitle>
            <button
              onClick={onClose}
              className="text-black bg-gray-200 rounded-full p-2 focus:outline-none flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 w-full">
          <BundleSlider />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AllBundlesModal;
