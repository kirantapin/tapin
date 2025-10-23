import { FC, useState, useEffect } from "react";
import { Restaurant } from "@/types";
import { checkoutStyles } from "@/styles/checkout_styles";
import { formatPoints } from "@/utils/parse";
import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { Alert } from "../display_utils/alert";
interface CheckoutSummaryProps {
  state: any;
  restaurant: Restaurant;
  tipAmount: number;
  setTipAmount: (tipAmount: number) => void;
  showTipSelection: boolean;
  showDiscount: boolean;
}

const CheckoutSummary: FC<CheckoutSummaryProps> = ({
  restaurant,
  state,
  tipAmount,
  setTipAmount,
  showTipSelection,
  showDiscount,
}) => {
  const tipAmounts =
    restaurant.metadata.tip?.enabled &&
    restaurant.metadata.tip?.minimumPercentage
      ? [
          Math.round(restaurant.metadata.tip.minimumPercentage) / 100,
          Math.round(restaurant.metadata.tip.minimumPercentage) / 100 + 0.05,
          Math.round(restaurant.metadata.tip.minimumPercentage) / 100 + 0.1,
        ]
      : [0, 0.1, 0.15, 0.2];
  const [tipPercent, setTipPercent] = useState<number>(
    tipAmounts[tipAmounts.length - 1]
  );
  const [tippableSubtotal, setTippableSubtotal] = useState<number>(0);

  useEffect(() => {
    if (state.cart.length > 0 && restaurant) {
      const itemPrice = state.cartResults?.breakdown.itemTotal;
      setTipAmount(Math.round(itemPrice * tipPercent * 100) / 100);
      setTippableSubtotal(itemPrice);
    }
  }, [state, restaurant, tipPercent]);

  const fees = (state?.cartResults?.customerServiceFee || 0) > 0;

  return (
    state.cart.length > 0 &&
    state.cartResults && (
      <div className={checkoutStyles.summaryContainer}>
        {showDiscount && state.cartResults.discount > 0 && (
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
                  style={{ color: restaurant?.metadata.primaryColor }}
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
          <div className="flex items-center gap-3">
            <span>{fees ? "Fees & Tax" : "Tax"}</span>
            {fees && (
              <Alert
                trigger={<Info className="w-4 h-4 text-gray-500" />}
                title="Why is there a service fee?"
                description="This small service fee helps us keep Tap In running — powering exclusive deals, loyalty rewards, and a seamless experience for you. You’re always welcome to purchase items directly at the venue, but Tap In-exclusive discounts and rewards won’t apply."
                onConfirm={() => {}}
                confirmLabel="Got it"
                cancelLabel={null}
                middleComponent={
                  <div className="flex flex-col gap-2">
                    <div
                      className={
                        checkoutStyles.summaryRow + " text-black text-md"
                      }
                    >
                      <span className="">Tap In Fee</span>
                      <span>
                        ${state.cartResults.customerServiceFee.toFixed(2)}
                      </span>
                    </div>
                    <div
                      className={
                        checkoutStyles.summaryRow + " text-black text-md"
                      }
                    >
                      <span className="">Tax</span>
                      <span>${state.cartResults.tax.toFixed(2)}</span>
                    </div>
                  </div>
                }
              />
            )}
          </div>
          <span>
            $
            {(
              state.cartResults.tax + state.cartResults.customerServiceFee
            ).toFixed(2)}
          </span>
        </div>
        {showTipSelection && tippableSubtotal > 0 && (
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
                      backgroundColor: restaurant?.metadata.primaryColor,
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
                      $
                      {tip * tippableSubtotal > 0
                        ? Math.round(tip * tippableSubtotal * 100) / 100
                        : "0"}
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
