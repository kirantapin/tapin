import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DRINK_CHECKOUT_PATH } from "@/constants";
import { Restaurant } from "@/types";

const GoToCartButton = ({
  restaurant,
  cartCount = 0,
}: {
  restaurant: Restaurant;
  cartCount: number;
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // trigger animation based on cart count
    setIsVisible(cartCount > 0);
  }, [cartCount]);

  return (
    <div>
      <div
        className={`fixed bottom-0 left-0 right-0 h-20 bg-white shadow-[0_-8px_16px_-3px_rgba(0,0,0,0.15)] transition-all duration-300 z-40
          ${isVisible ? "translate-y-0" : "translate-y-24"}`}
      />
      <button
        onClick={() =>
          navigate(DRINK_CHECKOUT_PATH.replace(":id", restaurant.id as string))
        }
        className={`fixed bottom-3 left-4 right-4 h-14 text-white rounded-2xl flex items-center justify-center gap-2
          shadow-2xl transition-all duration-300 z-50
          ${
            isVisible
              ? "translate-y-0 opacity-100 pointer-events-auto"
              : "translate-y-24 opacity-0 pointer-events-none"
          }`}
        style={{
          backgroundColor: restaurant.metadata.primaryColor as string,
        }}
      >
        <ShoppingCart className="w-5 h-5" />
        <span className="font-medium text-md flex items-center gap-2">
          View Cart
          <span
            className="bg-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center"
            style={{ color: restaurant.metadata.primaryColor as string }}
          >
            {cartCount}
          </span>
        </span>
      </button>
    </div>
  );
};

export default GoToCartButton;
