import api from "./api";

/* GET CART */
export const getCart = () => {
  return api.get("/cart");
};

/* UPDATE CART (increase / decrease / remove via negative delta) */
export const updateCartItem = (productId, qty) => {
  return api.post("/cart", {
    product_id: productId,
    quantity: qty
  });
};

/* MERGE GUEST CART ON LOGIN */
export const mergeCart = (items) => {
  return api.post("/cart/merge", { items });
};

/* REMOVE ITEM */
export const removeCartItem = (productId) => {
  return api.delete(`/cart/${productId}`);
};

/* CLEAR CART */
export const clearCart = () => {
  return api.delete("/cart/clear");
};