import React, { useState } from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Box,
  Button,
  TextField,
} from "@mui/material";
import { ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";
import { styled } from "@mui/system";

// Define the menu structure
interface MenuItem {
  name: string;
  price: number;
}

interface MenuCategory {
  [category: string]: MenuItem[];
}

const menu: MenuCategory = {
  Appetizers: [
    { name: "Bruschetta", price: 8.99 },
    { name: "Calamari", price: 10.99 },
    { name: "Mozzarella Sticks", price: 7.99 },
  ],
  "Main Courses": [
    { name: "Spaghetti Carbonara", price: 14.99 },
    { name: "Grilled Salmon", price: 18.99 },
    { name: "Chicken Parmesan", price: 16.99 },
  ],
  Desserts: [
    { name: "Tiramisu", price: 6.99 },
    { name: "Cheesecake", price: 5.99 },
    { name: "Chocolate Mousse", price: 4.99 },
  ],
};

const StyledAccordion = styled(Accordion)({
  marginBottom: "16px",
  boxShadow: "none",
  "&:before": {
    display: "none",
  },
});

const StyledAccordionSummary = styled(AccordionSummary)({
  backgroundColor: "#f5f5f5",
  borderRadius: "4px",
});

export default function MenuOrdering() {
  const [cart, setCart] = useState<{ [itemName: string]: number }>({});

  const addToCart = (itemName: string) => {
    setCart((prevCart) => ({
      ...prevCart,
      [itemName]: (prevCart[itemName] || 0) + 1,
    }));
  };

  const removeFromCart = (itemName: string) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[itemName] > 1) {
        newCart[itemName]--;
      } else {
        delete newCart[itemName];
      }
      return newCart;
    });
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [itemName, quantity]) => {
      const item = Object.values(menu)
        .flat()
        .find((item) => item.name === itemName);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.paper",
        color: "text.primary",
        p: 3,
      }}
    >
      {Object.entries(menu).map(([category, items]) => (
        <StyledAccordion key={category}>
          <StyledAccordionSummary expandIcon={<Plus />}>
            <Typography variant="h6">{category}</Typography>
          </StyledAccordionSummary>
          <AccordionDetails>
            <List disablePadding>
              {items.map((item) => (
                <ListItem
                  key={item.name}
                  secondaryAction={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <IconButton
                        edge="end"
                        aria-label="remove"
                        onClick={() => removeFromCart(item.name)}
                        disabled={!cart[item.name]}
                      >
                        <Minus />
                      </IconButton>
                      <TextField
                        sx={{ width: 40, mx: 1 }}
                        value={cart[item.name] || 0}
                        InputProps={{ readOnly: true }}
                        variant="standard"
                      />
                      <IconButton
                        edge="end"
                        aria-label="add"
                        onClick={() => addToCart(item.name)}
                      >
                        <Plus />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={item.name}
                    secondary={`$${item.price.toFixed(2)}`}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </StyledAccordion>
      ))}

      {/* <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Button
          variant="contained"
          fullWidth
          startIcon={<ShoppingCart />}
          sx={{
            backgroundColor: "#f5b14c",
          }}
          disabled={getTotalItems() === 0}
        >
          Checkout (${getTotalPrice().toFixed(2)})
        </Button>
      </Box> */}
    </Box>
  );
}
