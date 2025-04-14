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
import { QR_CODE_PATH, RESTAURANT_PATH } from "../constants.ts";
import { submitPurchase } from "@/utils/purchase.ts";
import RedeemButton from "./redeem_button.tsx";

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = loadStripe(stripePublishableKey);

const PayButton = ({ payload, sanityCheck }) => {
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
    if (!transactions || transactions?.length == 0) {
      throw new Error("No transactions received or created");
    } else {
      setTransactions((prevTransactions) => [
        ...prevTransactions,
        ...transactions,
      ]);

      navigate(RESTAURANT_PATH.replace(":id", payload.restaurant_id), {
        state: {
          transactions: transactions,
        },
      });
    }
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

function ApplePayButton({ payload, sanityCheck }) {
  console.log(payload);
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
        <PayButton payload={payload} sanityCheck={sanityCheck} />
      </Elements>
    ) : (
      <RedeemButton payload={payload} sanityCheck={sanityCheck} />
    )
  ) : (
    <p>Loading</p>
  );
}

export default ApplePayButton;
