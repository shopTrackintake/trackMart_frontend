import api from "./api";

/* GET CART */
export const getCart = () => {
  return api.get("/cart");
};

/* UPDATE CART (increase / decrease / remove) */
export const updateCartItem = (productId, qty) => {
  return api.post("/cart", {
    product_id: productId,
    quantity: qty
  });
};