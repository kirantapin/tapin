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
  openProcessingOrderModal,
  closeProcessingOrderModal,
}: {
  refresh: () => Promise<string | null>;
  payload: PaymentPayLoad;
  postPurchase: (transactions: Transaction[]) => Promise<void>;
  openProcessingOrderModal: () => void;
  closeProcessingOrderModal: () => void;
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
      closeModalIfOpen();
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

  const processingRef = useRef(false);
  const isModalOpenRef = useRef(false);

  const openModalOnce = () => {
    if (!isModalOpenRef.current) {
      openProcessingOrderModal();
      isModalOpenRef.current = true;
    }
  };
  const closeModalIfOpen = () => {
    if (isModalOpenRef.current) {
      closeProcessingOrderModal();
      isModalOpenRef.current = false;
    }
  };

  const handlePayClick = async (method: "apple" | "google") => {
    if (processingRef.current) return;
    processingRef.current = true;

    const paymentMethod = method === "apple" ? applePay : googlePay;
    if (!paymentMethod) {
      triggerToast(
        "Something went wrong. Please refresh the page and try again.",
        "error"
      );
      processingRef.current = false;
      return;
    }

    let timer: number | undefined;

    try {
      // start tokenization (wallet sheet will appear)
      const tokenizationPromise = paymentMethod.tokenize();

      // ✅ delay opening to avoid pre-wallet flash
      timer = window.setTimeout(() => {
        openModalOnce(); // open if wallet still up / not finished
      }, 1200);

      const result = await tokenizationPromise;

      // ✅ wallet sheet closed now; ensure modal is up
      if (timer) clearTimeout(timer);
      openModalOnce();

      if (result.status !== "OK") {
        throw new Error("Payment was cancelled or failed.");
      }

      const err = await refresh();
      if (err) {
        throw new Error("Error verifying your cart: " + err);
      }

      payload.paymentData = {
        accountId: payload.accountId,
        token: result.token,
        additionalOrderData: {},
      };

      const resp = await submitPurchase(payload);
      if (!resp) {
        throw new Error(
          "Something went wrong submitting purchase. Please try again."
        );
      }

      const { transactions, modifiedUserData } = resp;
      await handleTapInResponse(transactions, modifiedUserData);
    } catch (e) {
      console.error(e);
      triggerToast(
        (e as Error).message || "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      if (timer) clearTimeout(timer);
      closeModalIfOpen(); // ✅ always close
      processingRef.current = false;
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
