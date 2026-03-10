import api from "./api";

/* GET ALL PRODUCTS */
export const getProducts = () => {
  return api.get("/products");
};
/* CREATE PRODUCT */
export const createProduct = (formData, token) => {
  return api.post("/products", formData, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
/* GET SINGLE PRODUCT */
export const getProductById = (id) => {
  return api.get(`/products/${id}`);
};