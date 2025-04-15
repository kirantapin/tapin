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
      className={`fixed bottom-4 right-4 w-16 h-16 text-white rounded-full flex items-center justify-center 
          shadow-xl hover:shadow-2xl hover:bg-gray-800 transition-all duration-300 z-50 ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-20 opacity-0 pointer-events-none"
          }`}
      style={{
        background: restaurant.metadata.primaryColor
          ? `linear-gradient(135deg, 
        ${adjustColor(restaurant.metadata.primaryColor as string, -40)},
        ${adjustColor(restaurant.metadata.primaryColor as string, 40)}
      )`
          : undefined,
      }}
    >
      <div className="relative">
        <ShoppingCart className="w-6 h-6 translate-x-[-2px] translate-y-[2px]" />
        <span
          className="absolute -top-2 -right-3 bg-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md"
          style={{ color: restaurant.metadata.primaryColor }}
        >
          {cartCount}
        </span>
      </div>
    </button>
  );
};

export default GoToCartButton;
