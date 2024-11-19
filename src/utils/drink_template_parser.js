export const sanitize_drink_order = (drink) => {
  return typeof drink === "string" ? JSON.parse(drink) : drink;
};
