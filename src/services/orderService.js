import api from "./api";

/* USER ORDERS */
export const getUserOrders = () => {
  return api.get("/orders");
};

/* GET SINGLE ORDER BY ID */
export const getOrderDetails = (orderId) => {
  return api.get(`/orders/${orderId}`);
};

/* GUEST ORDER */
export const placeGuestOrder = (data) => {
  return api.post("/orders/guest", data);
};

/* LOGGED-IN USER ORDER (optional future) */
export const placeUserOrder = () => {
  return api.post("/orders");
};