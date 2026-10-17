import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getOrderDetails } from "../../services/orderService";
import api from "../../services/api";
import TrackingModal from "../../components/TrackingModal";
import socket from "../../services/socket";
import { 
  ArrowLeft, Package, Clock, Truck, CheckCircle2, 
  XCircle, AlertTriangle, RefreshCw, CreditCard, 
  MapPin, Phone, User, ExternalLink, ShieldCheck, 
  HelpCircle, Copy, Check, Eye
} from "lucide-react";

export default function CustomerOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackingItemId, setTrackingItemId] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  // Cancel order modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getOrderDetails(id);
      setOrder(res.data);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(err.response?.data?.message || "Order not found or unable to load details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    const handleOrderUpdated = (data) => {
      if (!data || data.orderId === id || String(data.orderId) === String(id)) {
        fetchOrder();
      }
    };

    socket.on("order_updated", handleOrderUpdated);
    return () => {
      socket.off("order_updated", handleOrderUpdated);
    };
  }, [id]);

  const copyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    try {
      setCancelling(true);
      const res = await api.post("/orders/cancel", {
        order_id: order.id,
        reason: cancelReason || "Cancelled by customer"
      });
      alert(res.data.message || "Order cancelled successfully!");
      setShowCancelModal(false);
      setCancelReason("");
      fetchOrder();
    } catch (err) {
      console.error("Cancel Error:", err);
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-sm">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-5 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{error || "The requested order could not be located."}</p>
        </div>
        <button
          onClick={() => navigate("/customer/orders")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-orange-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </button>
      </div>
    );
  }

  const isCancelled = String(order.order_status || "").toLowerCase() === "cancelled";
  const allDelivered =
    !isCancelled &&
    order.items?.length > 0 &&
    order.items.every(i => String(i.item_status || "").toLowerCase() === "delivered");

  const anyInTransit =
    !isCancelled &&
    (allDelivered ||
      ["in_transit", "shipped"].includes(String(order.order_status || "").toLowerCase()) ||
      order.items?.some(i => ["in_transit", "shipped"].includes(String(i.item_status || "").toLowerCase())));

  const isPaid = String(order.payment_status || "").toLowerCase() === "paid";

  const isConfirmed =
    !isCancelled &&
    (anyInTransit ||
      allDelivered ||
      isPaid ||
      ["confirmed", "processing"].includes(String(order.order_status || "").toLowerCase()) ||
      order.items?.some(i => ["confirmed", "processing", "in_transit", "shipped", "delivered"].includes(String(i.item_status || "").toLowerCase())));

  const canCancel =
    !isCancelled &&
    !allDelivered &&
    !anyInTransit &&
    ["placed", "pending", "confirmed"].includes(String(order.order_status || "placed").toLowerCase());

  // Determine current active step index (0: Placed, 1: Confirmed, 2: In Transit, 3: Delivered)
  let currentStep = 0;
  if (isCancelled) {
    currentStep = -1;
  } else if (allDelivered) {
    currentStep = 3;
  } else if (anyInTransit) {
    currentStep = 2;
  } else if (isConfirmed) {
    currentStep = 1;
  } else {
    currentStep = 0;
  }

  // Find delivery OTP if order or any item has one
  const activeOtp = order.delivery_otp || order.items?.find(i => i.delivery_otp)?.delivery_otp;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      
      {/* BREADCRUMB & BACK BUTTON */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/customer/orders")}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-primary transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to My Orders</span>
        </button>

        <Link
          to="/support"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Need Help?</span>
        </Link>
      </div>

      {/* ORDER HERO CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <button
                type="button"
                onClick={copyOrderId}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-primary bg-slate-100 hover:bg-orange-50 px-2 py-0.5 rounded-lg border border-slate-200/80 transition"
                title="Copy Full Order ID"
              >
                {copiedId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Status Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                isCancelled
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : allDelivered
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : anyInTransit
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : isConfirmed
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {isCancelled ? (
                <>
                  <XCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Order Cancelled</span>
                </>
              ) : allDelivered ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Delivered</span>
                </>
              ) : anyInTransit ? (
                <>
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>In Transit</span>
                </>
              ) : isConfirmed ? (
                <>
                  <Package className="w-3.5 h-3.5 text-amber-600" />
                  <span>Confirmed</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-slate-600" />
                  <span>Order Placed</span>
                </>
              )}
            </span>

            {/* Payment Badge */}
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/80 inline-flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              <span>{String(order.payment_status || "paid").toUpperCase()} ({order.payment_method || "ONLINE"})</span>
            </span>
          </div>
        </div>

        {/* DELIVERY OTP SECURITY BANNER (IF IN TRANSIT) */}
        {activeOtp && !isCancelled && !allDelivered && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Secure Delivery OTP
                </h4>
                <p className="text-xs text-blue-700 mt-0.5">
                  Share this 6-digit verification code with your delivery partner upon arrival.
                </p>
              </div>
            </div>
            <div className="bg-white border-2 border-blue-300 rounded-xl px-4 py-2 text-center self-start sm:self-auto shadow-2xs">
              <span className="font-mono text-xl sm:text-2xl font-black text-blue-900 tracking-widest">
                {activeOtp}
              </span>
            </div>
          </div>
        )}

        {/* REFUND STATUS DETAILS BOX */}
        {(isCancelled || (order.refund_status && order.refund_status !== "none")) && (
          <div className="p-4 sm:p-5 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Refund Status: {order.refund_status === "refunded" ? "Completed / Refunded" : "Processing"}</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              {order.refund_note || `Your full order refund of ₹${order.total_amount} has been initiated automatically and will be credited to your original payment method in 3–5 business days.`}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1 font-medium text-slate-700">
              <span>Refund Amount: <strong className="text-slate-900 font-bold">₹{order.refund_amount || order.total_amount}</strong></span>
              <span>•</span>
              <span>Timeline: <strong className="text-slate-900">3–5 Business Days</strong></span>
            </div>
          </div>
        )}

        {/* ORDER PROGRESS STEPPER */}
        <div className="p-5 sm:p-7 rounded-3xl bg-slate-50/70 border border-slate-200/90 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isCancelled ? "bg-red-500" : allDelivered ? "bg-emerald-500" : "bg-primary animate-pulse"}`} />
                <span>Order Status Journey</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isCancelled
                  ? "Order was cancelled and processing halted."
                  : allDelivered
                  ? "All items have been safely delivered to your address."
                  : anyInTransit
                  ? "Shipment is in transit and out for delivery."
                  : isConfirmed
                  ? "Order confirmed and being prepared by the vendor."
                  : "Order placed and awaiting vendor confirmation."}
              </p>
            </div>

            <span className={`text-[11px] font-bold px-3 py-1 rounded-full self-start sm:self-auto border ${
              isCancelled
                ? "bg-red-50 text-red-700 border-red-200"
                : allDelivered
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : anyInTransit
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : isConfirmed
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}>
              {isCancelled
                ? "Cancelled"
                : allDelivered
                ? "Delivered"
                : anyInTransit
                ? "In Transit"
                : isConfirmed
                ? "Confirmed"
                : "Placed"}
            </span>
          </div>

          {/* Stepper with connecting line / border */}
          <div className="relative pt-2 pb-1">
            {/* Horizontal connecting background track & progress bar */}
            <div className="absolute top-5 sm:top-6 left-[12.5%] right-[12.5%] -translate-y-1/2 h-1.5 bg-slate-200 rounded-full z-0 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isCancelled
                    ? "bg-red-400"
                    : "bg-gradient-to-r from-primary to-orange-500"
                }`}
                style={{
                  width: isCancelled
                    ? "0%"
                    : currentStep === 3
                    ? "100%"
                    : currentStep === 2
                    ? "66.6%"
                    : currentStep === 1
                    ? "33.3%"
                    : "0%"
                }}
              />
            </div>

            {/* Stepper nodes */}
            <div className="grid grid-cols-4 relative z-10">
              {[
                { label: "Placed", sublabel: "Order Placed", icon: Clock },
                { label: "Confirmed", sublabel: isPaid ? "Payment Verified" : "Store Confirmed", icon: Package },
                { label: "In Transit", sublabel: anyInTransit ? "Out for Delivery" : "Shipped Soon", icon: Truck },
                { label: "Delivered", sublabel: allDelivered ? "Delivered" : "Final Destination", icon: CheckCircle2 }
              ].map((step, idx) => {
                const StepIcon = step.icon;
                const isPassed = !isCancelled && idx < currentStep;
                const isCurrent = !isCancelled && idx === currentStep;
                const isDeliveredDone = isCurrent && idx === 3 && allDelivered;

                return (
                  <div key={idx} className="text-center flex flex-col items-center">
                    {/* Circle Node */}
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCancelled
                          ? idx === 0
                            ? "bg-slate-200 text-slate-600 border-2 border-slate-300"
                            : "bg-white text-slate-300 border-2 border-slate-200"
                          : isPassed || isDeliveredDone
                          ? "bg-primary text-white border-2 border-primary shadow-xs ring-4 ring-orange-100"
                          : isCurrent
                          ? "bg-white text-primary border-2 border-primary shadow-sm ring-4 ring-orange-100"
                          : "bg-white text-slate-300 border-2 border-slate-200"
                      }`}
                    >
                      {isPassed || isDeliveredDone ? (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                      ) : (
                        <StepIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${isCurrent && !isCancelled ? "animate-pulse" : ""}`} />
                      )}
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="mt-2 space-y-0.5 max-w-[120px] px-1">
                      <p
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isCancelled
                            ? idx === 0
                              ? "text-slate-700"
                              : "text-slate-400"
                            : isCurrent
                            ? "text-primary font-black"
                            : isPassed || isDeliveredDone
                            ? "text-slate-900"
                            : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">
                        {step.sublabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ITEMS IN THIS ORDER */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <span>Items in This Order ({order.items?.length || 0})</span>
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {order.items?.map((item) => {
            const s = String(item.item_status || "placed").toLowerCase();
            const isInTransit = ["in_transit", "confirmed", "shipped"].includes(s);
            const isItemDelivered = s === "delivered";
            const itemCancelled = s === "cancelled";

            const itemImage = item.image_url || (Array.isArray(item.images) ? item.images[0] : null);

            return (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.product_title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-slate-300" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <Link
                      to={item.product_id ? `/product/${item.product_id}` : "#"}
                      className="text-sm font-bold text-slate-900 hover:text-primary transition line-clamp-1"
                    >
                      {item.product_title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      Quantity: <strong className="text-slate-800">{item.quantity}</strong> • Price: <strong className="text-slate-800 font-mono">₹{item.price_at_purchase}</strong>
                    </p>
                    {item.vendor_name && (
                      <p className="text-[11px] text-slate-500">
                        Seller: <strong className="text-slate-700 font-medium">{item.vendor_name}</strong>
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        itemCancelled
                          ? "bg-red-50 text-red-700"
                          : isItemDelivered
                          ? "bg-emerald-50 text-emerald-700"
                          : isInTransit
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {itemCancelled ? "Cancelled" : isItemDelivered ? "Delivered" : isInTransit ? "In Transit" : "Placed"}
                      </span>


                    </div>
                  </div>
                </div>

                {/* Right: Item Total & Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                    ₹{Number(item.price_at_purchase) * Number(item.quantity)}
                  </span>
                  {!itemCancelled && (
                    <button
                      type="button"
                      onClick={() => setTrackingItemId(item.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-primary hover:bg-orange-100 border border-orange-200/80 transition"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Live Track</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-COLUMN SECTION: SHIPPING ADDRESS & PRICE SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SHIPPING ADDRESS CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Delivery Destination
            </h3>
          </div>

          {order.shipping_address ? (
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-900 text-sm">
                {order.shipping_address.full_name || "Customer"}
              </p>
              {order.shipping_address.phone && (
                <p className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{order.shipping_address.phone}</span>
                </p>
              )}
              <p className="text-slate-700">
                {[
                  order.shipping_address.house_no,
                  order.shipping_address.street,
                  order.shipping_address.locality,
                  order.shipping_address.landmark
                ].filter(Boolean).join(", ")}
              </p>
              <p className="font-semibold text-slate-800">
                {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Address details attached to primary account profile.
            </p>
          )}
        </div>

        {/* PAYMENT SUMMARY CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Payment Summary
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Items Total</span>
              <span className="font-mono font-semibold text-slate-800">₹{order.total_amount}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery Fee</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Payment Mode</span>
              <span className="font-semibold text-slate-800 uppercase">{order.payment_method || "ONLINE"}</span>
            </div>
            <div className="pt-2.5 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total Billed</span>
              <span className="text-lg font-black text-primary font-mono">₹{order.total_amount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Link
          to="/buy"
          className="text-xs font-bold text-slate-600 hover:text-primary transition"
        >
          ← Continue Shopping
        </Link>

        {canCancel && (
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl border border-red-200 transition active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            <span>Cancel This Order</span>
          </button>
        )}
      </div>

      {/* CANCEL ORDER MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h3 className="text-xl font-bold text-slate-900">
                Cancel Order #{order.id.slice(0, 8).toUpperCase()}
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to cancel this order? Since this order has not yet been dispatched, full refund of <strong className="text-slate-900 font-bold">₹{order.total_amount}</strong> will be initiated automatically to your original payment method in <strong>3–5 business days</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Cancellation Reason (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Ordered by mistake, wrong address, changing item choice..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TRACKING MODAL */}
      {trackingItemId && (
        <TrackingModal
          itemId={trackingItemId}
          onClose={() => setTrackingItemId(null)}
        />
      )}

    </div>
  );
}
