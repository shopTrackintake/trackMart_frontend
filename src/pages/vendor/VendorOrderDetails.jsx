import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { 
  ArrowLeft, Package, User, Phone, MapPin, 
  Calendar, CheckCircle2, Clock, AlertCircle, 
  ShieldCheck, ChevronDown, ChevronUp, Truck, KeyRound,
  RefreshCw, Copy, Check, Mail, CreditCard, Sparkles,
  TrendingUp, CheckCircle, Navigation, ExternalLink
} from "lucide-react";

import socket from "../../services/socket";

export default function VendorOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [date, setDate] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

  /* ================= FETCH ORDER ================= */
  const fetchOrder = async () => {
    try {
      const res = await api.get(`/vendor/orders/${id}`);
      setOrder(res.data.order);
      setItems(res.data.items || []);
    } catch (err) {
      console.error("Fetch order error:", err);
    }
  };

  useEffect(() => {
    fetchOrder();

    const handleOrderUpdated = () => {
      console.log("⚡ [VendorOrderDetails] Socket order_updated event received - auto refreshing");
      fetchOrder();
    };

    socket.on("order_updated", handleOrderUpdated);
    return () => {
      socket.off("order_updated", handleOrderUpdated);
    };
  }, [id]);

  /* ================= STEP 1: SET IN TRANSIT ================= */
  const setInTransit = async (selectedDate) => {
    try {
      setConfirmLoading(true);

      const targetDate = selectedDate || date || new Date().toISOString().split("T")[0];
      const placedItems = items.filter((i) => ["placed", "pending"].includes(String(i.item_status || "").toLowerCase()));
      const item = placedItems[0];

      if (!item) {
        alert("No placed item found in this order");
        return;
      }

      await api.patch("/vendor/confirm-item", {
        item_id: item.id,
        delivery_date: targetDate
      });

      alert("🎉 Order updated to IN TRANSIT! Delivery OTP has been sent to the customer via Email and In-App Notification.");
      fetchOrder();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update order status");
    } finally {
      setConfirmLoading(false);
    }
  };

  /* ================= STEP 2: MARK DELIVERED WITH OTP ================= */
  const handleDeliverClick = async () => {
    try {
      if (!otp || String(otp).trim().length === 0) {
        alert("Please enter the 6-digit delivery OTP provided by the customer");
        return;
      }

      const inTransitItems = items.filter((i) => ["in_transit", "confirmed", "shipped"].includes(String(i.item_status || "").toLowerCase()));
      const item = inTransitItems[0];

      if (!item) {
        alert("No in-transit item found ready for delivery");
        return;
      }

      setConfirmLoading(true);
      await api.patch("/vendor/deliver-item", {
        item_id: item.id,
        otp: String(otp).trim()
      });

      alert("✅ OTP Verified successfully! Order marked as DELIVERED.");
      setOtp("");
      fetchOrder();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Delivery OTP verification failed. Please check the OTP.");
    } finally {
      setConfirmLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */
  const handleResendOtp = async () => {
    try {
      const inTransitItems = items.filter((i) => ["in_transit", "confirmed", "shipped"].includes(String(i.item_status || "").toLowerCase()));
      const item = inTransitItems[0];

      if (!item) {
        alert("No in-transit item found to resend OTP");
        return;
      }

      setResendLoading(true);
      const res = await api.post("/vendor/resend-otp", { item_id: item.id });
      alert("🔑 " + (res.data?.message || "New OTP sent to customer via email & notification!"));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "id") {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }
  };

  if (!order) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-3 border-primary border-t-transparent mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading order details...</p>
      </div>
    );
  }

  const hasPlaced = items.some((i) => ["placed", "pending"].includes(String(i.item_status || "").toLowerCase()));
  const hasInTransit = items.some((i) => ["in_transit", "confirmed", "shipped"].includes(String(i.item_status || "").toLowerCase()));
  const allDelivered = items.length > 0 && items.every((i) => String(i.item_status || "").toLowerCase() === "delivered");

  const currentStage = allDelivered ? 3 : hasInTransit ? 2 : 1;
  const totalEarnings = items.reduce((acc, curr) => acc + Number(curr.vendor_earning || curr.price_at_purchase || 0), 0);

  const formattedAddress = [
    order.house_no,
    order.street,
    order.locality,
    order.city,
    order.state,
    order.pincode
  ].filter(Boolean).join(", ");

  const orderDisplayId = String(order.id || "").slice(0, 8).toUpperCase();
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split("T")[0];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto py-3 px-1 sm:px-4">
      {/* 0. BREADCRUMB & NAVIGATION ACTION BAR */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <button
          onClick={() => navigate("/vendor/orders")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition shadow-2xs active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Orders List</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(order.id, "id")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-mono font-bold transition shadow-2xs"
            title="Copy Full Order ID"
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>#{orderDisplayId}</span>
          </button>
        </div>
      </div>

      {/* 1. VISUAL STATUS PROGRESS STEPPER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-primary">
              Order #{orderDisplayId}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"}
            </p>
          </div>

          <div>
            {allDelivered ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Delivered & Completed
              </span>
            ) : hasInTransit ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 shadow-2xs">
                <Truck className="w-4 h-4 text-blue-600" /> In Transit (OTP Active)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
                <Package className="w-4 h-4 text-amber-600" /> Pending Vendor Acceptance
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Stepper Visual Bar */}
        <div className="pt-2">
          <div className="relative flex items-center justify-between max-w-2xl mx-auto">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
            
            {/* Active Progress Line */}
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-500"
              style={{
                width: currentStage === 3 ? "100%" : currentStage === 2 ? "50%" : "0%"
              }}
            />

            {/* Step 1: Order Placed */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition ${
                currentStage >= 1 ? "bg-primary text-white shadow-md ring-4 ring-primary/15" : "bg-slate-100 text-slate-400"
              }`}>
                <Package className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold ${currentStage >= 1 ? "text-slate-900" : "text-slate-400"}`}>
                1. Pending Acceptance
              </span>
            </div>

            {/* Step 2: In Transit */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition ${
                currentStage >= 2 ? "bg-primary text-white shadow-md ring-4 ring-primary/15" : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}>
                <Truck className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold ${currentStage >= 2 ? "text-slate-900" : "text-slate-400"}`}>
                2. In Transit
              </span>
            </div>

            {/* Step 3: Delivered */}
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition ${
                currentStage >= 3 ? "bg-emerald-600 text-white shadow-md ring-4 ring-emerald-600/15" : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold ${currentStage >= 3 ? "text-emerald-700" : "text-slate-400"}`}>
                3. Delivered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CORE INTERACTIVE FULFILLMENT ACTION HUB */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 font-primary">
              Order Fulfillment Controls
            </h2>
            <p className="text-xs text-slate-500">Update order status stage and verify customer OTP</p>
          </div>
        </div>

        {/* STAGE A: ORDER PLACED → IN TRANSIT */}
        {hasPlaced && (
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-amber-200/80 text-amber-900">
                Action Required • Step 1 of 2
              </div>
              <h3 className="text-base font-bold text-amber-950 mt-2">
                Accept Order & Dispatch ("Set In Transit")
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Review this incoming order and click <strong>Accept & Set In Transit</strong> below when ready to dispatch. A 6-digit delivery OTP will be generated and automatically sent to the buyer via email and in-app notification.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold text-slate-700 block">Select Delivery Schedule Date:</label>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setDate(todayStr); setInTransit(todayStr); }}
                  disabled={confirmLoading}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition"
                >
                  Dispatch Today
                </button>

                <button
                  type="button"
                  onClick={() => { setDate(tomorrowStr); setInTransit(tomorrowStr); }}
                  disabled={confirmLoading}
                  className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition"
                >
                  Dispatch Tomorrow
                </button>

                <input
                  type="date"
                  value={date}
                  min={todayStr}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setInTransit(date)}
                  disabled={confirmLoading}
                  className="bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 inline-flex items-center gap-2.5"
                >
                  <Truck className="w-4 h-4" />
                  <span>{confirmLoading ? "Updating Status..." : "Set to In Transit & Send Delivery OTP"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE B: IN TRANSIT → DELIVERED (WITH OTP & RESEND) */}
        {!hasPlaced && hasInTransit && !allDelivered && (
          <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200/90 space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-blue-200/80 text-blue-900">
                Action Required • Step 2 of 2
              </div>
              <h3 className="text-base font-bold text-blue-950 mt-2">
                Verify Customer OTP & Mark as "Delivered"
              </h3>
              <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                The customer has received their 6-digit Delivery OTP via email and notification bell. Ask the customer for their OTP upon package handover.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div className="max-w-xs space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Enter Customer 6-Digit OTP:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 482910"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-blue-300 bg-white text-lg font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-primary shadow-2xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDeliverClick}
                  disabled={confirmLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" />
                  <span>{confirmLoading ? "Verifying OTP..." : "Verify OTP & Complete Delivery"}</span>
                </button>

                <button
                  onClick={handleResendOtp}
                  disabled={resendLoading || confirmLoading}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-3 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50 inline-flex items-center gap-2 shadow-2xs"
                  title="Resend new OTP to customer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-primary ${resendLoading ? "animate-spin" : ""}`} />
                  <span>{resendLoading ? "Resending..." : "Resend OTP to Customer"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE C: DELIVERED SUCCESS */}
        {allDelivered && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5 text-emerald-900">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-extrabold text-emerald-950 text-base">Order Status: Delivered</h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                This order item has been verified with OTP and successfully marked as delivered. The payout earnings have been settled to your registered bank account.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 3. CUSTOMER & DELIVERY DESTINATION DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer Profile Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4.5 h-4.5 text-primary" />
            Customer Contact Information
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                {order.customer_name ? order.customer_name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-sm">{order.customer_name || "Valued Customer"}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {order.customer_email || "Email on record"}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Phone Number</span>
              <a 
                href={`tel:${order.phone}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline mt-0.5"
              >
                <Phone className="w-3.5 h-3.5" />
                {order.phone || "N/A"}
              </a>
            </div>
          </div>
        </div>

        {/* Delivery Address Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <MapPin className="w-4.5 h-4.5 text-primary" />
              Delivery Address
            </h2>

            {formattedAddress && (
              <button
                onClick={() => copyToClipboard(formattedAddress, "addr")}
                className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1"
                title="Copy Address"
              >
                {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAddr ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>

          <div className="text-xs space-y-1 text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <p><strong>Flat / House No:</strong> {order.house_no || "N/A"}</p>
            <p><strong>Street / Area:</strong> {order.street || "N/A"}</p>
            <p><strong>Locality:</strong> {order.locality || "N/A"}</p>
            <p><strong>City / State:</strong> {order.city || "City"}, {order.state || "State"}</p>
            <p><strong>Pincode:</strong> <strong className="text-slate-900 font-mono font-bold">{order.pincode}</strong></p>
          </div>
        </div>
      </div>

      {/* 4. ORDERED PRODUCTS & PAYOUT BREAKDOWN */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Package className="w-4.5 h-4.5 text-primary" />
            Ordered Items ({items.length})
          </h2>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Payment:</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md uppercase">
              {order.payment_method || "COD"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const imageUrl = item.image_url
              ? item.image_url.startsWith("http")
                ? item.image_url
                : `http://localhost:5000/uploads/${item.image_url}`
              : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80";

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1 shrink-0 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={item.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80";
                      }}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="bg-slate-200/70 text-slate-800 px-2 py-0.5 rounded-md font-bold">
                        Qty: {item.quantity || 1}
                      </span>
                      <span>•</span>
                      <span>Price: <strong className="text-slate-800">₹{Number(item.price_at_purchase || 0).toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <span className="text-xs font-semibold text-emerald-800 sm:text-right">Your Payout</span>
                  <span className="font-extrabold text-slate-900 text-lg sm:text-xl font-primary">
                    ₹{Number(item.vendor_earning || item.price_at_purchase || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial Summary */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-emerald-50/60 p-4 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-emerald-900 font-bold">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>0% Commission Charged • 100% Sales Earning Settled to Vendor</span>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 mr-2">Total Vendor Earnings:</span>
            <span className="text-xl font-extrabold text-slate-900 font-primary">
              ₹{totalEarnings.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}