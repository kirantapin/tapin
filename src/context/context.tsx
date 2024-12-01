import React, { createContext, useState } from "react";

// Create a context with default values (optional)
export const MyContext = createContext();

export const MyProvider = ({ children }) => {
  // Define the state you want to share
  const [state, setState] = useState("Hello World");

  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
};
