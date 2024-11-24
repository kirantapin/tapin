import React from "react";
import { useEffect, useState, useContext } from "react";
import { MyContext } from "../context/context";
import { useSupabase } from "../context/supabase_context";
import { useAuth } from "../context/auth_context";
import { useLocation, useNavigate } from "react-router-dom";
import { DrinkTemplate } from "../components/drink_template";

export const DrinkCheckout = ({}) => {
  const location = useLocation();
  const supabase = useSupabase();
  const navigate = useNavigate();
  const { is_authenticated, userSession, transaction, setTransactions } =
    useAuth();
  const [drink_template, set_drink_template] = useState(
    location.state?.drink_template
  );
  const [restaurant, setRestaurant] = useState(location.state?.restaurant);
  const { state, setState } = useContext(MyContext);
  console.log(restaurant);
  console.log(drink_template);

  const purchase_drink = async (data) => {
    //things you need customer_id,restaurant_id,item,policy_id
    const payload = {
      user_id: is_authenticated ? userSession.phone : null,
      restaurant_id: state.id,
      item: data.category,
      policy_id: null,
    };
    console.log(payload);
    try {
      const { data, error } = await supabase.functions.invoke(
        "create_transaction",
        {
          body: payload,
        }
      );
      if (error || !data)
        throw new Error("created transaction came back as null");
      //transaction is good we need to store this locally somewhere
      const { transaction_id } = data;

      if (!transaction_id) {
        throw new Error("error while creating transaction");
      } else {
        console.log(data);
        setTransactions((prevTransactions) => [...prevTransactions, data]);
        navigate(`/qrcode/${transaction_id}`, {
          state: { transaction_object: data },
        });
      }
      //set global context to store restaurant data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <DrinkTemplate initialValues={drink_template} onSubmit={purchase_drink} />
      {!is_authenticated && (
        <div>
          Sign in with phone number to access deals and receive points with
          every order
        </div>
      )}
      <button onClick={purchase_drink}>Purchase Drink</button>
    </div>
  );
};
