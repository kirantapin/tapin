import React, { useEffect, useRef, useState } from "react";
import { PaymentPayLoad, Transaction, User } from "../../types.ts";
import { useBottomSheet } from "@/context/bottom_sheet_context.tsx";
import { submitPurchase } from "@/utils/purchase.ts";
import { useAuth } from "@/context/auth_context.tsx";
import ApplePayButton from "apple-pay-button";
import { ApplePay, GooglePay } from "@square/web-payments-sdk-types";

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
    async function initialize() {
      if (initializedRef.current) return;
      initializedRef.current = true;

      if (!window.Square) {
        console.error("Square Web Payments SDK not loaded");
        return;
      }

      const payments = window.Square.payments(
        process.env.REACT_APP_SQUARE_APPLICATION_ID!,
        payload.accountId
      );

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
        const googlePay = await payments.googlePay(paymentRequest);
        if (googlePay && googlePayRef.current) {
          await googlePay.attach(googlePayRef.current, {
            buttonType: "long", // makes the button full-width
            buttonColor: "black", // optional
            buttonSizeMode: "fill",
          });
          setGooglePay(googlePay);
        }
      } catch (e) {
        console.warn("Google Pay setup failed", e);
      }

      try {
        const applePay = await payments.applePay(paymentRequest);
        if (applePay) {
          setApplePay(applePay);
        }
      } catch (e) {
        console.warn("Apple Pay setup failed", e);
      }

      setPaymentLoaded(true);
    }

    initialize();

    return () => {
      if (googlePayRef.current) {
        googlePayRef.current.removeEventListener("click", () => {});
      }
    };
  }, []);

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
