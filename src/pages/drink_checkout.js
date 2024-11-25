import React from "react";
import { useEffect, useState, useContext } from "react";
import { MyContext } from "../context/context";
import { useSupabase } from "../context/supabase_context";
import { useAuth } from "../context/auth_context";
import { useLocation, useNavigate } from "react-router-dom";
import { DrinkTemplate } from "../components/drink_template";
import SearchBar from "../components/rotating_searchbar";

export const DrinkCheckout = ({}) => {
  const location = useLocation();
  const supabase = useSupabase();
  const navigate = useNavigate();

  const { is_authenticated, userSession, transaction, setTransactions } =
    useAuth();
  const [cart_items, set_cart_items] = useState(location.state?.cart_items);
  const [restaurant, setRestaurant] = useState(location.state?.restaurant);
  const menu = location.state?.restaurant.menu;
  const { state, setState } = useContext(MyContext);
  console.log(cart_items);

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

  const add_to_cart_items = (order_response) => {
    set_cart_items((prevItems) => [...prevItems, ...order_response]);
  };

  const test = () => {
    console.log(cart_items);
  };

  return (
    <div>
      {/* <DrinkTemplate initialValues={drink_template} onSubmit={purchase_drink} /> */}
      <ul>
        {cart_items.map((item, index) => (
          <li key={index}>
            {item.name}
            <br />
            {item.liquor}
            <br />
            Quantity {item.quantity}
            <br />
            Price {item.price}
            <br />
          </li>
        ))}
      </ul>
      <SearchBar action={add_to_cart_items} menu={menu} />

      {!is_authenticated && (
        <div>
          Sign in with phone number to access deals and receive points with
          every order
        </div>
      )}
      <button onClick={test}>Test</button>
      <button onClick={purchase_drink}>Purchase Drink</button>
    </div>
  );
};
