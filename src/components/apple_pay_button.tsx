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
import { QR_CODE_PATH } from "../constants.ts";

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = loadStripe(stripePublishableKey);

const PayButton = ({ payload, sanityCheck }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { setTransactions, setUserData } = useAuth();
  const navigate = useNavigate();

  const purchase_drink = async (payload) => {
    try {
      const { data, error } = await supabase_local.functions.invoke(
        "submit_order",
        {
          body: {
            user_id: payload.user_id,
            restaurant_id: payload.restaurant_id,
            totalWithTip: payload.totalWithTip,
            connectedAccountId: payload.connectedAccountId,
            cart: payload.state.cart,
            userDealEffect: payload.state.dealEffect,
            userPolicy: payload.state.selectedPolicy,
            userCartResults: payload.state.cartResults,
            token: payload.state.token,
          },
        }
      );
      if (error || !data) return null;
      const { transactions, modifiedUserData } = data;
      return { transactions, modifiedUserData };
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  };

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

      navigate(QR_CODE_PATH.replace(":id", payload.restaurant_id), {
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
          connectedAccountId: payload.connectedAccountId, // Connected account ID
          paymentIntentId: paymentIntent.id,
          additionalOrderData: {},
        };

        payload["paymentData"] = paymentData;
        const tapInResponse = await purchase_drink(payload);
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
  return payload.state.token ? (
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
    <p>Loading</p>
  );
}

export default ApplePayButton;
