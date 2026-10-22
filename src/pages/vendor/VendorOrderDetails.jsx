import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../../services/api";
import { 
  ArrowLeft, Package, User, Phone, MapPin, 
  Calendar, CheckCircle2, Clock, AlertCircle, 
  ShieldCheck, ChevronDown, ChevronUp, Truck, KeyRound,
  RefreshCw, Copy, Check, Mail, CreditCard, Sparkles,
  TrendingUp, Navigation, ExternalLink, ArrowRight
} from "lucide-react";

import socket from "../../services/socket";

export default function VendorOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlItemId = searchParams.get("itemId");

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(urlItemId || null);
  const [activeCommissionRate, setActiveCommissionRate] = useState(null);

  // Per-item input states
  const [itemDates, setItemDates] = useState({});
  const [itemOtps, setItemOtps] = useState({});
  const [itemLoadings, setItemLoadings] = useState({});

  const [copiedId, setCopiedId] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);

  /* ================= FETCH ORDER ================= */
  const fetchOrder = async () => {
    try {
      const res = await api.get(`/vendor/orders/${id}`);
      setOrder(res.data.order);
      const fetchedItems = res.data.items || [];
      setItems(fetchedItems);
      if (res.data.commission_percent !== undefined && res.data.commission_percent !== null) {
        setActiveCommissionRate(res.data.commission_percent);
      }

      // If urlItemId was passed, make sure it's selected; otherwise default to first item if present
      if (urlItemId) {
        const found = fetchedItems.find((i) => String(i.id) === String(urlItemId));
        if (found) {
          setSelectedItemId(found.id);
        }
      } else if (fetchedItems.length === 1) {
        setSelectedItemId(fetchedItems[0].id);
      }
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

  // Sync selectedItemId when urlItemId changes
  useEffect(() => {
    if (urlItemId && items.length > 0) {
      const found = items.find((i) => String(i.id) === String(urlItemId));
      if (found) setSelectedItemId(found.id);
    }
  }, [urlItemId, items]);

  const handleSelectItem = (itemId) => {
    setSelectedItemId(itemId);
    if (itemId) {
      setSearchParams({ itemId });
    } else {
      setSearchParams({});
    }
  };

  /* ================= STEP 1: SET IN TRANSIT (PER ITEM) ================= */
  const handleSetInTransit = async (itemId, targetDate) => {
    try {
      setItemLoadings((prev) => ({ ...prev, [itemId]: { ...prev[itemId], transit: true } }));

      const finalDate = targetDate || itemDates[itemId] || new Date().toISOString().split("T")[0];

      await api.patch("/vendor/confirm-item", {
        item_id: itemId,
        delivery_date: finalDate
      });

      alert("🎉 Product item updated to IN TRANSIT! 6-Digit Delivery OTP sent to customer via Email and Notification.");
      fetchOrder();
    } catch (err) {
      console.error("Set in transit error:", err);
      alert(err.response?.data?.message || "Failed to update item status to In Transit");
    } finally {
      setItemLoadings((prev) => ({ ...prev, [itemId]: { ...prev[itemId], transit: false } }));
    }
  };

  /* ================= STEP 2: MARK DELIVERED WITH OTP (PER ITEM) ================= */
  const handleDeliverClick = async (itemId) => {
    const enteredOtp = itemOtps[itemId] || "";
    if (!enteredOtp || String(enteredOtp).trim().length === 0) {
      alert("Please enter the 6-digit delivery OTP provided by the customer for this product item.");
      return;
    }

    try {
      setItemLoadings((prev) => ({ ...prev, [itemId]: { ...prev[itemId], deliver: true } }));

      await api.patch("/vendor/deliver-item", {
        item_id: itemId,
        otp: String(enteredOtp).trim()
      });

      alert("✅ OTP Verified successfully! Product item marked as DELIVERED.");
      setItemOtps((prev) => ({ ...prev, [itemId]: "" }));
      fetchOrder();
    } catch (err) {
      console.error("Deliver error:", err);
      alert(err.response?.data?.message || "Delivery OTP verification failed. Please check the OTP.");
    } finally {
      setItemLoadings((prev) => ({ ...prev, [itemId]: { ...prev[itemId], deliver: false } }));
    }
  };

  /* ================= RESEND OTP (PER ITEM) ================= */
  const handleResendOtp = async (itemId) => {
    try {
      setItemLoadings((prev) => ({ ...prev, [itemId]: { ...prev[itemId], resend: true } }));

      const res = await api.post("/vendor/resend-otp", { item_id: itemId });
      alert("🔑 " + (res.data?.message || "New OTP sent to customer via email & notification!"));
    } catch (err) {
      console.error("Resend OTP error:", err);
      alert(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setItemLoadings((prev) => ({ ...prev, [itemId]: { ...prev[itemId], resend: false } }));
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

  const orderDisplayId = String(order.id || "").slice(0, 8).toUpperCase();
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split("T")[0];

  const formattedAddress = [
    order.house_no,
    order.street,
    order.locality,
    order.city,
    order.state,
    order.pincode
  ].filter(Boolean).join(", ");

  // If a specific item is selected, find it; otherwise show all
  const displayedItems = selectedItemId
    ? items.filter((i) => String(i.id) === String(selectedItemId))
    : items;

  // Render an individual item's fulfillment card
  const renderItemCard = (item, index) => {
    const status = String(item.item_status || "placed").toLowerCase();
    const isCancelled = status === "cancelled";
    const isDelivered = status === "delivered";
    const isInTransit = ["in_transit", "confirmed", "shipped"].includes(status);
    const isPlaced = ["placed", "pending"].includes(status);

    const currentStage = isDelivered ? 3 : isInTransit ? 2 : 1;

    const imageUrl = item.image_url
      ? item.image_url.startsWith("http")
        ? item.image_url
        : `http://localhost:5000/uploads/${item.image_url}`
      : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80";

    const loadingState = itemLoadings[item.id] || {};
    const itemDate = itemDates[item.id] || "";
    const itemOtp = itemOtps[item.id] || "";

    return (
      <div
        key={item.id}
        className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6"
      >
        {/* ITEM HEADER & PRODUCT INFO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200/90 p-1.5 shrink-0 flex items-center justify-center overflow-hidden shadow-2xs">
              <img
                src={imageUrl}
                alt={item.title || "Product"}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80";
                }}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  Item #{String(item.id).slice(0, 8)}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                  isCancelled
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : isDelivered
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : isInTransit
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {isCancelled && <AlertCircle className="w-3.5 h-3.5" />}
                  {isDelivered && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {isInTransit && <Truck className="w-3.5 h-3.5" />}
                  {isPlaced && <Package className="w-3.5 h-3.5" />}
                  <span className="capitalize">{isPlaced ? "Pending Acceptance" : isDelivered ? "Delivered" : isInTransit ? "In Transit" : status}</span>
                </span>
              </div>

              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {item.title || "Product Item"}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                <span>Quantity: <strong className="text-slate-900 font-bold">{item.quantity || 1}</strong></span>
                <span>•</span>
                <span>Unit Price: <strong className="text-slate-900 font-mono font-bold">₹{Number(item.price_at_purchase || 0).toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Vendor Financial Breakdown */}
          {(() => {
            const subtotal = (Number(item.price_at_purchase || 0)) * (item.quantity || 1);
            const fee = Number(item.commission_amount || 0);
            const earning = Number(item.vendor_earning || (subtotal - fee));
            const itemRate = subtotal > 0 && fee > 0 
              ? ((fee / subtotal) * 100).toFixed(1).replace(/\.0$/, "") 
              : (activeCommissionRate ?? 5);

            return (
              <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 sm:px-5 sm:py-3 rounded-2xl flex flex-col justify-between shrink-0 min-w-[210px] space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="text-[11px] font-medium">Item Subtotal:</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md font-medium">
                  <span className="text-[11px] flex items-center gap-1 font-semibold">
                    Platform Fee ({fee > 0 ? `${itemRate}%` : "0%"}):
                  </span>
                  <span className="font-bold font-mono">
                    -₹{fee.toLocaleString()}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-emerald-200 flex items-center justify-between gap-3">
                  <div className="text-[11px] sm:text-xs text-emerald-800 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Net Payout:</span>
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold text-emerald-950 font-primary">
                    ₹{earning.toLocaleString()}
                  </div>
                </div>
                <span className="text-[10px] text-emerald-700 text-right">
                  {fee > 0 ? `${itemRate}% marketplace commission deducted` : "100% Sales Earning Settled"}
                </span>
              </div>
            );
          })()}
        </div>

        {/* STEPPER JOURNEY FOR THIS SPECIFIC ITEM */}
        <div className="pt-1 pb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Item Delivery Journey
          </p>

          <div className="relative flex items-center justify-between max-w-xl mx-auto px-4">
            {/* Background Line */}
            <div className="absolute top-5 left-10 right-10 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
            
            {/* Active Progress Line */}
            <div 
              className="absolute top-5 left-10 h-1 bg-primary -translate-y-1/2 z-0 rounded-full transition-all duration-500"
              style={{
                width: isDelivered ? "calc(100% - 5rem)" : isInTransit ? "calc(50% - 2.5rem)" : "0%"
              }}
            />

            {/* Step 1: Placed */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition ${
                currentStage >= 1 ? "bg-primary text-white shadow-md ring-4 ring-primary/15" : "bg-slate-100 text-slate-400"
              }`}>
                <Package className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-bold ${currentStage >= 1 ? "text-slate-900" : "text-slate-400"}`}>
                1. Placed
              </span>
            </div>

            {/* Step 2: In Transit */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition ${
                currentStage >= 2 ? "bg-primary text-white shadow-md ring-4 ring-primary/15" : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}>
                <Truck className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-bold ${currentStage >= 2 ? "text-slate-900" : "text-slate-400"}`}>
                2. In Transit
              </span>
            </div>

            {/* Step 3: Delivered */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition ${
                currentStage >= 3 ? "bg-emerald-600 text-white shadow-md ring-4 ring-emerald-600/15" : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className={`text-[11px] font-bold ${currentStage >= 3 ? "text-emerald-700" : "text-slate-400"}`}>
                3. Delivered
              </span>
            </div>
          </div>
        </div>

        {/* INDEPENDENT FULFILLMENT CONTROLS FOR THIS ITEM */}
        <div className="pt-2 border-t border-slate-100">
          {/* STAGE A: PENDING ACCEPTANCE */}
          {isPlaced && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-md">
                  Action Required
                </span>
                <h3 className="text-sm sm:text-base font-bold text-amber-950">
                  Accept &amp; Dispatch "{item.title}"
                </h3>
              </div>

              <p className="text-xs text-amber-800 leading-relaxed">
                When ready to dispatch this specific product, select a delivery date and click <strong>Accept &amp; Set In Transit</strong>. A 6-digit delivery verification OTP will be automatically generated and sent to the customer via Email &amp; In-App Notification.
              </p>

              <div className="space-y-3 pt-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Delivery Schedule for This Item:
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setItemDates((prev) => ({ ...prev, [item.id]: todayStr }));
                      handleSetInTransit(item.id, todayStr);
                    }}
                    disabled={loadingState.transit}
                    className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    Dispatch Today
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setItemDates((prev) => ({ ...prev, [item.id]: tomorrowStr }));
                      handleSetInTransit(item.id, tomorrowStr);
                    }}
                    disabled={loadingState.transit}
                    className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    Dispatch Tomorrow
                  </button>

                  <input
                    type="date"
                    value={itemDate}
                    min={todayStr}
                    onChange={(e) => setItemDates((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    className="px-3.5 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-primary shadow-2xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleSetInTransit(item.id, itemDate)}
                    disabled={loadingState.transit}
                    className="bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>{loadingState.transit ? "Updating..." : "Accept & Set to In Transit (Send Delivery OTP)"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE B: IN TRANSIT → DELIVER WITH OTP */}
          {isInTransit && (
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/90 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-blue-200 text-blue-900 px-2.5 py-0.5 rounded-md">
                  In Transit • Verification Pending
                </span>
                <h3 className="text-sm sm:text-base font-bold text-blue-950">
                  Verify Delivery OTP for "{item.title}"
                </h3>
              </div>

              <p className="text-xs text-blue-800 leading-relaxed">
                This item is currently on its way to the buyer. Upon handing over this product to the customer, ask for the <strong>6-digit Delivery OTP</strong> sent to their email/app and verify below.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative w-full sm:w-56">
                  <KeyRound className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    maxLength={6}
                    value={itemOtp}
                    onChange={(e) => setItemOtps((prev) => ({ ...prev, [item.id]: e.target.value.replace(/\D/g, "") }))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-blue-300 rounded-xl text-sm font-mono font-extrabold tracking-widest text-slate-900 focus:outline-none focus:border-primary shadow-2xs placeholder:text-slate-300 placeholder:tracking-normal"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeliverClick(item.id)}
                  disabled={loadingState.deliver || !itemOtp || itemOtp.length < 4}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-40 inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loadingState.deliver ? "Verifying..." : "Verify OTP & Mark Delivered"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleResendOtp(item.id)}
                  disabled={loadingState.resend}
                  className="bg-white border border-blue-300 hover:bg-blue-100 text-blue-800 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-2xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingState.resend ? "animate-spin" : ""}`} />
                  <span>Resend OTP to Customer</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE C: DELIVERED */}
          {isDelivered && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Product Item Successfully Delivered
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Customer OTP verified. Payout of ₹{Number(item.vendor_earning || item.price_at_purchase || 0).toLocaleString()} credited to your payout settlement balance.
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full self-start sm:self-auto">
                Settled &amp; Completed
              </span>
            </div>
          )}

          {/* STAGE D: CANCELLED */}
          {isCancelled && (
            <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-950">
                  Product Item Cancelled
                </h4>
                <p className="text-xs text-red-700">
                  This item was cancelled prior to dispatch. No further delivery action is required.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto py-3 px-1 sm:px-4">
      {/* 0. BREADCRUMB & HEADER */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <button
          onClick={() => navigate("/vendor/orders")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition shadow-2xs active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Orders List</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => copyToClipboard(order.id, "id")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-mono font-bold transition shadow-2xs cursor-pointer"
            title="Copy Full Order ID"
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>#{orderDisplayId}</span>
          </button>
        </div>
      </div>

      {/* 1. ORDER SUMMARY & MULTI-ITEM SWITCHER */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                Vendor Order Fulfillment
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {items.length} {items.length === 1 ? "Product Item" : "Separate Product Items"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-primary mt-1">
              Order #{orderDisplayId}
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm">
              Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent"}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-500 font-medium">Payment Mode:</span>
            <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-lg uppercase">
              {order.payment_method || "Online"}
            </span>
          </div>
        </div>

        {/* ORDER FINANCIAL OVERVIEW */}
        {(() => {
          const totalGross = items.reduce((acc, it) => acc + (Number(it.price_at_purchase || 0) * (it.quantity || 1)), 0);
          const totalPlatformFee = items.reduce((acc, it) => acc + Number(it.commission_amount || 0), 0);
          const totalNetPayout = items.reduce((acc, it) => acc + Number(it.vendor_earning || ((Number(it.price_at_purchase || 0) * (it.quantity || 1)) - Number(it.commission_amount || 0))), 0);
          const effectiveRate = totalGross > 0 && totalPlatformFee > 0 
            ? ((totalPlatformFee / totalGross) * 100).toFixed(1).replace(/\.0$/, "") 
            : (activeCommissionRate ?? 5);

          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Items Gross Value</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">₹{totalGross.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Total retail sale price</span>
              </div>
              <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/70">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Platform Commission ({totalPlatformFee > 0 ? `${effectiveRate}%` : `${effectiveRate}% Rate`})
                </span>
                <span className="text-base font-extrabold text-amber-800 font-mono">-₹{totalPlatformFee.toLocaleString()}</span>
                <span className="text-[10px] text-amber-700 block mt-0.5">
                  {totalPlatformFee > 0 ? `Deducted by platform fee policy` : `Platform fee rate: ${effectiveRate}%`}
                </span>
              </div>
              <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/70">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Your Net Settlement</span>
                <span className="text-base font-extrabold text-emerald-950 font-mono">₹{totalNetPayout.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">Credited to your payout balance</span>
              </div>
            </div>
          );
        })()}

        {/* MULTI-ITEM TABS: If order has multiple items, let the vendor focus on one or view all */}
        {items.length > 1 && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Manage Products Separately ({items.length} items in this order):
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {items.map((item, idx) => {
                const isSelected = selectedItemId && String(selectedItemId) === String(item.id);
                const s = String(item.item_status || "placed").toLowerCase();
                const isDelivered = s === "delivered";
                const isInTransit = ["in_transit", "confirmed", "shipped"].includes(s);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-2xs ring-2 ring-slate-900 ring-offset-1"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span className="truncate max-w-[160px]">{item.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : isDelivered
                        ? "bg-emerald-100 text-emerald-800"
                        : isInTransit
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {isDelivered ? "Delivered" : isInTransit ? "In Transit" : "Pending"}
                    </span>
                  </button>
                );
              })}

              <button
                onClick={() => handleSelectItem(null)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  !selectedItemId
                    ? "bg-slate-900 text-white shadow-2xs ring-2 ring-slate-900 ring-offset-1"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                View All Items ({items.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. CUSTOMER & DELIVERY ADDRESS INFORMATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Contact Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4.5 h-4.5 text-primary" />
            <span>Customer Contact Information</span>
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
              <span>Delivery Address</span>
            </h2>

            {formattedAddress && (
              <button
                onClick={() => copyToClipboard(formattedAddress, "addr")}
                className="text-xs font-bold text-slate-500 hover:text-primary flex items-center gap-1 cursor-pointer"
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

      {/* 3. SEPARATE ITEM FULFILLMENT CARDS */}
      <div className="space-y-6">
        {displayedItems.map((item, idx) => renderItemCard(item, idx))}
      </div>
    </div>
  );
}