import { useState, useEffect, useRef } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DRINK_CHECKOUT_PATH } from "@/constants";
import { Restaurant } from "@/types";
import { adjustColor } from "@/utils/color";

const GoToCartButton = ({
  restaurant,
  cartCount = 0,
}: {
  restaurant: Restaurant;
  cartCount: number;
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const lastCartCount = useRef(cartCount);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        // Only hide when scrolling down AND cart is not empty
        if (cartCount > 0) {
          setIsVisible(false);
        }
      } else {
        // Show when scrolling up AND cart is not empty
        if (cartCount > 0) {
          setIsVisible(true);
        }
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [cartCount]);

  // Handle cart count changes
  useEffect(() => {
    // Show button when items are added to cart
    if (cartCount > 0) {
      setIsVisible(true);
    } else {
      // Hide button when cart is empty
      setIsVisible(false);
    }

    lastCartCount.current = cartCount;
  }, [cartCount]);

  if (cartCount === 0) return null;

  return (
    <button
      onClick={() => {
        navigate(DRINK_CHECKOUT_PATH.replace(":id", restaurant.id as string));
      }}
      className={`fixed bottom-4 left-4 right-4 h-12 text-white rounded-full flex items-center justify-center gap-2
          shadow-2xl transition-all duration-300 z-50 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-20 opacity-0 pointer-events-none"
          }`}
      style={{
        backgroundColor: restaurant.metadata.primaryColor,
      }}
    >
      <ShoppingCart className="w-5 h-5" />
      <span className="font-medium text-md flex items-center gap-2">
        View Cart
        <span
          className="bg-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center"
          style={{ color: restaurant.metadata.primaryColor }}
        >
          {cartCount}
        </span>
      </span>
    </button>
  );
};

export default GoToCartButton;
