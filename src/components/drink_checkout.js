import React from "react";
import { useEffect, useState, useContext } from "react";
import { MyContext } from "../context/context";
import { useSupabase } from "../context/supabase_context";
import { useAuth } from "../context/auth_context";

export const DrinkCheckout = ({
  item_object,
  setQRCode,
  close_drinkcheckout,
}) => {
  const [drink_template, set_drink_template] = useState(item_object);
  const { state, setState } = useContext(MyContext);
  const supabase = useSupabase();
  const { is_authenticated, userSession } = useAuth();

  const purchase_drink = async () => {
    //things you need customer_id,restaurant_id,item,policy_id
    const payload = {
      user_id: is_authenticated ? userSession.phone : null,
      restaurant_id: state.id,
      item_id: JSON.stringify(item_object),
      policy_id: null,
    };
    try {
      const { data, error } = await supabase.functions.invoke(
        "create_transaction",
        {
          body: JSON.stringify(payload),
        }
      );
      if (error || !data)
        throw new Error("created transaction came back as null");
      //transaction is good we need to store this locally somewhere
      const { transaction_id } = data;

      if (!transaction_id) {
        throw new Error("error while creating transaction");
      } else {
        setQRCode(data);
      }
      //set global context to store restaurant data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <h2>Drink Information</h2>
      {Object.entries(drink_template).map(([key, value]) => (
        <p key={key}>
          <strong>{key}:</strong> {value}
        </p>
      ))}
      {!is_authenticated && (
        <div>
          Sign in with phone number to access deals and receive points with
          every order
        </div>
      )}
      <button onClick={purchase_drink}>Purchase Drink</button>
      <button onClick={close_drinkcheckout}>Close</button>
    </div>
  );
};
