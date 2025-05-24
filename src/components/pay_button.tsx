import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  ExpressCheckoutElement,
} from "@stripe/react-stripe-js";
import { supabase_local } from "../utils/supabase_client.ts";
import { useAuth } from "../context/auth_context.tsx";
import { useNavigate } from "react-router-dom";

import { Transaction, User } from "../types.ts";
import { RESTAURANT_PATH, STRIPE_MIN_AMOUNT } from "../constants.ts";
import { submitPurchase } from "@/utils/purchase.ts";
import RedeemButton from "./redeem_button.tsx";
import { useBottomSheet } from "@/context/bottom_sheet_context";

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = loadStripe(stripePublishableKey);

const StripePayButton = ({
  payload,
  refresh,
  clearCart,
}: {
  payload: any;
  refresh: () => Promise<string | null>;
  clearCart: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { setTransactions, setUserData } = useAuth();
  const navigate = useNavigate();
  const { triggerToast } = useBottomSheet();
  const handleTapInResponse = async (
    transactions: Transaction[],
    modifiedUserData: User
  ) => {
    if (modifiedUserData) {
      setUserData(modifiedUserData);
    }

    setTransactions((prevTransactions) => [
      ...prevTransactions,
      ...transactions,
    ]);
    await clearCart();
    navigate(RESTAURANT_PATH.replace(":id", payload.restaurant_id), {
      state: {
        transactions: transactions,
        qr: true,
        message: { type: "success", message: "Purchase successful" },
      },
    });
  };

  const onConfirm = async () => {
    if (!stripe || !elements) {
      console.error("Stripe.js has not loaded yet.");
      return;
    }

    try {
      // Submit payment details
      const potentialError = await refresh();
      if (potentialError) {
        //handle response error
        triggerToast(potentialError, "error");
        return;
      }
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("Submit Error:", submitError.message);
        return;
      }

      const response = await supabase_local.functions.invoke("create_intent", {
        body: {
          amount: payload.totalWithTip,
          currency: "usd",
          connectedAccountId: payload.connectedAccountId, // Pass connected account ID
          cartResults: payload.state.cartResults,
        },
      });

      if (response.error) {
        triggerToast(
          "Something went wrong. Please refresh the page and try again.",
          "error"
        );
        return;
      }

      const { client_secret: clientSecret } = response.data;
      const { paymentIntent, error: confirmPaymentError } =
        await stripe.confirmPayment({
          elements,
          clientSecret,
          confirmParams: {
            return_url: "https://example.com",
          },
          redirect: "if_required",
        });

      if (confirmPaymentError) {
        console.error("Payment Confirmation Error:", confirmPaymentError);
      } else if (!paymentIntent) {
        console.error("No Payment Intent Generated");
      } else {
        const paymentData = {
          connectedAccountId: payload.connectedAccountId,
          paymentIntentId: paymentIntent.id,
          additionalOrderData: {},
        };

        payload["paymentData"] = paymentData;
        const tapInResponse = await submitPurchase(payload);
        if (tapInResponse) {
          const { transactions, modifiedUserData } = tapInResponse;
          handleTapInResponse(transactions, modifiedUserData);
        }
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
    }
  };
  return payload ? (
    <div>
      {payload && (
        <ExpressCheckoutElement
          options={{
            mode: "payment",
            amount: payload.totalWithTip,
            currency: "usd",
            // Customizable with appearance API.
            appearance: {},
            paymentMethods: {
              link: "never",
              amazonPay: "never",
              googlePay: "always",
              applePay: "always",
              klarna: "never",
            },
            layout: {
              type: "auto",
              maxColumns: 1,
              overflow: "auto",
            },
          }}
          onReady={(event) => {
            console.log("ExpressCheckoutElement is ready!");
          }}
          onConfirm={onConfirm}
          onClick={(event) => {
            event.resolve();
          }}
        />
      )}
    </div>
  ) : (
    <div>
      <p>Payment Request Button is not supported on this device.</p>
    </div>
  );
};

function PayButton({
  payload,
  refresh,
  clearCart,
}: {
  payload: any;
  refresh: () => Promise<string | null>;
  clearCart: () => void;
}) {
  if (payload.totalWithTip <= 0) {
    return (
      <RedeemButton payload={payload} refresh={refresh} clearCart={clearCart} />
    );
  }

  if (payload.totalWithTip <= STRIPE_MIN_AMOUNT) {
    return (
      <div>
        <p
          className=" text-md font-semibold text-center"
          style={{ color: "red" }}
        >
          Tap In can't process payments under $0.50. Please add another item to
          your cart. We apologize for the inconvenience.
        </p>
      </div>
    );
  }

  return (
    <Elements
      key={payload.totalWithTip}
      stripe={stripePromise}
      options={{
        mode: "payment",
        amount: payload.totalWithTip,
        currency: "usd",
        appearance: {},
      }}
    >
      <StripePayButton
        payload={payload}
        refresh={refresh}
        clearCart={clearCart}
      />
      <div className="text-sm text-gray-600 leading-[1.4] mt-6 mb-6">
        <p className="m-0">
          By completing this purchase, you confirm that you are 21 years of age
          or older and will present a valid government-issued ID upon
          redemption. All sales are final, and subject to venue rules and
          availability. By purchasing, you agree to Tapin’s{" "}
          <span className="underline">Terms & Conditions</span> and{" "}
          <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </Elements>
  );
}

export default PayButton;
