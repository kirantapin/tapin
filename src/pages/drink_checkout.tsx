import React from "react";
import { useEffect, useState, useContext } from "react";
import { useAuth } from "../context/auth_context.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useSupabase } from "../context/supabase_context.tsx";
import SearchBar from "../components/rotating_searchbar.tsx";
import { PolicyEngine } from "../utils/policy_engine.ts";
import { CheckoutLineItem } from "../components/checkout_line_item.tsx";
import { DealDisplay } from "../components/deal_display.tsx";
import {
  Cart,
  CartItem,
  Policy,
  Restaurant,
  DealEffectPayload,
  Transaction,
  User,
} from "../types.ts";
import { priceItem } from "../utils/pricer.ts";

export const DrinkCheckout = ({}) => {
  const location = useLocation();

  const {
    is_authenticated,
    userSession,
    transactions,
    setTransactions,
    policies,
    setUserData,
  } = useAuth();
  const supabase = useSupabase();
  const navigate = useNavigate();

  const emptyDealEffect: DealEffectPayload = {
    freeAddedItems: [],
    modifiedItems: [],
    wholeCartModification: null,
  };

  const [cart, setCart] = useState<Cart>(location.state?.cart);
  const [dealEffect, setDealEffect] =
    useState<DealEffectPayload>(emptyDealEffect);
  const restaurant = location.state?.restaurant;
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(
    location.state?.policy
  );
  const [engine, setEngine] = useState(new PolicyEngine(cart, restaurant));
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [rendering, setRendering] = useState<JSX.Element>(<></>);

  useEffect(() => {
    handleSelectedPolicy(selectedPolicy);
  }, [selectedPolicy]);

  useEffect(() => {
    console.log("inside cart use effect");
    for (const item of cart) {
      item.price = priceItem(item.item, restaurant);
    }
    engine.update_cart(cart);
    handleSelectedPolicy(selectedPolicy);
  }, [cart]);

  const handleSelectedPolicy = (selectedPolicy: Policy | null) => {
    if (selectedPolicy) {
      if (!engine.does_policy_apply(selectedPolicy)) {
        setSelectedPolicy(null);
        setDealEffect(emptyDealEffect);
      } else {
        const effect = engine.apply_policy(selectedPolicy);
        setDealEffect(effect || emptyDealEffect);
      }
    } else {
      setDealEffect(emptyDealEffect);
    }
  };

  const click_policy = (policy: Policy) => {
    if (!engine.does_policy_apply(policy)) {
      return;
    } else {
      setSelectedPolicy(policy);
    }
  };

  const purchase_drink = async () => {
    //things you need customer_id,restaurant_id,item,policy_id
    const payload = {
      user_id: userSession ? userSession.phone : null,
      restaurant_id: restaurant.id,
      cart: cart,
      userDealEffect: dealEffect,
      userPolicy: selectedPolicy,
      results: {
        totalPrice: totalPrice,
        totalPoints: totalPoints,
      },
    };

    try {
      const { data, error } = await supabase.functions.invoke("submit_order", {
        body: payload,
      });
      if (error || !data)
        throw new Error("created transaction came back as null");
      console.log(data);
      //transaction is good we need to store this locally somewhere
      const { transactions, userData } = data as {
        transactions: Transaction[];
        userData: User;
      };
      setUserData(userData);
      if (!transactions || transactions?.length == 0) {
        throw new Error("No transactions received or created");
      } else {
        setTransactions((prevTransactions) =>
          [...prevTransactions, ...transactions].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
        );
        navigate(`/qrcode`, {
          state: { transactions: transactions },
        });
      }
      //set global context to store restaurant data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const add_to_cart = (order_response: Cart) => {
    setCart((prevCart) => {
      const maxId = prevCart.reduce(
        (max, item) => Math.max(max, item.id || 0), // Find the highest ID in the current cart
        0
      );

      const reassignedItems = order_response.map((item, index) => ({
        ...item,
        id: maxId + index + 1, // Assign new unique IDs
      }));

      return [...prevCart, ...reassignedItems]; // Merge the new items with the existing cart
    });
  };

  const test = () => {
    console.log(cart);
    console.log(dealEffect);
  };

  const updateCartItem = (
    itemKey: number,
    updatedFields: Partial<CartItem>
  ) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemKey ? { ...item, ...updatedFields } : item
      )
    );
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {/* <DrinkTemplate initialValues={drink_template} onSubmit={purchase_drink} /> */}
      <ul style={{ listStyle: "none", padding: 10, margin: 10 }}>
        Cart
        {cart &&
          cart.map((item: CartItem, index: number) => (
            <li key={index}>
              <CheckoutLineItem
                item={item}
                onUpdate={updateCartItem}
                lockedFields={[]}
              />
            </li>
          ))}
        <br />
      </ul>
      <DealDisplay
        cart={cart}
        dealEffect={dealEffect}
        onUpdate={(price, points, jsx) => {
          setTotalPrice(price);
          setTotalPoints(points);
          setRendering(jsx);
        }}
      />
      {rendering}
      <ul style={{ listStyle: "none", padding: 10, margin: 10 }}>
        {policies.map((policy, index) => (
          <li
            key={index}
            onClick={() => click_policy(policy)}
            style={{
              backgroundColor:
                selectedPolicy?.policy_id === policy.policy_id
                  ? "orange"
                  : "transparent",
              cursor: "pointer",
              padding: "10px",
            }}
          >
            {policy.name}
          </li>
        ))}
      </ul>
      <SearchBar action={add_to_cart} restaurant={restaurant} />
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
