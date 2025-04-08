import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Cart, CartResultsPayload, Restaurant } from "@/types";

type TipSelectorProps = {
  setTip: (tip: number) => void;
  cartResults: CartResultsPayload;
  restaurant: Restaurant;
  tipAmounts: number[];
};

export default function TipSelector({
  setTip,
  cartResults,
  restaurant,
  tipAmounts = [0.1, 0.15, 0.2],
}: TipSelectorProps) {
  const [selected, setSelected] = useState(
    `${(tipAmounts[1] * cartResults.totalPrice).toFixed(2)}`
  );

  const tipOptions = [
    `${(tipAmounts[0] * cartResults.totalPrice).toFixed(2)}`,
    `${(tipAmounts[1] * cartResults.totalPrice).toFixed(2)}`,
    `${(tipAmounts[2] * cartResults.totalPrice).toFixed(2)}`,
    "Other",
  ];

  const _ = useMemo(() => {
    setTip(tipAmounts[tipOptions.indexOf(selected)]);
  }, [selected, tipOptions, tipAmounts]);

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
          onClick={() => {
            setSelected(tip);
          }}
          className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors 
            ${selected === tip ? "text-white" : "text-gray-600"}`}
        >
          {tip}
        </button>
      ))}
    </div>
  );
}
