import { FC, useState, useEffect } from "react";
import { Restaurant } from "@/types";
import { checkoutStyles } from "@/styles/checkout_styles";
import { formatPoints } from "@/utils/parse";
import { adjustColor } from "@/utils/color";
import { motion } from "framer-motion";
interface CheckoutSummaryProps {
  state: any;
  restaurant: Restaurant;
  tipAmount: number;
  setTipAmount: (tipAmount: number) => void;
  fees?: boolean;
}

const CheckoutSummary: FC<CheckoutSummaryProps> = ({
  restaurant,
  state,
  tipAmount,
  setTipAmount,
  fees = true,
}) => {
  const [tipPercent, setTipPercent] = useState<number>(0.2);

  const tipAmounts = [0.1, 0.15, 0.2];

  useEffect(() => {
    if (state.cart.length > 0 && restaurant) {
      const itemPrice = state.cartResults?.breakdown.itemTotal;
      setTipAmount(itemPrice * tipPercent);
    }
  }, [state, restaurant, tipPercent]);
  return (
    state.cart.length > 0 &&
    state.cartResults && (
      <div className={checkoutStyles.summaryContainer}>
        {state.cartResults.discount > 0 && (
          <div
            className="rounded-xl p-4 mb-4 border border-gray-200"
            style={{
              backgroundColor: "white",
            }}
          >
            <div
              className="flex justify-center items-center"
              style={{
                color: "black",
              }}
            >
              <span className="font-medium">
                You saved{" "}
                <span
                  className="font-bold"
                  style={{ color: restaurant?.metadata.primaryColor as string }}
                >
                  ${state.cartResults.discount.toFixed(2)}
                </span>{" "}
                at {restaurant?.name}
              </span>
            </div>
          </div>
        )}
        {state.cartResults.totalPointCost > 0 && (
          <div className={checkoutStyles.summaryRow}>
            <span>Point Cost</span>
            <span>-{formatPoints(state.cartResults.totalPointCost)}</span>
          </div>
        )}
        {state.cartResults.totalPoints > 0 && (
          <div
            className={checkoutStyles.summaryRow}
            style={{ color: "#40C4AA" }}
          >
            <span>Points Earned</span>
            <span>+{formatPoints(state.cartResults.totalPoints)}</span>
          </div>
        )}
        {state.cartResults.credit.creditUsed > 0 && (
          <div
            className={checkoutStyles.summaryRow}
            style={{ color: "#40C4AA" }}
          >
            <span>Credit Applied</span>
            <span>-${state.cartResults.credit.creditUsed.toFixed(2)}</span>
          </div>
        )}
        {state.cartResults.credit.creditToAdd > 0 && (
          <div
            className={checkoutStyles.summaryRow}
            style={{ color: "#40C4AA" }}
          >
            <span>Credit Earned</span>
            <span>+${state.cartResults.credit.creditToAdd.toFixed(2)}</span>
          </div>
        )}
        <div className={checkoutStyles.summaryRow}>
          <span>Subtotal</span>
          <span>${state.cartResults.subtotal.toFixed(2)}</span>
        </div>
        <div className={checkoutStyles.summaryRow}>
          <span>{fees ? "Fees & Tax" : "Tax"}</span>
          <span>
            $
            {(
              state.cartResults.tax + state.cartResults.customerServiceFee
            ).toFixed(2)}
          </span>
        </div>
        {tipAmount > 0 && (
          <>
            <div className={checkoutStyles.summaryRow}>
              <span>Tip</span>
              <span>${tipAmount.toFixed(2)}</span>
            </div>
            {restaurant && (
              <div className={checkoutStyles.summaryRow}>
                <div className="relative flex w-full bg-gray-100 rounded-full border border-gray-200 mt-2">
                  {/* Animated highlight */}
                  <motion.div
                    layout
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                    className="absolute inset-0 rounded-full z-0"
                    style={{
                      left: `${
                        (tipAmounts.indexOf(tipPercent) / tipAmounts.length) *
                        100
                      }%`,
                      width: `${100 / tipAmounts.length}%`,
                      backgroundColor: restaurant?.metadata
                        .primaryColor as string,
                    }}
                  />

                  {tipAmounts.map((tip) => (
                    <button
                      key={tip}
                      onClick={() => {
                        setTipPercent(tip);
                      }}
                      className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors 
                    ${tipPercent === tip ? "text-white" : "text-gray-600"}`}
                    >
                      {tip * 100}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        <div className={checkoutStyles.summaryTotal} style={{ marginTop: 20 }}>
          <span className="font-bold">Total</span>
          <span className="font-bold">
            ${(state.cartResults.totalPrice + tipAmount).toFixed(2)}
          </span>
        </div>
      </div>
    )
  );
};

export default CheckoutSummary;
