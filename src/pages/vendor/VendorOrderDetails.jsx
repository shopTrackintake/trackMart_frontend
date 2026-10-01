import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { 
  ArrowLeft, Package, User, Phone, MapPin, 
  Calendar, CheckCircle2, Clock, AlertCircle, 
  Copy, Check, Share2, ExternalLink, ShieldCheck, 
  ChevronDown, ChevronUp, Send
} from "lucide-react";

export default function VendorOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [date, setDate] = useState("");
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [otp, setOtp] = useState("");
  const [askOtp, setAskOtp] = useState(false);
  const [trackingLink, setTrackingLink] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTrackingPopup, setShowTrackingPopup] = useState(false);

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
  }, [id]);

  /* ================= CONFIRM ORDER ================= */
  const confirmOrder = async () => {
    try {
      setConfirmLoading(true);

      if (!date) {
        alert("Please select a delivery date");
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      if (date < today) {
        alert("Please select today or a future date");
        return;
      }

      const pendingItems = items.filter((i) => i.item_status === "pending");
      const item = pendingItems[0];

      if (!item) {
        alert("No pending item found");
        return;
      }

      await api.patch("/vendor/confirm-item", {
        item_id: item.id,
        delivery_date: date
      });

      const link = `${window.location.origin}/live/${item.id}`;
      setTrackingLink(link);
      setShowTrackingPopup(true);

      fetchOrder();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to confirm order");
    } finally {
      setConfirmLoading(false);
    }
  };

  /* ================= MARK DELIVERED ================= */
  const handleDeliverClick = async () => {
    if (!askOtp) {
      setAskOtp(true);
      return;
    }

    try {
      if (!otp) {
        alert("Please enter the 4-digit or 6-digit customer delivery OTP");
        return;
      }

      const item = items.find((i) => i.item_status === "confirmed");
      if (!item) {
        alert("No confirmed item found for delivery");
        return;
      }

      setConfirmLoading(true);
      await api.patch("/vendor/deliver-item", {
        item_id: item.id,
        otp
      });

      alert("Item verified and marked as delivered successfully!");
      setOtp("");
      setAskOtp(false);
      fetchOrder();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Delivery OTP verification failed");
    } finally {
      setConfirmLoading(false);
    }
  };

  if (!order) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent mb-3" />
        <p className="text-sm">Loading order details...</p>
      </div>
    );
  }

  const hasPending = items.some((i) => i.item_status === "pending");
  const hasConfirmed = items.some((i) => i.item_status === "confirmed");
  const allDelivered = items.length > 0 && items.every((i) => i.item_status === "delivered");

  const totalEarnings = items.reduce((acc, curr) => acc + Number(curr.price_at_purchase || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 0. TOP BREADCRUMB & ACTIONS */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <button
          onClick={() => navigate("/vendor/orders")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orders</span>
        </button>

        <span className="text-xs sm:text-sm font-bold text-slate-500">
          Order #{String(order.id || "").slice(0, 8)}
        </span>
      </div>

      {/* 1. HEADER CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold font-primary">
              <span className="text-primary">Order</span>{" "}
              <span className="text-slate-900">Details</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              #{String(order.id || "").slice(0, 8)}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Recent"}
          </p>
        </div>

        {/* Overall Status Badge */}
        <div>
          {allDelivered ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Delivered
            </span>
          ) : hasConfirmed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Clock className="w-4 h-4" /> Confirmed / In-Transit
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle className="w-4 h-4" /> Action Required (Pending)
            </span>
          )}
        </div>
      </div>

      {/* 2. CUSTOMER & DELIVERY ADDRESS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-primary" />
          Customer & Delivery Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-medium">Customer Name</span>
            <p className="font-bold text-slate-800 text-sm sm:text-base">
              {order.customer_name || "Valued Customer"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 text-xs font-medium">Contact Phone</span>
            <p className="font-bold text-slate-800 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <a href={`tel:${order.phone}`} className="hover:text-primary transition">
                {order.phone || "N/A"}
              </a>
            </p>
          </div>
        </div>

        {/* Expandable Address Box */}
        <div 
          onClick={() => setShowFullAddress(!showFullAddress)}
          className="mt-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              Delivery Destination
            </span>
            <span className="text-slate-400 text-xs flex items-center gap-1">
              <span>{showFullAddress ? "Hide Details" : "Show Full Address"}</span>
              {showFullAddress ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </div>

          {!showFullAddress ? (
            <p className="text-xs text-slate-600 mt-1 truncate">
              {order.city || "City"}, {order.state || "State"} - {order.pincode || ""}
            </p>
          ) : (
            <div className="mt-2.5 pt-2 border-t border-slate-200 text-xs space-y-1 text-slate-700">
              <p><strong>House / Flat:</strong> {order.house_no || "N/A"}</p>
              <p><strong>Street:</strong> {order.street || "N/A"}</p>
              <p><strong>Locality:</strong> {order.locality || "N/A"}</p>
              <p><strong>City / State:</strong> {order.city}, {order.state}</p>
              <p><strong>Postal Code:</strong> {order.pincode}</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. ORDERED PRODUCTS LIST */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Ordered Items ({items.length})
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Total Earning: <strong className="text-slate-900 text-sm">₹{totalEarnings.toLocaleString()}</strong>
          </span>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Delivery Schedule: {item.delivery_date ? new Date(item.delivery_date).toLocaleDateString() : "Pending Selection"}
                  </span>
                  <span>•</span>
                  <span className="capitalize font-semibold text-slate-700">Status: {item.item_status}</span>
                </div>
              </div>

              <div className="text-right sm:text-right flex items-center justify-between sm:block">
                <span className="text-xs text-slate-400 sm:hidden">Price</span>
                <span className="font-extrabold text-slate-900 text-base">
                  ₹{Number(item.price_at_purchase || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. DISPATCH & FULFILLMENT ACTION HUB */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Fulfillment Actions
        </h2>

        {/* Step A: Confirm & Schedule Delivery Date (If Pending) */}
        {hasPending && (
          <div className="space-y-3 p-4 rounded-xl bg-amber-50/60 border border-amber-200">
            <div>
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Step 1: Confirm Order & Schedule Dispatch
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Select the expected delivery date to schedule dispatch and generate live customer tracking link.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-sm focus:outline-none focus:border-primary font-medium"
              />

              <button
                onClick={confirmOrder}
                disabled={confirmLoading}
                className="bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {confirmLoading ? "Confirming..." : "Confirm & Generate Live Link"}
              </button>
            </div>
          </div>
        )}

        {/* Step B: Verify OTP & Mark Delivered (If Confirmed) */}
        {!hasPending && hasConfirmed && !allDelivered && (
          <div className="space-y-3 p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <div>
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Step 2: Customer Delivery Verification
              </h3>
              <p className="text-xs text-blue-800 mt-0.5">
                When handing over the package to the customer, ask for the 4/6-digit delivery OTP sent to their mobile/dashboard.
              </p>
            </div>

            <div className="space-y-3">
              {askOtp && (
                <div className="max-w-xs space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Enter Delivery OTP:</label>
                  <input
                    type="text"
                    placeholder="e.g. 482910"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-white text-sm focus:outline-none focus:border-primary font-bold tracking-widest text-slate-900"
                  />
                </div>
              )}

              <button
                onClick={handleDeliverClick}
                disabled={confirmLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-xs transition active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{askOtp ? "Verify OTP & Mark Delivered" : "Enter Delivery OTP"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step C: All Delivered */}
        {allDelivered && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-800 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>All items in this order have been verified and successfully delivered.</span>
          </div>
        )}
      </div>

      {/* 5. SHAREABLE LIVE TRACKING MODAL */}
      {showTrackingPopup && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowTrackingPopup(false)}
        >
          <div
            className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-5 animate-fadeIn border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🚚</span>
                <span>Live Delivery Link Generated</span>
              </h2>
              <button
                onClick={() => setShowTrackingPopup(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Share this live dispatch link with your delivery driver or customer for real-time order tracking:
            </p>

            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-slate-50">
              <input
                value={trackingLink}
                readOnly
                className="flex-1 px-3 py-2.5 text-xs text-slate-700 outline-none bg-transparent font-mono truncate"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(trackingLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="bg-primary hover:bg-primaryHover text-white px-4 py-2.5 text-xs font-bold transition shrink-0 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => {
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(
                      `Track your TrackMart delivery order here 🚚: ${trackingLink}`
                    )}`
                  );
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share on WhatsApp</span>
              </button>

              <button
                onClick={() => setShowTrackingPopup(false)}
                className="flex-1 border border-slate-200 hover:bg-slate-100 text-slate-700 py-2.5 rounded-xl text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}