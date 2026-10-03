import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getUserOrders } from "../../services/orderService";
import api from "../../services/api";
import TrackingModal from "../../components/TrackingModal";
import socket from "../../services/socket";
import { XCircle, RefreshCw, CheckCircle2, AlertTriangle, Clock, CreditCard, ShieldCheck } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingItemId, setTrackingItemId] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [searchParams] = useSearchParams();
  const highlightedOrderId = searchParams.get("orderId");

  const fetchOrders = async () => {
    try {
      const res = await getUserOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.log(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleOrderUpdated = () => {
      console.log("⚡ Order update event received via Socket.io - refreshing orders");
      fetchOrders();
    };

    socket.on("order_updated", handleOrderUpdated);
    return () => {
      socket.off("order_updated", handleOrderUpdated);
    };
  }, []);

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    try {
      setCancelling(true);
      const res = await api.post("/orders/cancel", {
        order_id: cancelModalOrder.id,
        reason: cancelReason || "Cancelled by buyer"
      });
      alert(res.data.message || "Order cancelled successfully!");
      setCancelModalOrder(null);
      setCancelReason("");
      fetchOrders();
    } catch (err) {
      console.error("Cancel Error:", err);
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto py-2">
      <div>
        <h1 className="text-3xl font-primary font-bold text-textStrong">
          My Orders
        </h1>
        <p className="text-textDefault mt-2">
          View your order history, payment details, live tracking, and refund status in real-time.
        </p>
      </div>

      {loading && (
        <div className="text-textMuted py-8 text-center">
          Loading your orders...
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-8 text-center text-textMuted">
          No orders placed yet.
        </div>
      )}

      <div className="space-y-6">
        {orders.map((order) => {
          const isHighlighted = highlightedOrderId && String(order.id) === String(highlightedOrderId);
          const isCancelled = String(order.order_status || "").toLowerCase() === "cancelled";
          const allDelivered =
            !isCancelled &&
            order.items?.length > 0 &&
            order.items.every(i => String(i.item_status || "").toLowerCase() === "delivered");

          const anyInTransit =
            !isCancelled &&
            order.items?.some(i => ["in_transit", "confirmed", "shipped"].includes(String(i.item_status || "").toLowerCase()));

          // Buyer can cancel if order is in placed/pending status and not shipped/delivered/cancelled
          const canCancel =
            !isCancelled &&
            !allDelivered &&
            !anyInTransit &&
            ["placed", "pending"].includes(String(order.order_status || "placed").toLowerCase());

          return (
            <div
              key={order.id}
              id={`order-${order.id}`}
              className={`bg-bgSurface border rounded-2xl shadow-card p-6 space-y-4 transition-all duration-300 ${
                isHighlighted
                  ? "border-primary ring-2 ring-primary/20 bg-orange-50/20"
                  : "border-borderDefault"
              }`}
            >
              {/* ORDER HEADER */}
              <div className="flex justify-between items-center pb-3 border-b border-borderDefault">
                <div>
                  <p className="font-bold text-textStrong font-mono flex items-center gap-2">
                    Order ID: #{order.id.slice(0, 8).toUpperCase()}
                    {isHighlighted && (
                      <span className="text-[10px] uppercase font-extrabold bg-primary text-white px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </p>
                  <p className="text-textMuted text-xs mt-0.5">
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-primary font-extrabold text-lg">
                    ₹{order.total_amount}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Payment Method: <strong className="text-slate-800 uppercase">{order.payment_method || "ONLINE"}</strong>
                  </p>
                </div>
              </div>

              {/* OVERALL ORDER STATUS & PAYMENT BADGES */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Order Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                      isCancelled
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : allDelivered
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : anyInTransit
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {isCancelled
                      ? "Cancelled"
                      : allDelivered
                      ? "Delivered"
                      : anyInTransit
                      ? "In Transit"
                      : "Order Placed"}
                  </span>

                  {/* Payment Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                      order.payment_status === "refunded"
                        ? "bg-purple-100 text-purple-800 border border-purple-200"
                        : order.payment_status === "paid"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Payment: {String(order.payment_status || "paid").toUpperCase()}
                  </span>
                </div>

                {/* Cancel Order Button */}
                {canCancel && (
                  <button
                    onClick={() => setCancelModalOrder(order)}
                    className="text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 px-3.5 py-1.5 rounded-xl transition shadow-2xs inline-flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel Order
                  </button>
                )}
              </div>

              {/* REFUND STATUS DETAILS BOX */}
              {(isCancelled || (order.refund_status && order.refund_status !== "none")) && (
                <div className="p-4 rounded-xl bg-orange-50/80 border border-orange-200 text-xs text-slate-700 space-y-1.5">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin-slow" />
                    <span>Refund Status: {order.refund_status === "refunded" ? "Completed / Refunded" : "Processing"}</span>
                  </div>
                  <p className="leading-relaxed">
                    {order.refund_note || "Your full order refund of ₹" + order.total_amount + " has been initiated automatically and will be credited to your original payment method in 3–5 business days."}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Refund Amount: <strong className="text-slate-900 font-bold">₹{order.refund_amount || order.total_amount}</strong> • Target Timeline: <strong className="text-slate-900">3–5 Business Days</strong>
                  </p>
                </div>
              )}

              {/* ORDER ITEMS */}
              <div className="space-y-3 pt-1">
                {order.items?.map((item) => {
                  const s = String(item.item_status || "placed").toLowerCase();
                  const isInTransit = ["in_transit", "confirmed", "shipped"].includes(s);
                  const isDelivered = s === "delivered";
                  const itemCancelled = s === "cancelled";

                  return (
                    <div
                      key={item.id}
                      onClick={() => !itemCancelled && setTrackingItemId(item.id)}
                      className={`flex justify-between items-center border rounded-xl p-3.5 ${
                        itemCancelled
                          ? "bg-slate-50 border-slate-200 opacity-70"
                          : "border-slate-100 hover:bg-slate-50 cursor-pointer"
                      } transition`}
                    >
                      <div className="space-y-1">
                        <p className="text-textStrong font-bold text-sm">
                          {item.product_title}
                        </p>

                        <p className="text-textMuted text-xs">
                          Quantity: {item.quantity} • Price: ₹{item.price_at_purchase}
                        </p>

                        {/* ITEM STATUS */}
                        <p className={`text-xs font-bold ${
                          itemCancelled
                            ? "text-red-600"
                            : isDelivered
                            ? "text-emerald-600"
                            : isInTransit
                            ? "text-blue-600"
                            : "text-amber-600"
                        }`}>
                          Status: {itemCancelled ? "Cancelled" : isDelivered ? "Delivered" : isInTransit ? "In Transit (OTP sent to email)" : "Placed (Awaiting Vendor Acceptance)"}
                        </p>

                        {item.delivery_date && !itemCancelled && (
                          <p className="text-[11px] text-gray-400">
                            Expected Delivery: {new Date(item.delivery_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {item.health_rating && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.health_rating === "Healthy"
                              ? "bg-green-100 text-successText"
                              : "bg-red-100 text-dangerText"
                          }`}
                        >
                          {item.health_rating}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CANCEL CONFIRMATION MODAL */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h3 className="text-xl font-bold text-slate-900">Cancel Order #{cancelModalOrder.id.slice(0, 8).toUpperCase()}</h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to cancel this order? Since this order has not yet been dispatched by the vendor, full refund of <strong className="text-slate-900">₹{cancelModalOrder.total_amount}</strong> will be automatically initiated and credited to your original payment method in <strong>3–5 business days</strong>.
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

            <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200 text-xs text-orange-800 font-medium">
              ℹ️ Refund Timeline: 3–5 Business Days to original source account via Razorpay.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelModalOrder(null)}
                disabled={cancelling}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Go Back
              </button>

              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {trackingItemId && (
        <TrackingModal
          itemId={trackingItemId}
          onClose={() => setTrackingItemId(null)}
        />
      )}
    </div>
  );
}