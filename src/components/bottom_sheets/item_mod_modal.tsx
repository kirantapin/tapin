import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X, Check } from "lucide-react";
import { useRestaurant } from "@/context/restaurant_context";
import { Item } from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { ImageFallback } from "../display_utils/image_fallback";
import { ImageUtils } from "@/utils/image_utils";
import { titleCase } from "title-case";

interface ItemModModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  onSelect: (item: Item) => Promise<void>;
}

const ItemModModal: React.FC<ItemModModalProps> = ({
  isOpen,
  onClose,
  itemId,
  onSelect,
}) => {
  const { restaurant } = useRestaurant();
  const [selectedVariation, setSelectedVariation] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  if (!restaurant) return null;
  const menuItem = ItemUtils.getMenuItemFromItemId(itemId, restaurant);
  if (!menuItem) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-[90vw] max-w-3xl max-h-[85vh] p-6 rounded-3xl overflow-y-auto flex flex-col">
        <AlertDialogHeader className="flex-none pb-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <AlertDialogTitle className="text-2xl font-bold">
              Modify {titleCase(menuItem?.name)}
            </AlertDialogTitle>
            <button
              onClick={onClose}
              className="text-black bg-gray-200 rounded-full p-2 focus:outline-none hover:bg-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </AlertDialogHeader>

        <div className="flex-1  overflow-y-auto">
          <div className="flex items-start space-x-6">
            {/* Item Image */}
            <ImageFallback
              src={ImageUtils.getItemImageUrl(itemId, restaurant)}
              alt={menuItem?.name}
              className="h-24 w-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0"
              restaurant={restaurant}
            />

            {/* Item Name, Price, and Description */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-semibold text-black">
                  {titleCase(menuItem?.name)}
                </h3>
              </div>

              {"description" in menuItem && menuItem.description && (
                <div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {menuItem.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Variations List */}
          {"variations" in menuItem &&
            menuItem.variations &&
            Object.keys(menuItem.variations).length > 0 && (
              <div className="mt-8">
                <h4 className="text-md font-medium text-right text-gray-600 mb-4">
                  Required
                </h4>
                <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
                  {Object.entries(menuItem.variations).map(
                    ([key, variation]) => (
                      <div
                        key={key}
                        onClick={() => setSelectedVariation(key)}
                        className={`relative flex-shrink-0 cursor-pointer rounded-xl border border-1 p-5 pl-4 pt-4 min-w-[140px] transition-all hover:shadow-md`}
                        style={{
                          borderColor:
                            selectedVariation === key
                              ? restaurant.metadata.primaryColor
                              : undefined,
                        }}
                      >
                        {/* Selection indicator */}
                        <div
                          className={`absolute bottom-2 right-2 w-5 h-5 rounded-full flex items-center justify-center `}
                          style={{
                            backgroundColor:
                              selectedVariation === key
                                ? restaurant.metadata.primaryColor
                                : "transparent",
                            border:
                              selectedVariation === key
                                ? `none`
                                : `1px solid #d1d5db`,
                          }}
                        >
                          {selectedVariation === key && (
                            <Check size={14} className="text-white" />
                          )}
                        </div>

                        <div className="text-center">
                          <p className="text-md text-left font-medium text-gray-900">
                            {titleCase(variation.name)}
                          </p>
                          <p className="text-sm text-left text-gray-600 mt-1">
                            ${variation.absolutePrice.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Add to Cart Button - Fixed at bottom */}
        <div className="flex-none pt-6 border-t border-gray-200 mt-auto">
          <button
            onClick={async () => {
              // Create item with selected variation
              setLoading(true);
              const itemWithVariation: Item = {
                id: itemId,
                variation: selectedVariation,
                modifiers: [],
              };
              await onSelect(itemWithVariation);
              setLoading(false);
              onClose();
            }}
            disabled={
              loading ||
              !!ItemUtils.doesItemRequireConfiguration(
                {
                  id: itemId,
                  variation: selectedVariation,
                  modifiers: [],
                },
                restaurant
              )
            }
            className={`w-full h-14 text-white rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 ${
              selectedVariation
                ? "opacity-100 pointer-events-auto"
                : "opacity-50 cursor-not-allowed"
            }`}
            style={{
              backgroundColor: selectedVariation
                ? restaurant.metadata.primaryColor
                : "#9ca3af",
            }}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              </div>
            ) : (
              <span className="font-medium text-md">
                {selectedVariation
                  ? "Done"
                  : ItemUtils.doesItemRequireConfiguration(
                      {
                        id: itemId,
                        variation: selectedVariation,
                        modifiers: [],
                      },
                      restaurant
                    )}
              </span>
            )}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ItemModModal;
