import api from "./api";

/* GET VENDOR STATS */
export const getVendorStats = (token) => {
  return api.get("/vendor/stats", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
export const getVendorOrders = () => {
  return api.get("/vendor/orders");
};

export const getVendorEarnings = () => {
  return api.get("/vendor/earnings");
};