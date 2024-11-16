import React from "react";
import { useEffect, useState, useContext } from "react";
import SearchBar from "../components/rotating_searchbar";
import { useSupabase } from "../context/supabase_context";
import { DrinkCheckout } from "../components/drink_checkout";
import { QRCodeScreen } from "../pages/qr_code";
import { useAuth } from "../context/auth_context";
import { string_to_object_drink } from "../utils/drink_template_parser";

const Restaurant = ({ restaurant }) => {
  // Extract restaurantId from URL parameters
  const { is_authenticated, userSession, userData } = useAuth();
  const supabase = useSupabase();

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [qrCode, setQRCode] = useState(null);
  const [recent_drinks, set_recent_drinks] = useState(
    userData?.recent_drinks || []
  );
  const [prepurchased_transactions, set_prepurchased_transactions] = useState(
    userData?.prepurchased_transactions[restaurant.id] || []
  );

  const menu = restaurant.menu;

  //setup listeners
  useEffect(() => {
    // Set up the Supabase Realtime listener
    if (!is_authenticated) {
      return;
    }
    console.log("authenticated", is_authenticated);
    const channel = supabase
      .channel("user-data-listener")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${userSession?.phone}`,
        },
        (payload) => {
          // Check if the 'recent_drinks' column changed
          if (payload.new.recent_drinks !== payload.old.recent_drinks) {
            set_recent_drinks(payload.new.recent_drinks);
          }

          // Check if 'prepurchased_transactions' for the specific restaurant ID changed
          const oldTransactions =
            payload.old.prepurchased_transactions?.[restaurant.id] || [];
          const newTransactions =
            payload.new.prepurchased_transactions?.[restaurant.id] || [];

          if (
            JSON.stringify(oldTransactions) !== JSON.stringify(newTransactions)
          ) {
            console.log(
              `Prepurchased transactions changed for restaurant`,
              newTransactions
            );
            set_prepurchased_transactions(newTransactions);
          }
        }
      )
      .subscribe();

    // Clean up the subscription when the component unmounts
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const open_modal_drink_template = (drink_temlate) => {
    setSelectedItem(drink_temlate);
    setModalOpen(true);
  };

  const open_modal_qr_code = () => {};

  const default_close_modal = () => {
    setModalOpen(false);
    setQRCode(null);
    setSelectedItem(null);
  };

  const close_modal_from_drink_template = () => {
    //close modal before user has even purchased drink
    default_close_modal();
  };

  const close_modal_incomplete_transaction = async (transaction_id) => {
    //logic to add transaction to user prepurchased and recent drinks
    await append_recent_drinks(selectedItem);
    await append_prepurchased_transaction(transaction_id);
    default_close_modal();
  };

  const close_modal_complete_transaction = async () => {
    //logic to add recent drinks
    await append_recent_drinks(selectedItem);
    default_close_modal();
  };

  const append_prepurchased_transaction = async (transaction_id) => {
    const user_id = is_authenticated ? userSession?.phone : null;
    const restaurant_id = restaurant.id;
    try {
      const { data, error } = await supabase.functions.invoke(
        "append_to_prepurchased",
        {
          body: JSON.stringify({
            restaurant_id: restaurant_id,
            user_id: user_id,
            transaction_id: transaction_id,
          }),
        }
      );
      if (error) throw error;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const append_recent_drinks = async (drink_order) => {
    const user_id = is_authenticated ? userSession?.phone : null;
    try {
      const { data, error } = await supabase.functions.invoke(
        "append_to_recent_drinks",
        {
          body: JSON.stringify({
            drink_order: JSON.stringify(drink_order),
            user_id: user_id,
          }),
        }
      );
      if (error) throw error;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const submit_drink_order = async (drink_order) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "submit_drink_query",
        {
          body: JSON.stringify({ drink_order: drink_order, menu: menu }),
        }
      );
      if (error) throw error;
      const { response } = data;
      open_modal_drink_template(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const TEST = () => {
    console.log(userData);
  };

  return (
    <div>
      <button
        onClick={() => {
          console.log("changing restaurant");
        }}
      >
        Change Restaurant
      </button>
      <h1>{restaurant.name}</h1>
      <div>
        <SearchBar onSearch={submit_drink_order} />
      </div>
      <h1>Your Favorite Drinks:</h1>
      <div>
        <ul>
          {recent_drinks.map((drink, index) => (
            <li
              key={index}
              onClick={() =>
                open_modal_drink_template(string_to_object_drink(drink))
              }
              style={{ cursor: "pointer", color: "blue" }}
            >
              {string_to_object_drink(drink).name}
            </li>
          ))}
        </ul>
      </div>
      <h1>Drinks at {restaurant.name} you haven't redeemed yet: </h1>
      <div>
        <ul>
          {prepurchased_transactions.map((transaction, index) => (
            <li key={index}>{transaction}</li>
          ))}
        </ul>
      </div>

      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            {qrCode ? (
              <QRCodeScreen
                completed_drink_order={qrCode}
                close_modal_complete_transaction={
                  close_modal_complete_transaction
                }
                close_modal_incomplete_transaction={
                  close_modal_incomplete_transaction
                }
              />
            ) : (
              <DrinkCheckout
                close_drinkcheckout={close_modal_from_drink_template}
                item_object={selectedItem}
                setQRCode={setQRCode}
              />
            )}
          </div>
        </div>
      )}
      <button onClick={TEST}>test button</button>
    </div>
  );
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "400px",
  maxWidth: "90%",
  boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  position: "relative",
};

export default Restaurant;
