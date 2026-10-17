import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../services/api";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
} from "../services/addressService";
import { useNavigate } from "react-router-dom";
import { 
  User, Mail, Phone, MapPin, Building2, 
  CreditCard, CheckCircle2, ShieldCheck, Edit2, Trash2, 
  Plus, Save, FileText, Lock, KeyRound, Eye, EyeOff,
  AlertCircle, Package, Check, X, ShieldAlert, Navigation, Loader2
} from "lucide-react";

export default function Profile() {
  const { role, logout } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(role === "vendor" ? "store" : "personal");

  // Customer Profile Form
  const [personalForm, setPersonalForm] = useState({
    name: "",
    phone: ""
  });
  const [savingPersonal, setSavingPersonal] = useState(false);

  // Password Change State
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  // Customer Address State
  const [addresses, setAddresses] = useState([]);
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState("");
  const [addrForm, setAddrForm] = useState({
    full_name: "",
    phone: "",
    house_no: "",
    street: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: ""
  });

  // Vendor Profile State
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
  const [savingVendor, setSavingVendor] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    if (role === "customer") fetchAddresses();
  }, [role]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/profile");
      const data = res.data || {};
      setUser(data);

      setPersonalForm({
        name: data.name || "",
        phone: data.phone || data.user_phone || ""
      });

      if (role === "vendor") {
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
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
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

  /* ================= SAVE CUSTOMER PERSONAL INFO ================= */
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    try {
      setSavingPersonal(true);
      await api.put("/user/profile", {
        name: personalForm.name,
        phone: personalForm.phone
      });
      toast.success("Profile details updated successfully!", "Saved");
      fetchUserProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile", "Error");
    } finally {
      setSavingPersonal(false);
    }
  };

  /* ================= CHANGE PASSWORD ================= */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!passForm.currentPassword || !passForm.newPassword) {
      setPassError("Please fill in both current and new passwords.");
      return;
    }

    if (passForm.newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long.");
      return;
    }

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    try {
      setChangingPass(true);
      const res = await api.put("/user/change-password", {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });

      setPassSuccess(res.data?.message || "Password changed successfully!");
      toast.success("Password changed successfully!", "Security Updated");
      setPassForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password.";
      setPassError(msg);
      toast.error(msg, "Password Error");
    } finally {
      setChangingPass(false);
    }
  };

  /* ================= ADDRESS ACTIONS ================= */
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingLocation(true);
    setLocationSuccessMsg("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          const data = await res.json();
          const addr = data.address || {};

          setAddrForm((prev) => ({
            ...prev,
            house_no: addr.house_number || prev.house_no || "",
            street: addr.road || addr.suburb || prev.street || "",
            locality: addr.neighbourhood || addr.suburb || addr.village || prev.locality || "",
            city: addr.city || addr.town || addr.county || prev.city || "",
            state: addr.state || prev.state || "",
            pincode: addr.postcode || prev.pincode || "",
            latitude: lat,
            longitude: lon
          }));

          setLocationSuccessMsg(`GPS captured: Lat ${lat.toFixed(4)}, Lng ${lon.toFixed(4)}`);
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setAddrForm((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lon
          }));
          setLocationSuccessMsg(`Coordinates saved: Lat ${lat.toFixed(4)}, Lng ${lon.toFixed(4)}`);
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setDetectingLocation(false);
        alert("Please enable location permissions to detect your current position.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const openNewAddressModal = () => {
    setEditingAddrId(null);
    setLocationSuccessMsg("");
    setAddrForm({
      full_name: user.name || "",
      phone: personalForm.phone || "",
      house_no: "",
      street: "",
      locality: "",
      city: "",
      state: "",
      pincode: "",
      latitude: "",
      longitude: ""
    });
    setShowAddAddressModal(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddrId(addr.id);
    setLocationSuccessMsg(addr.latitude && addr.longitude ? `GPS: ${Number(addr.latitude).toFixed(4)}, ${Number(addr.longitude).toFixed(4)}` : "");
    setAddrForm({
      full_name: addr.full_name || "",
      phone: addr.phone || "",
      house_no: addr.house_no || "",
      street: addr.street || "",
      locality: addr.locality || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      latitude: addr.latitude || "",
      longitude: addr.longitude || ""
    });
    setShowAddAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      setSavingAddr(true);
      if (editingAddrId) {
        await updateAddress(editingAddrId, addrForm);
        toast.success("Address updated successfully!", "Saved");
      } else {
        await addAddress(addrForm);
        toast.success("New address added successfully!", "Saved");
      }
      setShowAddAddressModal(false);
      setEditingAddrId(null);
      fetchAddresses();
    } catch (err) {
      toast.error("Failed to save address. Please check fields.", "Error");
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress(id);
      toast.success("Address deleted successfully", "Deleted");
      fetchAddresses();
    } catch {
      toast.error("Failed to delete address", "Error");
    }
  };

  /* ================= VENDOR PROFILE UPDATE ================= */
  const handleVendorUpdate = async (e) => {
    e.preventDefault();
    try {
      setSavingVendor(true);
      await api.put("/user/profile", vendorForm);
      toast.success("Vendor profile and bank details saved successfully!", "Saved");
      fetchUserProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update vendor profile", "Error");
    } finally {
      setSavingVendor(false);
    }
  };

  const getInitials = () => {
    const name = user.owner_name || user.name || "User";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">

      {/* ================= 1. PROFILE HEADER CARD ================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-white flex items-center justify-center font-extrabold text-2xl sm:text-3xl shrink-0 shadow-md shadow-orange-500/20">
              {getInitials()}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {role === "vendor" ? (user.business_name || user.name || "Vendor Store") : (user.name || "User Account")}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-orange-50 text-primary border border-orange-200/80">
                  {role || "Customer"}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{user.email || "No email on record"}</span>
                </span>

                {(user.phone || personalForm.phone) && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{user.phone || personalForm.phone}</span>
                    </span>
                  </>
                )}

                {role === "vendor" && user.owner_name && (
                  <>
                    <span>•</span>
                    <span>Owner: <strong className="text-slate-800">{user.owner_name}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {role === "vendor" ? (
              <button
                type="button"
                onClick={() => navigate("/vendor/orders")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Package className="w-3.5 h-3.5" />
                <span>Vendor Orders</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/customer/orders")}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Package className="w-3.5 h-3.5" />
                <span>My Orders</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= 2. TAB NAVIGATION ================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {role === "customer" ? (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("personal")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "personal"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Personal Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "security"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Security & Password</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("addresses")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "addresses"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Delivery Addresses ({addresses.length})</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("store")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "store"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Store Information</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bank")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "bank"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Bank & Payouts</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("tax")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "tax"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tax & Compliance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === "security"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Security & Password</span>
            </button>
          </>
        )}
      </div>

      {/* ================= 3. TAB CONTENT PANELS ================= */}

      {/* --- A. CUSTOMER PERSONAL DETAILS TAB --- */}
      {role === "customer" && activeTab === "personal" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Personal Account Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your personal profile name and phone number for delivery updates.
            </p>
          </div>

          <form onSubmit={handleSavePersonal} className="space-y-5 max-w-xl">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={personalForm.name}
                  onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Email Address (Login ID)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-400">Registered email cannot be modified directly.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  value={personalForm.phone}
                  onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
              <p className="text-[11px] text-slate-400">Used for delivery verification and delivery updates.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPersonal}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs sm:text-sm transition shadow-xs disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingPersonal ? "Saving Changes..." : "Save Profile Details"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- B. SECURITY & CHANGE PASSWORD TAB (FOR ALL ROLES) --- */}
      {activeTab === "security" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              <span>Change Account Password</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your account password regularly to protect your orders and personal credentials.
            </p>
          </div>

          {passError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{passError}</span>
            </div>
          )}

          {passSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{passSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showCurrentPass ? "text" : "password"}
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                  placeholder="Enter existing password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                New Password (Minimum 6 Characters)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showNewPass ? "text" : "password"}
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  placeholder="Enter strong new password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Confirm New Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showNewPass ? "text" : "password"}
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                  placeholder="Re-type new password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password Hint */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Security Recommendations:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Use at least 6 characters with a combination of numbers and letters.</li>
                <li>Avoid using predictable passwords or repeating passwords from other platforms.</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={changingPass}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition shadow-xs disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{changingPass ? "Updating Password..." : "Update Password"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- C. CUSTOMER DELIVERY ADDRESSES TAB --- */}
      {role === "customer" && activeTab === "addresses" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Saved Delivery Addresses
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your saved home and office delivery addresses for fast 1-click checkout.
              </p>
            </div>

            <button
              type="button"
              onClick={openNewAddressModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs transition shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="w-12 h-12 bg-orange-50 text-primary rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No saved addresses yet</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add an address to receive fast deliveries and track orders accurately.
              </p>
              <button
                type="button"
                onClick={openNewAddressModal}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr, idx) => (
                <div
                  key={addr.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {idx === 0 ? "Default Address" : `Address #${idx + 1}`}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditAddressModal(addr)}
                        className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition cursor-pointer"
                        title="Edit Address"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 text-sm">{addr.full_name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{addr.phone}</span>
                    </p>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-200/80">
                    <p>{addr.house_no}, {addr.street}</p>
                    {addr.locality && <p>{addr.locality}</p>}
                    <p>{addr.city}, {addr.state} - <strong className="text-slate-900 font-mono font-bold">{addr.pincode}</strong></p>

                    {/* Coordinates Badge */}
                    {addr.latitude && addr.longitude && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-2 border border-emerald-100 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>GPS Coordinates: {Number(addr.latitude).toFixed(4)}, {Number(addr.longitude).toFixed(4)}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- D. VENDOR STORE INFORMATION TAB --- */}
      {role === "vendor" && activeTab === "store" && (
        <form onSubmit={handleVendorUpdate} className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Store Identity & Business Contact
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your store profile, owner details, and physical pickup address.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Store / Business Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={vendorForm.business_name}
                    onChange={(e) => setVendorForm({ ...vendorForm, business_name: e.target.value })}
                    placeholder="e.g. Shivam Traders"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Owner Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={vendorForm.owner_name}
                    onChange={(e) => setVendorForm({ ...vendorForm, owner_name: e.target.value })}
                    placeholder="Full Name"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Business Contact Phone</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Store / Warehouse Pickup Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <textarea
                    rows={2}
                    value={vendorForm.shop_address}
                    onChange={(e) => setVendorForm({ ...vendorForm, shop_address: e.target.value })}
                    placeholder="Complete address for package pickups..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Pincode</label>
                <input
                  type="text"
                  value={vendorForm.pincode}
                  onChange={(e) => setVendorForm({ ...vendorForm, pincode: e.target.value })}
                  placeholder="e.g. 400001"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingVendor}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs sm:text-sm transition shadow-xs disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingVendor ? "Saving Details..." : "Save Store Information"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* --- E. VENDOR BANK & PAYOUTS TAB --- */}
      {role === "vendor" && activeTab === "bank" && (
        <form onSubmit={handleVendorUpdate} className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Bank Account & Settlement Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide verified banking information for automated weekly payouts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Account Holder Name</label>
                <input
                  type="text"
                  value={vendorForm.bank_holder_name}
                  onChange={(e) => setVendorForm({ ...vendorForm, bank_holder_name: e.target.value })}
                  placeholder="As per bank passbook"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Bank Account Number</label>
                <input
                  type="text"
                  value={vendorForm.bank_account_number}
                  onChange={(e) => setVendorForm({ ...vendorForm, bank_account_number: e.target.value })}
                  placeholder="000000000000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">IFSC Code</label>
                <input
                  type="text"
                  value={vendorForm.bank_ifsc}
                  onChange={(e) => setVendorForm({ ...vendorForm, bank_ifsc: e.target.value.toUpperCase() })}
                  placeholder="SBIN0001234"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">UPI ID (Optional)</label>
                <input
                  type="text"
                  value={vendorForm.upi_id}
                  onChange={(e) => setVendorForm({ ...vendorForm, upi_id: e.target.value })}
                  placeholder="yourname@upi"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingVendor}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs sm:text-sm transition shadow-xs disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingVendor ? "Saving Payout Details..." : "Save Banking Details"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* --- F. VENDOR TAX & LEGAL COMPLIANCE TAB --- */}
      {role === "vendor" && activeTab === "tax" && (
        <form onSubmit={handleVendorUpdate} className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Tax, GST & Legal Compliance
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Government regulatory credentials and mandatory food licensing information.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">PAN Card Number</label>
                <input
                  type="text"
                  value={vendorForm.pan_number}
                  onChange={(e) => setVendorForm({ ...vendorForm, pan_number: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={vendorForm.gst_number}
                  onChange={(e) => setVendorForm({ ...vendorForm, gst_number: e.target.value.toUpperCase() })}
                  placeholder="22AAAAA0000A1Z5"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase">FSSAI License Number</label>
                <input
                  type="text"
                  value={vendorForm.fssai_number}
                  onChange={(e) => setVendorForm({ ...vendorForm, fssai_number: e.target.value })}
                  placeholder="14-digit FSSAI License"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingVendor}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs sm:text-sm transition shadow-xs disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savingVendor ? "Saving Compliance Info..." : "Save Compliance Details"}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ================= 4. ADD / EDIT ADDRESS MODAL ================= */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingAddrId ? "Edit Delivery Address" : "Add Delivery Address"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAddressModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              
              {/* USE CURRENT LOCATION BUTTON */}
              <div className="p-3.5 rounded-2xl bg-orange-50/80 border border-orange-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-primary" />
                    <span>Auto-detect via GPS</span>
                  </p>
                  <p className="text-[11px] text-slate-500">Capture current latitude, longitude and autofill fields.</p>
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={detectingLocation}
                  className="px-3.5 py-2 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                >
                  {detectingLocation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Detecting...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Use Current Location</span>
                    </>
                  )}
                </button>
              </div>

              {locationSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{locationSuccessMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name</label>
                  <input
                    value={addrForm.full_name}
                    onChange={(e) => setAddrForm({ ...addrForm, full_name: e.target.value })}
                    placeholder="Recipient's name"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone Number</label>
                  <input
                    value={addrForm.phone}
                    onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                    placeholder="Mobile number"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">House / Flat / Building No</label>
                  <input
                    value={addrForm.house_no}
                    onChange={(e) => setAddrForm({ ...addrForm, house_no: e.target.value })}
                    placeholder="Flat / House No, Building Name"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">Street / Area</label>
                  <input
                    value={addrForm.street}
                    onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })}
                    placeholder="Street, Sector, Area"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Locality / Landmark</label>
                  <input
                    value={addrForm.locality}
                    onChange={(e) => setAddrForm({ ...addrForm, locality: e.target.value })}
                    placeholder="Near park, school, etc."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City</label>
                  <input
                    value={addrForm.city}
                    onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                    placeholder="City"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">State</label>
                  <input
                    value={addrForm.state}
                    onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                    placeholder="State"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pincode</label>
                  <input
                    value={addrForm.pincode}
                    onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                    placeholder="6-digit pincode"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-primary focus:bg-white font-mono"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-slate-700">GPS Coordinates (Latitude, Longitude)</label>
                  <input
                    value={addrForm.latitude && addrForm.longitude ? `${Number(addrForm.latitude).toFixed(6)}, ${Number(addrForm.longitude).toFixed(6)}` : "Auto-detected on GPS click"}
                    disabled
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddr}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-orange-600 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {savingAddr ? "Saving..." : editingAddrId ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}