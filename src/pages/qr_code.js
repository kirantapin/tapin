import { useEffect, useState } from "react";
import { useSupabase } from "../context/supabase_context";
import { useAuth } from "../context/auth_context";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import QRCode from "react-qr-code";

export const QRCodeScreen = () => {
  const supabase = useSupabase();
  const { transaction_id } = useParams();
  const { transactions, setTransactions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drink_template, set_drink_template] = useState(
    location.state?.transaction_object
  );
  console.log("state", location.state);

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
            setTransactions((prevTransactions) =>
              prevTransactions.map((transaction) =>
                transaction.transaction_id === transaction_id
                  ? { ...transaction, is_fulfilled: true }
                  : transaction
              )
            );
            navigate("/");
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
          value={transaction_id}
          viewBox={`0 0 256 256`}
        />
        <button
          onClick={() => {
            navigate("/");
          }}
        >
          Redeem Later
        </button>
        <button
          onClick={() => {
            console.log(transactions);
          }}
        >
          TEst
        </button>
      </div>
    </div>
  );
};

export default QRCodeScreen;
