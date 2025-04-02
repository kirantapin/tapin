import { useState } from "react";
import { motion } from "framer-motion";
import { Cart, Restaurant } from "@/types";

type TipSelectorProps = {
  setTip: (tip: number) => void;
  cart: Cart;
  restaurant: Restaurant;
};

const tipOptions = ["$4", "$5", "$6", "Other"];

export default function TipSelector({
  setTip,
  cart,
  restaurant,
}: TipSelectorProps) {
  const [selected, setSelected] = useState("$5");

  return (
    <div className="relative flex w-full bg-gray-100 rounded-full p-1">
      {/* Animated highlight */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="absolute top-1 bottom-1 bg-yellow-400 rounded-full z-0"
        style={{
          left: `${(tipOptions.indexOf(selected) / tipOptions.length) * 100}%`,
          width: `${100 / tipOptions.length}%`,
          backgroundColor: restaurant.metadata.primaryColor,
        }}
      />

      {tipOptions.map((tip) => (
        <button
          key={tip}
          onClick={() => setSelected(tip)}
          className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors 
            ${selected === tip ? "text-white" : "text-gray-600"}`}
        >
          {tip}
        </button>
      ))}
    </div>
  );
}
