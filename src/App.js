import React from "react";
import TIRouter from "./routes";

const App = () => {
  return <TIRouter />;
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    margin: 0,
    padding: "0 20px", // Padding to prevent text from touching screen edges on mobile
    boxSizing: "border-box", // Ensures padding is included in width calculations
    backgroundColor: "#f5f5f5",
  },
  heading: {
    fontSize: "2rem",
    marginBottom: "20px",
    textAlign: "center",
    color: "#333",
  },
  button: {
    fontSize: "1rem",
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
};

// Add hover effect
styles.button[":hover"] = {
  backgroundColor: "#0056b3",
};

export default App;
