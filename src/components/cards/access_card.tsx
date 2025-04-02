import { Cart } from "@/types";
import { isEqual } from "lodash";
import { Minus, Plus, Trash2 } from "lucide-react";
import { titleCase } from "title-case";

interface CardProps {
  cart: Cart;
  primaryColor: string;
  venueName: string;
  title: string;
  regularPrice: number;
  date: string;
  itemPath: string[];
  addToCart;
  removeFromCart;
}

function generateGradientColors(baseColor: string) {
  // Convert hex to RGB
  const r = Number.parseInt(baseColor.slice(1, 3), 16);
  const g = Number.parseInt(baseColor.slice(3, 5), 16);
  const b = Number.parseInt(baseColor.slice(5, 7), 16);

  // Create darker shade for 'from' color (20% darker)
  const darkerShade = `rgb(${r * 0.8}, ${g * 0.8}, ${b * 0.8})`;

  // Create even darker shade for 'to' color (40% darker)
  const darkestShade = `rgb(${r * 0.6}, ${g * 0.6}, ${b * 0.6})`;

  // Create lighter shade for overlay (30% lighter with transparency)
  const lighterShade = `rgba(${Math.min(r * 1.3, 255)}, ${Math.min(
    g * 1.3,
    255
  )}, ${Math.min(b * 1.3, 255)}, 0.2)`;

  return {
    from: darkerShade,
    via: baseColor,
    to: darkestShade,
    overlay: lighterShade,
  };
}

export default function Card({
  cart,
  primaryColor,
  venueName,
  title,
  regularPrice,
  date,
  itemPath,
  addToCart,
  removeFromCart,
}: CardProps) {
  const colors = generateGradientColors(primaryColor);
  const cartItem = cart.find((item) => isEqual(item.item.path, itemPath));
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="w-full aspect-[9/5] rounded-3xl p-3 sm:p-4 relative overflow-hidden text-white my-4">
      <div
        style={{
          background: `linear-gradient(to bottom right, ${colors.from}, ${colors.via}, ${colors.to})`,
        }}
        className="absolute inset-0"
      />

      {/* Circular gradient overlay */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full transform translate-x-20 -translate-y-20"
        style={{
          background: `linear-gradient(to bottom right, ${colors.overlay}, transparent)`,
        }}
      />

      {/* Date in top right corner */}
      <div className="absolute top-3 sm:top-4 right-4 sm:right-6 text-sm text-white/150 font-[Gilroy]">
        {date}
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col pb-20">
        {" "}
        {/* pb-20 ensures space for bottom content */}
        <div className="space-y-1 sm:space-y-2">
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm text-white/80">{venueName}</p>
            <h2 className="text-2xl sm:text-2xl font-semibold">
              {titleCase(title)}
            </h2>
          </div>
        </div>
      </div>

      {/* Bottom pinned price + buttons */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20">
        <div>
          <p className="text-base sm:text-sm text-white">
            Price:{" "}
            <span className="font-normal">${regularPrice.toFixed(2)}</span>
          </p>
        </div>

        {quantity > 0 ? (
          <div className="flex items-center bg-white rounded-full px-1 py-1">
            <button
              onClick={() =>
                removeFromCart(cartItem?.id, { quantity: quantity - 1 })
              }
              className="w-6 h-6 flex items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              {quantity > 1 ? (
                <Minus className="w-4 h-4 text-white" />
              ) : (
                <Trash2 className="w-4 h-4 text-white" />
              )}
            </button>
            <span className="mx-3 text-sm font-semibold text-gray-800">
              {quantity}
            </span>
            <button
              onClick={() => addToCart({ path: itemPath, modifiers: [] })}
              className="w-6 h-6 flex items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <button
            className="h-6 w-6 rounded-full flex items-center justify-center text-black"
            style={{ backgroundColor: "white" }}
            onClick={() => {
              addToCart({ path: itemPath, modifiers: [] });
            }}
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
