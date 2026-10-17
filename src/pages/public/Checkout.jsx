import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, CheckCircle2, Plus, Edit2, Trash2, 
  Navigation, Check, ShieldCheck, ShoppingBag, CreditCard,
  Loader2, AlertCircle, Sparkles
} from "lucide-react";
import {
  getAddresses,
  addAddress,
  deleteAddress,
  updateAddress
} from "../../services/addressService";
import api from "../../services/api";

export default function Checkout() {
  const navigate = useNavigate();
  const paymentRef = useRef(null);

  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true);

  // Address selection & mode
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressMode, setAddressMode] = useState("saved"); // "saved" | "new"
  const [editingId, setEditingId] = useState(null);

  // New / Edit address form state
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    house_no: "",
    street: "",
    locality: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    latitude: "",
    longitude: ""
  });

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [placing, setPlacing] = useState(false);

  // Load Razorpay Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Fetch Addresses
  const fetchAddresses = async () => {
    try {
      const res = await getAddresses();
      const list = Array.isArray(res.data) ? res.data : [];
      setAddresses(list);

      // Auto-select first address if none selected
      if (list.length > 0) {
        setSelectedAddressId((prev) => prev || list[0].id);
        setAddressMode("saved");
      } else {
        setAddressMode("new");
      }
    } catch (err) {
      console.error("Fetch addresses error:", err);
    }
  };

  // Fetch Cart Items
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoadingCart(true);
        const res = await api.get("/cart");
        const validItems = (res.data || []).filter(
          (item) => Number(item.quantity) > 0
        );

        setCartItems(validItems);

        const total = validItems.reduce(
          (acc, item) => acc + Number(item.price) * Number(item.quantity),
          0
        );
        setTotalAmount(total);
      } catch (err) {
        console.error("Fetch cart error:", err);
      } finally {
        setLoadingCart(false);
      }
    };

    fetchCart();
    fetchAddresses();
  }, []);

  /* ================= 1. USE CURRENT LOCATION (GPS) ================= */
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

          setForm((prev) => ({
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

          setLocationSuccessMsg(
            `GPS captured: Lat ${lat.toFixed(4)}, Lng ${lon.toFixed(4)}`
          );
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          // Still store the coordinates even if reverse geocode fails
          setForm((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lon
          }));
          setLocationSuccessMsg(
            `Coordinates saved: Lat ${lat.toFixed(4)}, Lng ${lon.toFixed(4)}`
          );
        } finally {
          setDetectingLocation(false);
        }
      },
      (error) => {
        setDetectingLocation(false);
        alert("Please enable location permissions in your browser to detect your current location.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  /* ================= 2. SAVE OR UPDATE ADDRESS ================= */
  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (
      !form.full_name ||
      !form.phone ||
      !form.house_no ||
      !form.street ||
      !form.locality ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      alert("Please fill all required address fields.");
      return;
    }

    try {
      setSavingAddress(true);

      if (editingId) {
        await updateAddress(editingId, form);
        alert("Address updated successfully!");
        setEditingId(null);
      } else {
        const res = await addAddress(form);
        if (res.data?.id) {
          setSelectedAddressId(res.data.id);
        }
        alert("Address saved successfully!");
      }

      // Reset form
      setForm({
        full_name: "",
        phone: "",
        house_no: "",
        street: "",
        locality: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        latitude: "",
        longitude: ""
      });
      setLocationSuccessMsg("");

      await fetchAddresses();
      setAddressMode("saved");

    } catch (err) {
      console.error("Save address error:", err);
      alert(err.response?.data?.message || "Failed to save address. Please check all fields.");
    } finally {
      setSavingAddress(false);
    }
  };

  /* ================= 3. EDIT & DELETE ACTIONS ================= */
  const handleEdit = (addr) => {
    setForm({
      full_name: addr.full_name || "",
      phone: addr.phone || "",
      house_no: addr.house_no || "",
      street: addr.street || "",
      locality: addr.locality || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      latitude: addr.latitude || "",
      longitude: addr.longitude || ""
    });
    setEditingId(addr.id);
    setAddressMode("new");
    if (addr.latitude && addr.longitude) {
      setLocationSuccessMsg(`Current coordinates: ${Number(addr.latitude).toFixed(4)}, ${Number(addr.longitude).toFixed(4)}`);
    } else {
      setLocationSuccessMsg("");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteAddress(id);
      if (selectedAddressId === id) {
        setSelectedAddressId(null);
      }
      fetchAddresses();
    } catch {
      alert("Failed to delete address.");
    }
  };

  /* ================= 4. RAZORPAY PAYMENT & ORDER PLACEMENT ================= */
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select a delivery address to proceed.");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add items to proceed.");
      navigate("/buy");
      return;
    }

    try {
      setPlacing(true);

      // 1. Create DB Order First
      const orderRes = await api.post("/orders", {
        address_id: selectedAddressId,
        payment_method: "ONLINE"
      });

      const dbOrderId = orderRes.data.order_id;

      // 2. Create Razorpay Payment Order
      const res = await api.post("/payment/create-order", {
        amount: totalAmount
      });

      const { order } = res.data;

      // 3. Launch Razorpay Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "TrackMart",
        description: "Fresh Groceries Order Payment",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              await api.patch("/orders/payment-status", {
                order_id: dbOrderId,
                payment_id: response.razorpay_payment_id
              });

              alert("Order placed & payment verified successfully!");
              window.location.href = "/customer/orders";
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification failed.");
          }
        },
        modal: {
          ondismiss: () => {
            setPlacing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Order error:", err);
      alert(err.response?.data?.message || "Failed to initiate payment. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn pb-16">

      {/* TOP HEADER */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/customer/cart")}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-primary transition group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Shopping Cart</span>
        </button>

        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Step 2 of 2: Checkout
        </span>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          <span className="text-slate-900">Delivery & </span>
          <span className="text-primary">Checkout</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select or fill your delivery address, then proceed with instant online payment.
        </p>
      </div>

      {/* ================= STEP 1: CLEAR ADDRESS OPTION SWITCHER ================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* SECTION HEADER & DUAL-OPTION SWITCHER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>1. Delivery Address</span>
            </h2>
            <p className="text-xs text-slate-500">
              Choose an existing address or enter a new one.
            </p>
          </div>

          {/* CLEAR DUAL OPTIONS TABS */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setAddressMode("saved");
                setEditingId(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                addressMode === "saved"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Choose Saved Address</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700">
                {addresses.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAddressMode("new");
                setEditingId(null);
                setForm({
                  full_name: "",
                  phone: "",
                  house_no: "",
                  street: "",
                  locality: "",
                  landmark: "",
                  city: "",
                  state: "",
                  pincode: "",
                  latitude: "",
                  longitude: ""
                });
                setLocationSuccessMsg("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                addressMode === "new"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Fill New Address</span>
            </button>
          </div>
        </div>

        {/* --- OPTION A: CHOOSE SAVED ADDRESS --- */}
        {addressMode === "saved" && (
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No saved addresses found</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Please add your delivery address to proceed with this order.
                </p>
                <button
                  type="button"
                  onClick={() => setAddressMode("new")}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:bg-orange-600 transition shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Fill New Address</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;

                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-5 rounded-2xl border-2 transition cursor-pointer relative space-y-3 flex flex-col justify-between ${
                        isSelected
                          ? "border-primary bg-orange-50/20 shadow-xs ring-2 ring-primary/10"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Radio selection & Label */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? "border-primary bg-primary text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="font-bold text-slate-900 text-sm">
                              {addr.full_name}
                            </span>
                          </div>

                          {isSelected && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary text-white">
                              Selected
                            </span>
                          )}
                        </div>

                        {/* Phone */}
                        <p className="text-xs text-slate-500 font-medium pl-7">
                          📞 {addr.phone}
                        </p>

                        {/* Complete Address */}
                        <div className="text-xs text-slate-600 leading-relaxed pl-7 pt-1">
                          <p>{addr.house_no}, {addr.street}</p>
                          {addr.locality && <p>{addr.locality}</p>}
                          <p>{addr.city}, {addr.state} - <strong className="text-slate-900 font-mono font-bold">{addr.pincode}</strong></p>
                          
                          {/* Coordinates Badge */}
                          {addr.latitude && addr.longitude && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-2 border border-emerald-100 font-semibold font-mono">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>GPS Coordinates: {Number(addr.latitude).toFixed(4)}, {Number(addr.longitude).toFixed(4)}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 pl-7">
                        <span className="text-[11px] font-bold text-primary">
                          {isSelected ? "Deliver to this address" : "Click to select"}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(addr);
                            }}
                            className="p-1.5 text-slate-400 hover:text-primary rounded-lg transition"
                            title="Edit Address"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(addr.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                            title="Delete Address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- OPTION B: FILL NEW ADDRESS (NO MAP BLOCKER) --- */}
        {addressMode === "new" && (
          <form onSubmit={handleSaveAddress} className="space-y-5">
            
            {/* GPS LOCATION AUTODETECT BANNER */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50/80 to-amber-50/80 border border-orange-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span>Quick Fill via GPS</span>
                </p>
                <p className="text-xs text-slate-600">
                  Detect your current latitude & longitude and autofill address details automatically.
                </p>
              </div>

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={detectingLocation}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 disabled:opacity-50"
              >
                {detectingLocation ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Detecting Location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Use Current Location</span>
                  </>
                )}
              </button>
            </div>

            {/* GPS SUCCESS CONFIRMATION BADGE */}
            {locationSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{locationSuccessMsg}</span>
              </div>
            )}

            {/* ADDRESS FORM FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Full Name *</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Receiver's Name"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Phone Number *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Flat / House / Building No *</label>
                <input
                  type="text"
                  value={form.house_no}
                  onChange={(e) => setForm({ ...form, house_no: e.target.value })}
                  placeholder="Flat 102, Building A"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Street / Road / Area *</label>
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  placeholder="Main Market Road"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Locality / Colony *</label>
                <input
                  type="text"
                  value={form.locality}
                  onChange={(e) => setForm({ ...form, locality: e.target.value })}
                  placeholder="Sector or Colony name"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Landmark (Optional)</label>
                <input
                  type="text"
                  value={form.landmark}
                  onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                  placeholder="Near park, temple, etc."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">State *</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="State"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Pincode *</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  placeholder="6-digit Pincode"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
                />
              </div>

              {/* Coordinates display if captured */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">GPS Coordinates</label>
                <input
                  type="text"
                  value={form.latitude && form.longitude ? `${Number(form.latitude).toFixed(4)}, ${Number(form.longitude).toFixed(4)}` : "Auto-detected on GPS click"}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* FORM ACTION BUTTONS */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingAddress}
                className="px-6 py-3 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs sm:text-sm transition shadow-xs disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
              >
                {savingAddress ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Address...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{editingId ? "Update & Select Address" : "Save & Select Address"}</span>
                  </>
                )}
              </button>

              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setAddressMode("saved");
                    setEditingId(null);
                  }}
                  className="px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

          </form>
        )}

      </div>

      {/* ================= STEP 2: ORDER SUMMARY & PAYMENT ================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <span>2. Order Summary & Payment</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review items in your bag and finalize your order with instant Razorpay checkout.
          </p>
        </div>

        {/* ITEMS LIST */}
        <div className="divide-y divide-slate-100">
          {cartItems.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
              <div className="space-y-0.5 min-w-0 pr-4">
                <p className="font-bold text-slate-900 truncate">{item.title}</p>
                <p className="text-xs text-slate-500">
                  Qty: <strong className="text-slate-800">{item.quantity}</strong> × ₹{item.price}
                </p>
              </div>
              <span className="font-black font-mono text-slate-900 shrink-0">
                ₹{Number(item.price) * Number(item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* PRICE BREAKDOWN */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Items Subtotal</span>
            <span className="font-mono font-bold">₹{totalAmount}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Standard Express Delivery</span>
            <span className="text-emerald-700 font-bold uppercase">Free</span>
          </div>
          <div className="border-t border-slate-200/80 pt-2 flex justify-between text-sm sm:text-base font-black text-slate-900">
            <span>Total Payable Amount</span>
            <span className="text-primary font-mono font-black">₹{totalAmount}</span>
          </div>
        </div>

        {/* SELECTED DELIVERY DESTINATION CALLOUT */}
        {selectedAddress && (
          <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80 text-xs text-slate-700 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">
                Delivering to: {selectedAddress.full_name} ({selectedAddress.phone})
              </p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                {selectedAddress.house_no}, {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
              </p>
            </div>
          </div>
        )}

        {/* PAYMENT BADGE & CTA */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Secured Payment via Razorpay (UPI, Google Pay, Cards, NetBanking)</span>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={placing || !selectedAddressId || cartItems.length === 0}
            className="w-full py-4 rounded-2xl bg-primary hover:bg-orange-600 text-white font-extrabold text-sm sm:text-base transition shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {placing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Pay ₹{totalAmount} & Confirm Order</span>
              </>
            )}
          </button>

          {!selectedAddressId && (
            <p className="text-xs text-center text-red-600 font-semibold">
              Please select or save a delivery address above to enable payment.
            </p>
          )}
        </div>

      </div>

    </div>
  );
}