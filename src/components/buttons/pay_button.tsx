import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  ExpressCheckoutElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { supabase_local } from "../../utils/supabase_client.ts";
import { useAuth } from "../../context/auth_context.tsx";

import {
  FulfillmentInfo,
  PaymentPayLoad,
  Transaction,
  User,
} from "../../types.ts";
import { MIN_PAYMENT_AMOUNT } from "../../constants.ts";
import { submitPurchase } from "@/utils/purchase.ts";
import RedeemButton from "@/components/buttons/redeem_button.tsx";
import { useBottomSheet } from "@/context/bottom_sheet_context";
import { SquarePayButton } from "./square_button.tsx";
import { PurchaseTermsCard } from "../cards/purchase_terms_card.tsx";
import ProcessingOrderModal from "@/components/bottom_sheets/processing_order_modal.tsx";
import { FulfillmentToggle } from "./fulfillment_toggle.tsx";
import { useOrderDetails } from "@/context/order_details_context";

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = loadStripe(stripePublishableKey);

const StripePayButton = ({
  payload,
  refresh,
  postPurchase,
  openProcessingOrderModal,
  closeProcessingOrderModal,
}: {
  payload: PaymentPayLoad;
  refresh: () => Promise<string | null>;
  postPurchase: (transactions: Transaction[]) => Promise<void>;
  openProcessingOrderModal: () => void;
  closeProcessingOrderModal: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { setTransactions, setUserData } = useAuth();
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
    closeProcessingOrderModal();
    await postPurchase(transactions);
  };

  const onConfirm = async () => {
    if (!stripe || !elements) {
      console.error("Stripe.js has not loaded yet.");
      return;
    }

    try {
      const potentialError = await refresh();
      if (potentialError) {
        triggerToast(potentialError, "error");
        return;
      }
      const { error: submitError } = await elements.submit();
      if (submitError) {
        console.error("Submit Error:", submitError.message);
        triggerToast(
          "Something went wrong. Please refresh the page and try again.",
          "error"
        );
        return;
      }

      const response = await supabase_local.functions.invoke("create_intent", {
        body: {
          amount: payload.totalWithTip,
          currency: "usd",
          accountId: payload.accountId,
          cartResults: payload.state.cartResults,
        },
      });

      if (response.error) {
        console.log("response.error", response.error);
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
        triggerToast(
          "Something went wrong. Please refresh the page and try again.",
          "error"
        );
        console.error("Payment Confirmation Error:", confirmPaymentError);
      } else if (!paymentIntent) {
        triggerToast(
          "Something went wrong. Please refresh the page and try again.",
          "error"
        );
        console.error("No Payment Intent Generated");
      } else {
        openProcessingOrderModal();
        const paymentData = {
          accountId: payload.accountId,
          paymentIntentId: paymentIntent.id,
          additionalOrderData: {},
        };

        payload["paymentData"] = paymentData;
        try {
          const tapInResponse = await submitPurchase(payload);
          if (tapInResponse) {
            const { transactions, modifiedUserData } = tapInResponse;
            await handleTapInResponse(transactions, modifiedUserData);
          } else {
            triggerToast(
              "Something went wrong. Please refresh the page and try again.",
              "error"
            );
          }
        } finally {
          closeProcessingOrderModal();
        }
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      triggerToast(
        "Something went wrong. Please refresh the page and try again.",
        "error"
      );
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
          onReady={(event) => {}}
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
  postPurchase,
  paymentProvider,
}: {
  payload: PaymentPayLoad;
  refresh: () => Promise<string | null>;
  postPurchase: (transactions: Transaction[]) => Promise<void>;
  paymentProvider: "stripe" | "square";
}) {
  const [showProcessingOrderModal, setShowProcessingOrderModal] =
    useState(false);
  const [isImmediateFulfillment, setIsImmediateFulfillment] =
    useState<boolean>(false);
  const { userDisplayName, serviceType } = useOrderDetails();
  const fulfillmentInfo: FulfillmentInfo = {
    user_display_name: userDisplayName || undefined,
    service_type: serviceType || undefined,
  };

  const openProcessingOrderModal = () => {
    setShowProcessingOrderModal(true);
  };

  const closeProcessingOrderModal = () => {
    setShowProcessingOrderModal(false);
  };
  if (payload.totalWithTip <= 0) {
    return (
      <div>
        <FulfillmentToggle
          cart={payload.state.cart}
          isImmediateFulfillment={isImmediateFulfillment}
          onToggle={setIsImmediateFulfillment}
        />
        <RedeemButton
          payload={{
            ...payload,
            immediateFulfillment: isImmediateFulfillment,
            fulfillmentInfo: fulfillmentInfo,
          }}
          refresh={refresh}
          postPurchase={postPurchase}
          openProcessingOrderModal={openProcessingOrderModal}
          closeProcessingOrderModal={closeProcessingOrderModal}
        />
        <div className="text-sm text-gray-600 leading-[1.4] mt-6 mb-6">
          <PurchaseTermsCard />
        </div>
        <ProcessingOrderModal
          isOpen={showProcessingOrderModal}
          onClose={closeProcessingOrderModal}
        />
      </div>
    );
  }

  if (payload.totalWithTip <= MIN_PAYMENT_AMOUNT) {
    return (
      <div className="border border-gray-300 rounded-xl p-4 bg-white w-full max-w-lg mx-auto mt-4">
        <p
          className="text-md font-semibold text-center text-black"
          style={{ borderColor: "#d1d5db" }}
        >
          <span className="text-gray-800 ">
            Tap In cannot process payments less than $
            {(MIN_PAYMENT_AMOUNT / 100).toFixed(2)}. Please add another item to
            your cart. We apologize for the inconvenience.
          </span>
        </p>
      </div>
    );
  }

  if (paymentProvider === "stripe") {
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
        <FulfillmentToggle
          cart={payload.state.cart}
          isImmediateFulfillment={isImmediateFulfillment}
          onToggle={setIsImmediateFulfillment}
        />
        <StripePayButton
          payload={{
            ...payload,
            immediateFulfillment: isImmediateFulfillment,
            fulfillmentInfo: fulfillmentInfo,
          }}
          refresh={refresh}
          postPurchase={postPurchase}
          openProcessingOrderModal={openProcessingOrderModal}
          closeProcessingOrderModal={closeProcessingOrderModal}
        />
        <div className="text-sm text-gray-600 leading-[1.4] mt-6 mb-6">
          <PurchaseTermsCard />
        </div>
        <ProcessingOrderModal
          isOpen={showProcessingOrderModal}
          onClose={closeProcessingOrderModal}
        />
      </Elements>
    );
  }

  if (paymentProvider === "square") {
    return (
      <div>
        <FulfillmentToggle
          cart={payload.state.cart}
          isImmediateFulfillment={isImmediateFulfillment}
          onToggle={setIsImmediateFulfillment}
        />
        <SquarePayButton
          key={payload.totalWithTip}
          payload={{
            ...payload,
            immediateFulfillment: isImmediateFulfillment,
            fulfillmentInfo: fulfillmentInfo,
          }}
          refresh={refresh}
          postPurchase={postPurchase}
          openProcessingOrderModal={openProcessingOrderModal}
          closeProcessingOrderModal={closeProcessingOrderModal}
        />
        <div className="text-sm text-gray-600 leading-[1.4] mt-6 mb-6">
          <PurchaseTermsCard />
        </div>
        <ProcessingOrderModal
          isOpen={showProcessingOrderModal}
          onClose={closeProcessingOrderModal}
        />
      </div>
    );
  }
}

export default PayButton;
