import React from "react";
import { useMyContext } from "./MyProvider"; // Adjust the path as needed

const DisplayValue = () => {
  const value = useMyContext();

  return (
    <div>
      <h1>{value}</h1>
    </div>
  );
};

export default DisplayValue;
