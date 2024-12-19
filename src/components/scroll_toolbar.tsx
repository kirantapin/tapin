import React, { useEffect, useState } from "react";
import styled from "styled-components";

// Styled Component for Toolbar
interface ToolbarProps {
  visible: boolean;
}

const Toolbar = styled.div<ToolbarProps>`
  position: fixed;
  bottom: 20px; /* Position near the bottom of the screen */
  left: 50%; /* Center horizontally */
  transform: translateX(-50%); /* Adjust to center */
  display: flex;
  flex-direction: row; /* Horizontal layout for buttons */
  gap: 10px; /* Space between buttons */
  background-color: white; /* Semi-transparent background */
  border-radius: 90px;
  padding: 10px 20px; /* Add padding for a compact toolbar */
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  opacity: ${(props) => (props.visible ? 1 : 0)};
  pointer-events: ${(props) => (props.visible ? "all" : "none")};
  transition: opacity 0.3s ease; /* Smooth fade in/out */
  z-index: 1000; /* Ensure it appears above other elements */
`;

const ScrollToolbar = () => {
  const [visible, setVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show toolbar when scrolling down
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(true);
      }

      // Hide toolbar when scrolling up
      if (currentScrollY < lastScrollY) {
        setVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <Toolbar visible={visible}>
      <button
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Button 1
      </button>
      <button
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Button 2
      </button>
      <button
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Button 3
      </button>
    </Toolbar>
  );
};

export default ScrollToolbar;
