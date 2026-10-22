import api from "./api";

export const getPendingVendors = () => {
  return api.get("/admin/pending-vendors");
};

export const approveVendorById = (id) => {
  return api.put(`/admin/vendors/${id}/approve`);
};

export const holdVendorById = (id) => {
  return api.put(`/admin/vendors/${id}/hold`);
};

export const deleteVendorById = (id) => {
  return api.delete(`/admin/vendors/${id}`);
};

export const getAllVendors = (status = "all") => {
  return api.get(`/admin/vendors?status=${status}`);
};

export const getVendorDetailsById = (id) => {
  return api.get(`/admin/vendors/${id}`);
};

export const updateVendorStatusById = (id, status, reason = "") => {
  return api.put(`/admin/vendors/${id}/status`, { status, reason });
};