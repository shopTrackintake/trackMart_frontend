import api from "./api";

/* GET */
export const getWishlist = () => {
  return api.get("/wishlist");
};

/* ADD */
export const addWishlist = (productId) => {
  return api.post("/wishlist", {
    product_id: productId
  });
};
/* ================= TOGGLE WISHLIST ================= */

export const toggleWishlist = async (productId) => {
  return api.post("/wishlist/toggle", {
    product_id: productId
  });
};
/* REMOVE */
export const removeWishlist = (id) => {
  return api.delete(`/wishlist/${id}`);
};