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