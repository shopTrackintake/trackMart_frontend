import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import {
  getAddresses,
  updateAddress,
  deleteAddress
} from "../services/addressService";
import { useNavigate } from "react-router-dom";
import { 
  User, Mail, Phone, MapPin, Building2, 
  CreditCard, CheckCircle2, ShieldCheck, Edit2, Trash2, 
  Plus, Save, FileText
} from "lucide-react";

export default function Profile() {
  const { role } = useContext(AuthContext);
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    house_no: "",
    street: "",
    locality: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [vendorForm, setVendorForm] = useState({
    owner_name: "",
    business_name: "",
    phone: "",
    shop_address: "",
    pincode: "",
    bank_holder_name: "",
    bank_account_number: "",
    bank_ifsc: "",
    upi_id: "",
    pan_number: "",
    gst_number: "",
    fssai_number: ""
  });

  useEffect(() => {
    fetchUser();
    if (role === "customer") fetchAddresses();
  }, [role]);

  const fetchUser = async () => {
    try {
      const res = await api.get("/user/profile");
      const data = res.data || {};
      setUser(data);
      if (role === "vendor" && data) {
        setVendorForm({
          owner_name: data.owner_name || data.name || "",
          business_name: data.business_name || "",
          phone: data.phone || "",
          shop_address: data.shop_address || "",
          pincode: data.pincode || "",
          bank_holder_name: data.bank_holder_name || "",
          bank_account_number: data.bank_account_number || "",
          bank_ifsc: data.bank_ifsc || "",
          upi_id: data.upi_id || "",
          pan_number: data.pan_number || "",
          gst_number: data.gst_number || "",
          fssai_number: data.fssai_number || ""
        });
      }
    } catch (err) {
      console.error("Fetch user profile error:", err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await getAddresses();
      setAddresses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch addresses error:", err);
    }
  };

  /* ================= EDIT ADDRESS ================= */
  const handleEditAddress = (addr) => {
    setForm({
      full_name: addr.full_name || "",
      phone: addr.phone || "",
      house_no: addr.house_no || "",
      street: addr.street || "",
      locality: addr.locality || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || ""
    });
    setEditingId(addr.id);
  };

  const handleUpdateAddress = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      await updateAddress(editingId, form);
      alert("Address updated successfully");
      setEditingId(null);
      fetchAddresses();
    } catch {
      alert("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await deleteAddress(id);
      fetchAddresses();
    } catch {
      alert("Failed to delete address");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  /* ================= VENDOR UPDATE ================= */
  const handleVendorUpdate = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setSavedMsg("");
      await api.put("/user/profile", vendorForm);
      setSavedMsg("Profile and bank details saved successfully!");
      setTimeout(() => setSavedMsg(""), 4000);
      fetchUser();
    } catch (err) {
      alert("Failed to update profile: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn py-2 sm:py-4">
      
      {/* 1. PROFILE HEADER CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0">
            {user.owner_name ? user.owner_name.charAt(0).toUpperCase() : (user.name ? user.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-primary">
                {role === "vendor" ? (user.business_name || user.name || "Vendor Store") : (user.name || "User Account")}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-slate-100 text-slate-700">
                {role || "Customer"}
              </span>
            </div>
            
            <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email || "No email on record"}
              </span>
              {role === "vendor" && user.owner_name && (
                <span className="text-slate-400">| Owner: <strong className="text-slate-700 font-medium">{user.owner_name}</strong></span>
              )}
            </p>
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {role === "vendor" && (
            <button
              onClick={() => navigate("/vendor/orders")}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              My Orders
            </button>
          )}

          {role === "customer" && (
            <button
              onClick={() => navigate("/customer/orders")}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              My Orders
            </button>
          )}
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{savedMsg}</span>
        </div>
      )}

      {/* 2. VENDOR STORE PROFILE & SETTINGS */}
      {role === "vendor" && (
        <form onSubmit={handleVendorUpdate} className="space-y-6">
          
          {/* Section 1: Business & Owner Details */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-primary">
                  Store & Owner Information
                </h2>
                <p className="text-xs text-slate-500">Business identity, primary contact, and store location</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Business / Store Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={vendorForm.business_name}
                    onChange={(e) => setVendorForm({ ...vendorForm, business_name: e.target.value })}
                    placeholder="e.g. Organic Wellness Store"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Owner Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={vendorForm.owner_name}
                    onChange={(e) => setVendorForm({ ...vendorForm, owner_name: e.target.value })}
                    placeholder="Owner Full Name"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400">Account login ID (managed by admin)</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Business Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Physical Store / Pickup Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <textarea
                    rows={2}
                    value={vendorForm.shop_address}
                    onChange={(e) => setVendorForm({ ...vendorForm, shop_address: e.target.value })}
                    placeholder="Enter complete store address for delivery pickups..."
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pincode</label>
                <input
                  type="text"
                  value={vendorForm.pincode}
                  onChange={(e) => setVendorForm({ ...vendorForm, pincode: e.target.value })}
                  placeholder="e.g. 400001"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Banking & Payout Details */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-primary">
                  Bank & Settlement Payout Details
                </h2>
                <p className="text-xs text-slate-500">Earnings and sales payouts are transferred to this account</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Account Holder Name</label>
                <input
                  type="text"
                  value={vendorForm.bank_holder_name}
                  onChange={(e) => setVendorForm({ ...vendorForm, bank_holder_name: e.target.value })}
                  placeholder="Name as per Bank Passbook"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Bank Account Number</label>
                <input
                  type="text"
                  value={vendorForm.bank_account_number}
                  onChange={(e) => setVendorForm({ ...vendorForm, bank_account_number: e.target.value })}
                  placeholder="e.g. 01234567890123"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Bank IFSC Code</label>
                <input
                  type="text"
                  value={vendorForm.bank_ifsc}
                  onChange={(e) => setVendorForm({ ...vendorForm, bank_ifsc: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0001234"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Settlement UPI ID</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={vendorForm.upi_id}
                    onChange={(e) => setVendorForm({ ...vendorForm, upi_id: e.target.value })}
                    placeholder="yourname@okaxis / upi"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Legal & Regulatory Identification */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-primary">
                  Legal, Tax & Regulatory Identification
                </h2>
                <p className="text-xs text-slate-500">Government registrations and certifications</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">PAN Card Number</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={vendorForm.pan_number}
                    onChange={(e) => setVendorForm({ ...vendorForm, pan_number: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">GST Number (Optional)</label>
                <input
                  type="text"
                  value={vendorForm.gst_number}
                  onChange={(e) => setVendorForm({ ...vendorForm, gst_number: e.target.value.toUpperCase() })}
                  placeholder="22AAAAA0000A1Z5"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">FSSAI License No (Optional)</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={vendorForm.fssai_number}
                    onChange={(e) => setVendorForm({ ...vendorForm, fssai_number: e.target.value })}
                    placeholder="14-digit FSSAI No"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primaryHover text-white text-sm font-bold px-8 py-3 rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save All Details"}
            </button>
          </div>
        </form>
      )}

      {/* 3. CUSTOMER SAVED ADDRESSES */}
      {role === "customer" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-primary">
                Saved Delivery Addresses
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                Manage your saved delivery destinations for quick 1-click checkout.
              </p>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-sm">
              No saved addresses found. You can add one during checkout.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr, i) => (
                <div key={addr.id} className="border border-slate-200 rounded-xl p-4 space-y-2 relative bg-slate-50/50 hover:bg-white hover:shadow-xs transition">
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                    {i === 0 ? "Default" : "Address"}
                  </span>

                  <p className="font-bold text-slate-900 text-sm">{addr.full_name}</p>
                  <p className="text-xs text-slate-500">{addr.phone}</p>

                  <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                    <p>{addr.house_no}, {addr.street}</p>
                    <p>{addr.locality}, {addr.city}</p>
                    <p>{addr.state} - <strong className="text-slate-800">{addr.pincode}</strong></p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => handleEditAddress(addr)}
                      className="px-3 py-1 text-xs font-semibold text-slate-700 hover:text-primary rounded-lg border border-slate-200 hover:bg-white transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EDIT FORM MODAL */}
          {editingId && (
            <form onSubmit={handleUpdateAddress} className="border border-primary/40 bg-primary/5 rounded-xl p-4 sm:p-5 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Edit Address</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <input
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Full Name"
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  required
                />
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone"
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  required
                />
                <input
                  value={form.house_no}
                  onChange={(e) => setForm({ ...form, house_no: e.target.value })}
                  placeholder="House / Flat No"
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  required
                />
                <input
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  placeholder="Street / Area"
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  required
                />
                <input
                  value={form.locality}
                  onChange={(e) => setForm({ ...form, locality: e.target.value })}
                  placeholder="Locality / Landmark"
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                />
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  required
                />
                <input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="State"
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  required
                />
                <input
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  placeholder="Pincode"
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primaryHover rounded-xl shadow-xs"
                >
                  {saving ? "Updating..." : "Save Address"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}