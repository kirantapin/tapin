import { useEffect, useParams } from "react";
import { useSupabase } from "../context/supabase_context";
import QRCode from "react-qr-code";

export const QRCodeScreen = () => {
  const supabase = useSupabase();
  const { transaction_id } = useParams();

  useEffect(() => {
    // Subscribe to updates on the transaction
    const channel = supabase
      .channel("transaction_updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "transactions",
          filter: `transaction_id=eq.${transaction_id}`,
        },
        (payload) => {
          if (payload.new.is_fulfilled === true) {
            // close_modal_complete_transaction();
            //navigate back to homescreen
          }
        }
      )
      .subscribe();

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      supabase.removeChannel(channel);
      console.log("removing channel");
    };
  }, []);

  return (
    <div>
      <div
        style={{
          height: "auto",
          margin: "0 auto",
          maxWidth: 64,
          width: "100%",
        }}
      >
        <QRCode
          size={512}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          value={"random qr code"}
          viewBox={`0 0 256 256`}
        />
        <button
          onClick={() => {
            // close_modal_incomplete_transaction(
            //   completed_drink_order.transaction_id
            // )
            //navigate back to homescreen
          }}
        >
          Redeem Later
        </button>
      </div>
    </div>
  );
};

export default QRCodeScreen;
