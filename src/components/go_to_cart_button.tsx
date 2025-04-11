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
  const [isVisible, setIsVisible] = useState(true);
  const oldCount = useRef(-1);

  useEffect(() => {
    let lastScrollY = window.scrollY; // Store last scroll position inside useEffect

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY) {
        // Scrolling Down
        setIsVisible(false);
      } else {
        // Scrolling Up
        setIsVisible(true);
      }

      lastScrollY = currentScrollY; // Update last scroll position
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (cartCount !== oldCount.current) {
      oldCount.current = cartCount;
      setIsVisible(true);
    }
  }, [cartCount]);

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
      {/* Shopping Cart Icon with Adjusted Position */}
      <div className="relative">
        <ShoppingCart className="w-6 h-6 translate-x-[-2px] translate-y-[2px]" />

        {/* Cart Count Badge */}
        {cartCount > 0 && (
          <span
            className="absolute -top-2 -right-3 bg-white text-red-500 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md"
            style={{ color: restaurant.metadata.primaryColor }}
          >
            {cartCount}
          </span>
        )}
      </div>
    </button>
  );
};

export default GoToCartButton;
