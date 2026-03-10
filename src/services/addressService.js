import api from "./api";

export const getAddresses = () => {
  return api.get("/addresses");
};

export const addAddress = (data) => {
  return api.post("/addresses", data);
};

export const updateAddress = (id,data) => {
  return api.put(`/addresses/${id}`,data);
};

export const deleteAddress = (id) => {
  return api.delete(`/addresses/${id}`);
};