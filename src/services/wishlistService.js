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

/* TOGGLE WISHLIST */

export const toggleWishlist = (productId) => {
  return api.post(`/wishlist/toggle/${productId}`);
};

/* REMOVE */
export const removeWishlist = (id) => {
  return api.delete(`/wishlist/${id}`);

};
