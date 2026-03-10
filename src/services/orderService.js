import api from "./api";

/* USER ORDERS */
export const getUserOrders = () => {
  return api.get("/orders");
};

/* GUEST ORDER */
export const placeGuestOrder = (data) => {
  return api.post("/orders/guest", data);
};

/* LOGGED-IN USER ORDER (optional future) */
export const placeUserOrder = () => {
  return api.post("/orders");
};