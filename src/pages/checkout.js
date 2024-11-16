import React from "react";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();
  const handlePurchase = () => {
    alert("Purchase completed!");
    navigate("/qrcode");
    // You can add more logic here, such as API calls or navigation
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <button
        onClick={handlePurchase}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Purchase
      </button>
    </div>
  );
};

export default Checkout;
