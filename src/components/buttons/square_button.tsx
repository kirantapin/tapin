import React, { useEffect, useRef, useState } from "react";
import { PaymentPayLoad, Transaction, User } from "../../types.ts";
import { useBottomSheet } from "@/context/bottom_sheet_context.tsx";
import { submitPurchase } from "@/utils/purchase.ts";
import { useAuth } from "@/context/auth_context.tsx";
import ApplePayButton from "apple-pay-button";
import { ApplePay, GooglePay } from "@square/web-payments-sdk-types";
import { SQUARE_APP_ID } from "@/constants.ts";

export const SquarePayButton = ({
  refresh,
  payload,
  postPurchase,
}: {
  refresh: () => Promise<string | null>;
  payload: PaymentPayLoad;
  postPurchase: (transactions: Transaction[]) => Promise<void>;
}) => {
  //apple does not need a ref
  const googlePayRef = useRef<HTMLDivElement>(null);
  const [paymentLoaded, setPaymentLoaded] = useState(false);
  const initializedRef = useRef(false);
  const { triggerToast } = useBottomSheet();
  const { setTransactions, setUserData } = useAuth();
  const [applePay, setApplePay] = useState<ApplePay | null>(null);
  const [googlePay, setGooglePay] = useState<GooglePay | null>(null);

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
      await postPurchase(transactions);
    }
  };
  useEffect(() => {
    const initialize = async () => {
      if (initializedRef.current) return;
      if (!window.Square) return; // guard

      initializedRef.current = true;

      // IMPORTANT: second arg must be a Square **Location ID** for this env
      const payments = window.Square.payments(SQUARE_APP_ID, payload.accountId);

      const paymentRequest = payments.paymentRequest({
        countryCode: "US",
        currencyCode: "USD",
        total: {
          amount: (payload.totalWithTip / 100).toFixed(2),
          label: "Tap In Total",
        },
        requestBillingContact: false,
        requestShippingContact: false,
      });

      try {
        const google = await payments.googlePay(paymentRequest);
        if (google && googlePayRef.current) {
          await google.attach(googlePayRef.current, {
            buttonType: "long",
            buttonColor: "black",
            buttonSizeMode: "fill",
          });
          setGooglePay(google);
        }
      } catch (e) {
        console.warn("Google Pay setup failed", e);
      }

      try {
        const apple = await payments.applePay(paymentRequest);
        if (apple) setApplePay(apple);
      } catch (e) {
        console.warn("Apple Pay setup failed", e);
      }

      setPaymentLoaded(true);
    };

    if (window.Square) {
      // SDK already loaded (e.g., fast cache)
      initialize();
    } else {
      // Wait for the loader to finish
      const onReady = () => initialize();
      window.addEventListener("square-sdk-ready", onReady, { once: true });
      return () => window.removeEventListener("square-sdk-ready", onReady);
    }
  }, [SQUARE_APP_ID, payload.accountId]);

  const handlePayClick = async (method: "apple" | "google") => {
    const paymentMethod = method === "apple" ? applePay : googlePay;
    if (!paymentMethod) {
      triggerToast(
        "Something went wrong. Please refresh the page and try again.",
        "error"
      );
      return;
    }
    const result = await paymentMethod.tokenize();
    if (result.status === "OK") {
      const error = await refresh();
      if (error) return triggerToast(error, "error");

      const token = result.token;
      const paymentData = {
        accountId: payload.accountId,
        token,
        additionalOrderData: {},
      };
      payload["paymentData"] = paymentData;

      const response = await submitPurchase(payload);
      if (response) {
        const { transactions, modifiedUserData } = response;
        handleTapInResponse(transactions, modifiedUserData);
      } else {
        triggerToast("Something went wrong. Please try again.", "error");
      }
    } else {
      console.error("Apple Pay failed", result);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0px",
        width: "100%",
      }}
    >
      <div style={{ animation: applePay ? "fadeIn 1s ease-in" : "none" }}>
        <ApplePayButton
          buttonStyle="black"
          type="plain"
          locale="en-US"
          style={{
            width: "100%",
            height: "44px",
            borderRadius: "4px",
            padding: "0px",
          }}
          onClick={() => handlePayClick("apple")}
        />
      </div>

      <div
        ref={googlePayRef}
        style={{ width: "100%", height: "44px" }}
        onClick={() => handlePayClick("google")}
      />
    </div>
  );
};
