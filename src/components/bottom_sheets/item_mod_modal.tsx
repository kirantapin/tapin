import React, { useState, useEffect, useRef } from "react";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { X, Check } from "lucide-react";
import { useRestaurant } from "@/context/restaurant_context";
import { Item, ModifierGroup, NormalItem } from "@/types";
import { ItemUtils } from "@/utils/item_utils";
import { ImageFallback } from "../display_utils/image_fallback";
import { ImageUtils } from "@/utils/image_utils";
import { titleCase } from "title-case";
import { AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  const [selectedModifiers, setSelectedModifiers] = useState<
    Record<string, string[]> | undefined
  >(undefined);
  const [variations, setVariations] = useState<Record<
    string,
    {
      sourceId: string | null;
      name: string;
      absolutePrice: number;
      archived?: boolean;
    }
  > | null>(null);
  const [modifierGroups, setModifierGroups] = useState<
    Record<string, ModifierGroup>
  >({});
  const [loading, setLoading] = useState(false);
  const [displayReady, setDisplayReady] = useState(false);

  const menuItem = restaurant
    ? (ItemUtils.getMenuItemFromItemId(itemId, restaurant) as NormalItem)
    : null;

  useEffect(() => {
    if (isOpen && menuItem && restaurant && !displayReady) {
      const item = {
        id: itemId,
        variation: selectedVariation,
        modifiers: selectedModifiers,
      };
      ItemUtils.doesItemRequireConfiguration(item, restaurant);
      setSelectedVariation(item.variation);
      setSelectedModifiers(item.modifiers);
      const { variations, modifierGroups } =
        menuItem && restaurant
          ? ItemUtils.extractActiveVariationAndModifierGroups(
              menuItem,
              restaurant
            )
          : { variations: {}, modifierGroups: {} };
      setVariations(variations);
      setModifierGroups(modifierGroups);
      setDisplayReady(true);
    }
  }, [isOpen, menuItem, restaurant, displayReady]);

  if (!menuItem || !restaurant || !displayReady) return null;

  const errorMessage = ItemUtils.doesItemRequireConfiguration(
    {
      id: itemId,
      variation: selectedVariation,
      modifiers: selectedModifiers,
    },
    restaurant
  );

  const isItemValid = errorMessage === null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-[90vw] max-w-3xl max-h-[85vh] rounded-3xl overflow-y-auto flex flex-col gap-0 p-0">
        <AlertDialogTitle className="sr-only">
          Configure {titleCase(menuItem?.name)}
        </AlertDialogTitle>
        <div className="flex-1 overflow-y-auto pt-6 no-scrollbar px-6">
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
              <div className="flex justify-between items-start gap-3">
                <h3 className="text-xl font-semibold text-black flex-1 break-words">
                  {titleCase(menuItem?.name)}
                </h3>
                <button
                  onClick={onClose}
                  className="text-black bg-gray-200 rounded-full p-2 focus:outline-none hover:bg-gray-300 transition-colors flex-shrink-0"
                >
                  <X size={20} />
                </button>
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
          {variations && Object.keys(variations).length > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-medium text-right text-gray-600 mb-4">
                Required
              </h4>
              <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6">
                {Object.entries(variations)
                  .sort(([, a], [, b]) => a.absolutePrice - b.absolutePrice)
                  .map(([key, variation]) => (
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
                  ))}
              </div>
            </div>
          )}

          {/* Modifiers List */}
          {modifierGroups && Object.keys(modifierGroups).length > 0 && (
            <div className="mt-8 pb-6">
              <div className="space-y-6">
                {Object.entries(modifierGroups).map(
                  ([modifierGroupId, modifierGroup]) => {
                    const currentSelections =
                      selectedModifiers?.[modifierGroupId] || [];

                    const handleModifierToggle = (modifierId: string) => {
                      setSelectedModifiers((prev) => {
                        const current = prev?.[modifierGroupId] || [];
                        let newSelections: string[];

                        if (modifierGroup.select === "single") {
                          // For single selection, replace the selection
                          newSelections = current.includes(modifierId)
                            ? []
                            : [modifierId];
                        } else {
                          // For multiple selection, toggle the selection
                          if (current.includes(modifierId)) {
                            newSelections = current.filter(
                              (id) => id !== modifierId
                            );
                          } else {
                            newSelections = [...current, modifierId];
                          }
                        }

                        return {
                          ...prev,
                          [modifierGroupId]: newSelections,
                        };
                      });
                    };

                    const { minSelected, maxSelected, modifiers } =
                      modifierGroup;
                    const hasMin = minSelected != null; // not null/undefined
                    const hasMax = maxSelected != null; // not null/undefined
                    const maxCap = hasMax
                      ? Math.min(maxSelected!, modifiers.length)
                      : 0;

                    return (
                      <div key={modifierGroupId} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900">
                            {modifierGroup.name}
                          </h5>
                          <div className="text-sm text-gray-500">
                            {modifierGroup.select === "single" ||
                            (minSelected === 1 && maxSelected === 1) ? (
                              <span>Required</span>
                            ) : (
                              (hasMin || hasMax) && (
                                <span>
                                  {hasMin && hasMax
                                    ? minSelected === maxCap
                                      ? `${minSelected} Selections`
                                      : `${minSelected}-${maxCap} Selections`
                                    : hasMin
                                    ? `Min: ${minSelected} Selection${
                                        minSelected! > 1 ? "s" : ""
                                      }`
                                    : `Max: ${maxCap} Selection${
                                        maxCap > 1 ? "s" : ""
                                      }`}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div className="divide-y divide-gray-200">
                          {modifierGroup.modifiers
                            .sort((a, b) => a.delta - b.delta)
                            .map((modifier, index) => {
                              const isSelected = currentSelections.includes(
                                modifier.id
                              );
                              const priceChange = modifier.delta !== 0;

                              return (
                                <div
                                  key={modifier.id}
                                  onClick={() =>
                                    handleModifierToggle(modifier.id)
                                  }
                                  className={`flex items-center justify-between p-3 cursor-pointer transition-all`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        modifierGroup.select === "single"
                                          ? "rounded-full"
                                          : "rounded"
                                      }`}
                                      style={{
                                        borderColor: isSelected
                                          ? restaurant.metadata.primaryColor
                                          : "#d1d5db",
                                        backgroundColor: isSelected
                                          ? restaurant.metadata.primaryColor
                                          : "transparent",
                                      }}
                                    >
                                      {isSelected && (
                                        <Check
                                          size={12}
                                          className="text-white"
                                        />
                                      )}
                                    </div>
                                    <span className="font-medium text-gray-900">
                                      {modifier.name}
                                    </span>
                                  </div>

                                  {priceChange && (
                                    <span
                                      className={`text-sm font-medium text-gray-600`}
                                    >
                                      {modifier.delta > 0 ? "+" : ""}$
                                      {modifier.delta.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>

        {/* Add to Cart Button - Fixed at bottom */}
        <div className="flex-none border-t border-gray-200 mt-auto px-6 py-4">
          <button
            onClick={async () => {
              // Create item with selected variation
              setLoading(true);
              const itemWithVariation: Item = {
                id: itemId,
                variation: selectedVariation,
                modifiers: selectedModifiers,
              };
              await onSelect(itemWithVariation);
              setLoading(false);
              onClose();
            }}
            disabled={loading || !isItemValid}
            className={`w-full h-12 text-white rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 ${
              isItemValid
                ? "opacity-100 pointer-events-auto"
                : "opacity-50 cursor-not-allowed"
            }`}
            style={{
              backgroundColor: isItemValid
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
                {isItemValid
                  ? `Done - $${ItemUtils.priceItem(
                      {
                        id: itemId,
                        variation: selectedVariation,
                        modifiers: selectedModifiers,
                      },
                      restaurant
                    ).toFixed(2)}`
                  : errorMessage}
              </span>
            )}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ItemModModal;
