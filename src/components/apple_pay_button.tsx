import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  ExpressCheckoutElement,
} from "@stripe/react-stripe-js";
import { supabase, supabase_local } from "../utils/supabase_client";
import { useAuth } from "../context/auth_context";
import { useNavigate } from "react-router-dom";

import { Transaction, User } from "../types.ts";
import { RESTAURANT_PATH } from "../constants.ts";
import { submitPurchase } from "@/utils/purchase.ts";
import RedeemButton from "./redeem_button.tsx";
import { toast } from "react-toastify";

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = loadStripe(stripePublishableKey);

const PayButton = ({ payload, sanityCheck, clearCart }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { setTransactions, setUserData } = useAuth();
  const navigate = useNavigate();

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
    clearCart();
    navigate(RESTAURANT_PATH.replace(":id", payload.restaurant_id), {
      state: {
        transactions: transactions,
        qr: true,
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
      const potentialError = await sanityCheck();
      if (potentialError) {
        //handle response error
        toast(potentialError, {
          type: "error",
        });
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
        },
      });

      if (response.error) {
        //handle response error
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
            },
            layout: {
              type: "auto",
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

function ApplePayButton({ payload, sanityCheck, clearCart }) {
  return payload.state.token ? (
    payload.totalWithTip > 0 ? (
      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          amount: payload.totalWithTip,
          currency: "usd",
          // Customizable with appearance API.
          appearance: {
            /*...*/
          },
        }}
      >
        <PayButton
          payload={payload}
          sanityCheck={sanityCheck}
          clearCart={clearCart}
        />
      </Elements>
    ) : (
      <RedeemButton
        payload={payload}
        sanityCheck={sanityCheck}
        clearCart={clearCart}
      />
    )
  ) : (
    <div className="flex justify-center items-center py-3">
      <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
      <span className="ml-2 text-gray-600">Loading payment details...</span>
    </div>
  );
}

export default ApplePayButton;
