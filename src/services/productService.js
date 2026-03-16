import api from "./api";

/* GET ALL PRODUCTS */

export const getProducts = (filters = {}, token = null) => {

  const query = new URLSearchParams(filters).toString();

  return api.get(`/products?${query}`, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {}
  });

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