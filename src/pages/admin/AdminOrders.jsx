import { useEffect, useState } from "react";
import api from "../../services/api";
import { 
  ShoppingBag, Search, Filter, CreditCard, RefreshCw, 
  User, Store, CheckCircle2, Clock, XCircle, Edit3, ShieldAlert 
} from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'refunds', 'payouts'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editRefundStatus, setEditRefundStatus] = useState("none");
  const [editPaymentStatus, setEditPaymentStatus] = useState("paid");
  const [editPayoutStatus, setEditPayoutStatus] = useState("pending");
  const [editPayoutRef, setEditPayoutRef] = useState("");
  const [editRefundNote, setEditRefundNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/orders");
      setOrders(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenEditModal = (order) => {
    setSelectedOrder(order);
    setEditRefundStatus(order.refund_status || "none");
    setEditPaymentStatus(order.payment_status || "paid");
    setEditPayoutStatus(order.payout_status || "pending");
    setEditPayoutRef(order.payout_reference || "");
    setEditRefundNote(order.refund_note || "");
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      await api.put("/admin/orders/update-status", {
        order_id: selectedOrder.order_id,
        refund_status: editRefundStatus,
        payment_status: editPaymentStatus,
        payout_status: editPayoutStatus,
        payout_reference: editPayoutRef,
        refund_note: editRefundNote
      });
      alert("🎉 Order Payment, Refund, and Vendor Payout Status updated successfully!");
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error("Update Status Error:", err);
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "delivered") return "bg-emerald-100 text-emerald-800 border border-emerald-200";
    if (s === "in_transit" || s === "confirmed") return "bg-blue-100 text-blue-800 border border-blue-200";
    if (s === "cancelled") return "bg-red-100 text-red-800 border border-red-200";
    return "bg-amber-100 text-amber-800 border border-amber-200";
  };

  const getRefundBadge = (status) => {
    const s = String(status || "none").toLowerCase();
    if (s === "refunded") return "bg-purple-100 text-purple-800 border border-purple-200";
    if (s === "processing") return "bg-orange-100 text-orange-800 border border-orange-200";
    return "bg-slate-100 text-slate-600 border border-slate-200";
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      String(o.order_id || "").toLowerCase().includes(q) ||
      String(o.buyer_name || "").toLowerCase().includes(q) ||
      String(o.buyer_email || "").toLowerCase().includes(q) ||
      String(o.business_name || "").toLowerCase().includes(q) ||
      String(o.product_name || "").toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTab === "refunds") {
      return (
        String(o.order_status).toLowerCase() === "cancelled" ||
        (o.refund_status && o.refund_status !== "none")
      );
    }
    if (activeTab === "payouts") {
      return String(o.payout_status).toLowerCase() === "pending";
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-primary font-bold text-slate-900">
            Admin Orders & Payment Management
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Monitor all buyer purchases, vendor payouts, payment statuses, and refund processing in real time.
          </p>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("refunds")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "refunds"
                ? "bg-white text-primary shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refunds & Cancelled ({orders.filter(o => String(o.order_status).toLowerCase() === "cancelled" || (o.refund_status && o.refund_status !== "none")).length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Order ID, Buyer Name, Vendor, or Product..."
          className="w-full text-xs pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-medium">
          Loading platform orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-2xs">
          No orders found matching the filter criteria.
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Order ID & Date</th>
                  <th className="px-5 py-4">Buyer Details</th>
                  <th className="px-5 py-4">Vendor & Product</th>
                  <th className="px-5 py-4">Amount & Method</th>
                  <th className="px-5 py-4">Order Status</th>
                  <th className="px-5 py-4">Payment Status</th>
                  <th className="px-5 py-4">Refund Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredOrders.map((o) => {
                  const totalAmt = Number(o.price_at_purchase || 0) * Number(o.quantity || 1);
                  return (
                    <tr key={`${o.order_id}-${o.item_id}`} className="hover:bg-slate-50/80 transition">
                      {/* Order ID */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-mono font-bold text-slate-900">
                          #{String(o.order_id).slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(o.created_at).toLocaleDateString()}
                        </p>
                      </td>

                      {/* Buyer Details */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{o.buyer_name || "Customer"}</p>
                        <p className="text-[11px] text-slate-400">{o.buyer_email || "N/A"}</p>
                      </td>

                      {/* Vendor & Product */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">{o.product_name || "Product"}</p>
                        <p className="text-[11px] text-slate-500">
                          Store: <span className="font-semibold text-slate-700">{o.business_name || "Vendor"}</span> (Qty: {o.quantity})
                        </p>
                      </td>

                      {/* Amount & Method */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="font-extrabold text-primary text-sm">₹{totalAmt}</p>
                        <p className="text-[11px] text-slate-400 font-mono uppercase">
                          {o.payment_method || "ONLINE"}
                        </p>
                      </td>

                      {/* Order Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${getStatusBadge(o.order_status)}`}>
                          {o.order_status || "placed"}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {o.payment_status || "paid"}
                        </span>
                      </td>

                      {/* Refund Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${getRefundBadge(o.refund_status)}`}>
                          {o.refund_status || "none"}
                        </span>
                        {o.refund_note && (
                          <p className="text-[10px] text-slate-400 max-w-xs truncate mt-0.5" title={o.refund_note}>
                            {o.refund_note}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(o)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 hover:bg-orange-100 text-primary border border-orange-200 transition inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Update Payment/Refund
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADMIN EDIT PAYMENT & REFUND MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Update Payment & Refund
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <p>Order ID: <strong className="text-slate-900 font-mono">#{String(selectedOrder.order_id).slice(0, 8).toUpperCase()}</strong></p>
              <p>Buyer: <strong className="text-slate-900">{selectedOrder.buyer_name}</strong> ({selectedOrder.buyer_email})</p>
              <p>Total Amount: <strong className="text-primary font-bold">₹{Number(selectedOrder.price_at_purchase) * Number(selectedOrder.quantity)}</strong></p>
            </div>

            {/* Refund Status Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Refund Status
              </label>
              <select
                value={editRefundStatus}
                onChange={(e) => setEditRefundStatus(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="none">None (No Refund)</option>
                <option value="processing">Processing (Refund Pending)</option>
                <option value="refunded">Refunded (Completed)</option>
              </select>
            </div>

            {/* Vendor Payout Status Selector */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-primary" /> Vendor Payout Settlement
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Payout Status
                </label>
                <select
                  value={editPayoutStatus}
                  onChange={(e) => setEditPayoutStatus(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="pending">Pending Settlement</option>
                  <option value="paid">Paid (Disbursed to Vendor)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Payout Reference ID (UTR / Txn ID)
                </label>
                <input
                  type="text"
                  value={editPayoutRef}
                  onChange={(e) => setEditPayoutRef(e.target.value)}
                  placeholder="e.g. UTR982183921 / PAY-1002"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Refund Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Refund Note for Buyer (Optional)
              </label>
              <textarea
                value={editRefundNote}
                onChange={(e) => setEditRefundNote(e.target.value)}
                placeholder="e.g. Refund of ₹... processed via Razorpay reference #..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                disabled={updating}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition shadow-xs disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Changes & Notify Buyer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}