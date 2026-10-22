import React, { useState, useEffect, useMemo, Fragment } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  ShoppingBag,
  Search,
  Filter,
  CreditCard,
  RefreshCw,
  User,
  Store,
  CheckCircle2,
  Clock,
  XCircle,
  Edit3,
  ShieldAlert,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  DollarSign,
  Download,
  Copy,
  Check,
  Truck,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Package,
  Sparkles,
  X,
  Layers,
  ArrowRight,
  Zap,
  LayoutGrid,
  List
} from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Layout View Mode: 'cards' (Responsive Grid) vs 'table' (Tabular View)
  const [viewMode, setViewMode] = useState("cards");

  // Quick Tab state: 'all', 'today', 'in_transit', 'delivered', 'refunds', 'payouts'
  const [activeTab, setActiveTab] = useState("all");

  // Detailed Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // 'all', 'today', 'yesterday', 'week', 'month'
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'placed', 'confirmed', 'in_transit', 'delivered', 'cancelled'
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all"); // 'all', 'paid', 'pending', 'failed'
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all"); // 'all', 'online', 'cod'
  const [vendorFilter, setVendorFilter] = useState("all");
  const [payoutFilter, setPayoutFilter] = useState("all"); // 'all', 'pending', 'paid'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'amount_desc', 'amount_asc'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Dossier Modal & Status Edit Modal states
  const [viewOrder, setViewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [editOrderStatus, setEditOrderStatus] = useState("");
  const [editRefundStatus, setEditRefundStatus] = useState("none");
  const [editPaymentStatus, setEditPaymentStatus] = useState("paid");
  const [editPayoutStatus, setEditPayoutStatus] = useState("pending");
  const [editPayoutRef, setEditPayoutRef] = useState("");
  const [editRefundNote, setEditRefundNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  /* ================= FETCH ORDERS ================= */
  const fetchOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      const res = await api.get("/admin/orders");
      setOrders(res.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      showToast("Failed to load platform orders", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ================= OPEN MODALS ================= */
  const handleOpenEdit = (order) => {
    setEditOrder(order);
    setEditOrderStatus(order.order_status || "placed");
    setEditRefundStatus(order.refund_status || "none");
    setEditPaymentStatus(order.payment_status || "paid");
    setEditPayoutStatus(order.payout_status || "pending");
    setEditPayoutRef(order.payout_reference || "");
    setEditRefundNote(order.refund_note || "");
  };

  const handleUpdateStatus = async () => {
    if (!editOrder) return;
    try {
      setUpdating(true);
      await api.put("/admin/orders/update-status", {
        order_id: editOrder.order_id,
        item_id: editOrder.item_id,
        order_status: editOrderStatus,
        refund_status: editRefundStatus,
        payment_status: editPaymentStatus,
        payout_status: editPayoutStatus,
        payout_reference: editPayoutRef,
        refund_note: editRefundNote
      });

      showToast("Order status, payment, and refund updated successfully!");
      setEditOrder(null);
      if (viewOrder && viewOrder.item_id === editOrder.item_id) {
        setViewOrder(prev => ({
          ...prev,
          order_status: editOrderStatus,
          refund_status: editRefundStatus,
          payment_status: editPaymentStatus,
          payout_status: editPayoutStatus,
          payout_reference: editPayoutRef,
          refund_note: editRefundNote
        }));
      }
      fetchOrders(true);
    } catch (err) {
      console.error("Update Status Error:", err);
      showToast(err.response?.data?.message || "Failed to update order", "error");
    } finally {
      setUpdating(false);
    }
  };

  /* ================= DATE HELPERS ================= */
  const isToday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const isYesterday = (dateString) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return (
      d.getDate() === y.getDate() &&
      d.getMonth() === y.getMonth() &&
      d.getFullYear() === y.getFullYear()
    );
  };

  const isWithinDays = (dateString, days) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    const now = new Date();
    const diff = (now - d) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= days;
  };

  /* ================= KPI TELEMETRY METRICS ================= */
  const stats = useMemo(() => {
    let totalGMV = 0;
    let todayOrdersCount = 0;
    let todayGMV = 0;
    let inTransitCount = 0;
    let deliveredCount = 0;
    let refundDisputeCount = 0;
    let pendingPayoutCount = 0;

    orders.forEach(o => {
      const amt = Number(o.price_at_purchase || 0) * Number(o.quantity || 1);
      totalGMV += amt;

      if (isToday(o.created_at)) {
        todayOrdersCount += 1;
        todayGMV += amt;
      }

      const st = String(o.order_status || "").toLowerCase();
      if (st === "in_transit" || st === "dispatched" || st === "out_for_delivery") {
        inTransitCount += 1;
      } else if (st === "delivered") {
        deliveredCount += 1;
      }

      if (st === "cancelled" || (o.refund_status && o.refund_status !== "none")) {
        refundDisputeCount += 1;
      }

      if (String(o.payout_status || "").toLowerCase() === "pending") {
        pendingPayoutCount += 1;
      }
    });

    return {
      totalOrders: orders.length,
      totalGMV,
      todayOrdersCount,
      todayGMV,
      inTransitCount,
      deliveredCount,
      refundDisputeCount,
      pendingPayoutCount
    };
  }, [orders]);

  /* ================= UNIQUE VENDORS FOR DROPDOWN ================= */
  const vendorList = useMemo(() => {
    const map = new Map();
    orders.forEach(o => {
      if (o.vendor_id && o.business_name && !map.has(o.vendor_id)) {
        map.set(o.vendor_id, o.business_name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [orders]);

  /* ================= FILTERING & SORTING LOGIC ================= */
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        String(o.order_id || "").toLowerCase().includes(q) ||
        String(o.item_id || "").toLowerCase().includes(q) ||
        String(o.buyer_name || "").toLowerCase().includes(q) ||
        String(o.buyer_email || "").toLowerCase().includes(q) ||
        String(o.buyer_phone || "").toLowerCase().includes(q) ||
        String(o.business_name || "").toLowerCase().includes(q) ||
        String(o.vendor_owner || "").toLowerCase().includes(q) ||
        String(o.product_name || "").toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 1. Quick Tabs Filter
      if (activeTab === "today" && !isToday(o.created_at)) return false;
      if (activeTab === "in_transit") {
        const st = String(o.order_status || "").toLowerCase();
        if (st !== "in_transit" && st !== "dispatched" && st !== "out_for_delivery") return false;
      }
      if (activeTab === "delivered") {
        if (String(o.order_status || "").toLowerCase() !== "delivered") return false;
      }
      if (activeTab === "refunds") {
        const isCancelled = String(o.order_status || "").toLowerCase() === "cancelled";
        const hasRefund = o.refund_status && o.refund_status !== "none";
        if (!isCancelled && !hasRefund) return false;
      }
      if (activeTab === "payouts") {
        if (String(o.payout_status || "").toLowerCase() !== "pending") return false;
      }

      // 2. Date Filter
      if (dateFilter === "today" && !isToday(o.created_at)) return false;
      if (dateFilter === "yesterday" && !isYesterday(o.created_at)) return false;
      if (dateFilter === "week" && !isWithinDays(o.created_at, 7)) return false;
      if (dateFilter === "month" && !isWithinDays(o.created_at, 30)) return false;

      // 3. Status Filter
      if (statusFilter !== "all") {
        const st = String(o.order_status || "").toLowerCase();
        if (statusFilter === "in_transit") {
          if (st !== "in_transit" && st !== "dispatched" && st !== "out_for_delivery") return false;
        } else if (statusFilter === "placed") {
          if (st !== "placed" && st !== "pending_vendor" && st !== "pending") return false;
        } else if (st !== statusFilter) {
          return false;
        }
      }

      // 4. Payment Status Filter
      if (paymentStatusFilter !== "all") {
        if (String(o.payment_status || "").toLowerCase() !== paymentStatusFilter) return false;
      }

      // 5. Payment Method Filter
      if (paymentMethodFilter !== "all") {
        const method = String(o.payment_method || "").toLowerCase();
        if (paymentMethodFilter === "online" && method === "cod") return false;
        if (paymentMethodFilter === "cod" && method !== "cod") return false;
      }

      // 6. Vendor Filter
      if (vendorFilter !== "all" && String(o.vendor_id) !== String(vendorFilter)) {
        return false;
      }

      // 7. Payout Filter
      if (payoutFilter !== "all") {
        if (String(o.payout_status || "").toLowerCase() !== payoutFilter) return false;
      }

      return true;
    }).sort((a, b) => {
      const amtA = Number(a.price_at_purchase || 0) * Number(a.quantity || 1);
      const amtB = Number(b.price_at_purchase || 0) * Number(b.quantity || 1);

      if (sortBy === "amount_desc") return amtB - amtA;
      if (sortBy === "amount_asc") return amtA - amtB;
      if (sortBy === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at); // default newest
    });
  }, [
    orders,
    searchQuery,
    activeTab,
    dateFilter,
    statusFilter,
    paymentStatusFilter,
    paymentMethodFilter,
    vendorFilter,
    payoutFilter,
    sortBy
  ]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, dateFilter, statusFilter, paymentStatusFilter, paymentMethodFilter, vendorFilter, payoutFilter, sortBy]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const hasActiveFilters =
    searchQuery ||
    activeTab !== "all" ||
    dateFilter !== "all" ||
    statusFilter !== "all" ||
    paymentStatusFilter !== "all" ||
    paymentMethodFilter !== "all" ||
    vendorFilter !== "all" ||
    payoutFilter !== "all" ||
    sortBy !== "newest";

  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setDateFilter("all");
    setStatusFilter("all");
    setPaymentStatusFilter("all");
    setPaymentMethodFilter("all");
    setVendorFilter("all");
    setPayoutFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  /* ================= CSV EXPORT ================= */
  const handleExportCSV = () => {
    if (!filteredOrders.length) {
      showToast("No orders available to export", "error");
      return;
    }

    const headers = [
      "Order ID",
      "Item ID",
      "Date",
      "Buyer Name",
      "Buyer Email",
      "Buyer Phone",
      "Vendor Name",
      "Product Name",
      "Quantity",
      "Unit Price",
      "Total Amount",
      "Payment Method",
      "Payment Status",
      "Order Lifecycle Status",
      "Payout Status",
      "Refund Status",
      "Shipping City",
      "Pincode"
    ];

    const rows = filteredOrders.map(o => [
      `"${o.order_id}"`,
      `"${o.item_id}"`,
      `"${new Date(o.created_at).toLocaleString()}"`,
      `"${o.buyer_name || ''}"`,
      `"${o.buyer_email || ''}"`,
      `"${o.buyer_phone || ''}"`,
      `"${o.business_name || ''}"`,
      `"${o.product_name || ''}"`,
      o.quantity || 1,
      o.price_at_purchase || 0,
      Number(o.price_at_purchase || 0) * Number(o.quantity || 1),
      `"${o.payment_method || 'ONLINE'}"`,
      `"${o.payment_status || 'paid'}"`,
      `"${o.order_status || 'placed'}"`,
      `"${o.payout_status || 'pending'}"`,
      `"${o.refund_status || 'none'}"`,
      `"${o.city || ''}"`,
      `"${o.pincode || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trackmart_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredOrders.length} orders to CSV successfully`);
  };

  /* ================= STATUS PILL STYLING ================= */
  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "delivered") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Delivered</span>
        </span>
      );
    }
    if (s === "in_transit" || s === "dispatched" || s === "out_for_delivery") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Truck className="w-3 h-3 text-blue-600 animate-pulse" />
          <span>In Transit</span>
        </span>
      );
    }
    if (s === "confirmed" || s === "preparing") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
          <Clock className="w-3 h-3 text-indigo-600" />
          <span>Confirmed</span>
        </span>
      );
    }
    if (s === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
        <Clock className="w-3 h-3 text-amber-600" />
        <span>Pending Vendor</span>
      </span>
    );
  };

  const getRefundBadge = (status) => {
    const s = String(status || "none").toLowerCase();
    if (s === "refunded") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200">
          Refunded
        </span>
      );
    }
    if (s === "processing") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-100 text-orange-800 border border-orange-200 animate-pulse">
          Refund Pending
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
        No Refund
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* TOAST ALERT BANNER */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-slideIn ${
            toastMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {toastMessage.type === "error" ? (
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          )}
          <span className="text-xs font-bold">{toastMessage.msg}</span>
        </div>
      )}

      {/* 1. TOP HEADER BANNER (Clean Light Theme) */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 text-slate-900 shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-orange-100/50 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-xs font-bold border border-emerald-200 text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Order Pipeline Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Order Lifecycle &amp; Fulfillment Console
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Real-time platform tracking across customer orders, OTP fulfillment verification, merchant payout settlements, and customer refund arbitration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              title="Export currently filtered orders to CSV"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => fetchOrders(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition shadow-sm active:scale-95"
              title="Refresh order telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Refresh Pipeline"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE TELEMETRY KPI METRICS - RESPONSIVE STANDALONE CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 text-xs">
        {/* Total Orders */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition">
          <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            Total Orders
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {stats.totalOrders}
          </div>
          <div className="text-slate-500 text-[11px] mt-0.5 font-medium">
            GMV: ₹{stats.totalGMV.toLocaleString("en-IN")}
          </div>
        </div>

        {/* Today's Orders (Highlighted) */}
        <div
          onClick={() => setActiveTab("today")}
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/90 shadow-xs cursor-pointer hover:border-amber-400 hover:shadow-sm transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-amber-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Today's Orders</span>
            </span>
            <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded-full">
              TODAY
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-900 mt-1 group-hover:scale-105 transition-transform">
            {stats.todayOrdersCount}
          </div>
          <div className="text-amber-700/90 text-[11px] mt-0.5 font-medium">
            Today: ₹{stats.todayGMV.toLocaleString("en-IN")}
          </div>
        </div>

        {/* In Transit */}
        <div
          onClick={() => setActiveTab("in_transit")}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs cursor-pointer hover:border-sky-300 hover:shadow-sm transition group"
        >
          <div className="text-sky-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-sky-600" />
            <span>In Transit</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 group-hover:text-sky-600 transition-colors">
            {stats.inTransitCount}
          </div>
          <div className="text-slate-500 text-[11px] mt-0.5 font-medium">
            Active on the road
          </div>
        </div>

        {/* Delivered */}
        <div
          onClick={() => setActiveTab("delivered")}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs cursor-pointer hover:border-emerald-300 hover:shadow-sm transition group"
        >
          <div className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivered</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 group-hover:text-emerald-600 transition-colors">
            {stats.deliveredCount}
          </div>
          <div className="text-slate-500 text-[11px] mt-0.5 font-medium">
            Successfully fulfilled
          </div>
        </div>

        {/* Refunds & Disputes */}
        <div
          onClick={() => setActiveTab("refunds")}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs cursor-pointer hover:border-rose-300 hover:shadow-sm transition col-span-2 sm:col-span-1 group"
        >
          <div className="text-rose-700 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Disputes / Refunds</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 group-hover:text-rose-600 transition-colors">
            {stats.refundDisputeCount}
          </div>
          <div className="text-slate-500 text-[11px] mt-0.5 font-medium">
            Requires arbitration
          </div>
        </div>
      </div>

      {/* 3. QUICK TABS BAR */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "all"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          All Orders ({stats.totalOrders})
        </button>

        <button
          onClick={() => setActiveTab("today")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "today"
              ? "bg-amber-500 text-white shadow-xs"
              : "text-amber-800 bg-amber-50 hover:bg-amber-100/80"
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Today's Orders ({stats.todayOrdersCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("in_transit")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "in_transit"
              ? "bg-sky-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>In Transit ({stats.inTransitCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("delivered")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "delivered"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Delivered ({stats.deliveredCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("refunds")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "refunds"
              ? "bg-rose-600 text-white shadow-xs"
              : "text-rose-700 bg-rose-50/70 hover:bg-rose-100"
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refunds &amp; Disputes ({stats.refundDisputeCount})</span>
        </button>

        <button
          onClick={() => setActiveTab("payouts")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === "payouts"
              ? "bg-primary text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Pending Vendor Payouts ({stats.pendingPayoutCount})</span>
        </button>
      </div>

      {/* 4. ADVANCED MULTI-ATTRIBUTE FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-3.5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

          {/* Search bar (4 cols) */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Buyer, Phone, Store, or Item..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Date Presets (2 cols) */}
          <div className="md:col-span-2">
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700"
              >
                <option value="all">All Dates</option>
                <option value="today">Today's Orders</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Past 7 Days</option>
                <option value="month">Past 30 Days</option>
              </select>
            </div>
          </div>

          {/* Order Lifecycle Status (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="placed">Pending Vendor</option>
              <option value="confirmed">Confirmed / Preparing</option>
              <option value="in_transit">In Transit / Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Method / Status (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700"
            >
              <option value="all">All Payment Methods</option>
              <option value="online">Online Payment (UPI/Cards)</option>
              <option value="cod">Cash on Delivery (COD)</option>
            </select>
          </div>

          {/* Sort By (2 cols) */}
          <div className="md:col-span-2">
            <div className="relative">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount_desc">Amount: High to Low</option>
                <option value="amount_asc">Amount: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Secondary Filter Row: Vendor, Payment Status, Payout */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Vendor Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] font-semibold">Vendor:</span>
              <select
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Verified Merchants</option>
                {vendorList.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Payment Status */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] font-semibold">Payment:</span>
              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Vendor Payout Settlement */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[11px] font-semibold">Settlement:</span>
              <select
                value={payoutFilter}
                onChange={(e) => setPayoutFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
              >
                <option value="all">All Settlements</option>
                <option value="pending">Pending Payout</option>
                <option value="paid">Settled / Paid</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Active Filter Clear Button */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            )}

            {/* View Mode Toggle: Cards vs Table */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === "cards"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Table List View"
              >
                <List className="w-3.5 h-3.5 text-primary" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. ORDERS TABLE */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
          <p className="text-slate-500 font-semibold text-xs">Synchronizing platform order lifecycle...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-50 text-primary flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Orders Found</h3>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              No orders matched your current search and filter combination.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* A. CARDS VIEW (Responsive 1 to 3 columns, perfectly fitting mobile, tablet & desktop) */}
          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {paginatedOrders.map((o) => {
                const totalAmt = Number(o.price_at_purchase || 0) * Number(o.quantity || 1);
                const orderDate = new Date(o.created_at);
                const placedToday = isToday(o.created_at);

                return (
                  <div
                    key={`${o.order_id}-${o.item_id}`}
                    onClick={() => setViewOrder(o)}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-primary/40 hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                  >
                    {/* Top Accent line on hover */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div>
                      {/* 1. Header: Order ID & Lifecycle Badge */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              #{String(o.order_id).slice(0, 8).toUpperCase()}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(o.order_id, `order-${o.order_id}`);
                              }}
                              className="text-slate-400 hover:text-primary transition p-0.5 rounded"
                              title="Copy full UUID"
                            >
                              {copiedId === `order-${o.order_id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            {placedToday && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-900 uppercase">
                                Today
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {orderDate.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}{" "}
                            •{" "}
                            {orderDate.toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          {getStatusBadge(o.order_status)}
                        </div>
                      </div>

                      {/* 2. Item & Merchant Info */}
                      <div className="flex items-center gap-3 py-3 border-b border-slate-100">
                        {o.product_image ? (
                          <img
                            src={o.product_image}
                            alt={o.product_name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          {o.product_id ? (
                            <Link
                              to={`/admin/products/${o.product_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-slate-900 hover:text-primary transition text-xs line-clamp-1"
                              title={o.product_name}
                            >
                              {o.product_name}
                            </Link>
                          ) : (
                            <p className="font-bold text-slate-900 text-xs line-clamp-1" title={o.product_name}>
                              {o.product_name}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                            {o.vendor_id ? (
                              <Link
                                to={`/admin/vendors/${o.vendor_id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-primary hover:underline font-semibold flex items-center gap-1 truncate max-w-[140px]"
                              >
                                <Store className="w-3 h-3 shrink-0" />
                                <span className="truncate">{o.business_name || "Merchant"}</span>
                              </Link>
                            ) : (
                              <span className="truncate">{o.business_name || "Merchant"}</span>
                            )}
                            <span className="text-slate-400 shrink-0">• Qty: {o.quantity}</span>
                          </div>
                        </div>
                      </div>

                      {/* 3. Customer Info */}
                      <div className="py-2.5 text-xs border-b border-slate-100 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-xs truncate">
                            {o.buyer_name || "Customer"}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {o.buyer_email || "N/A"}
                          </p>
                        </div>
                        {o.city && (
                          <div className="text-right shrink-0">
                            <p className="text-[11px] text-slate-500 font-medium flex items-center justify-end gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{o.city}{o.state ? `, ${o.state}` : ""}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 4. Financial & Settlement Pills */}
                      <div className="pt-3 flex items-center justify-between gap-2 text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Amount</div>
                          <div className="text-base font-black text-slate-900">
                            ₹{totalAmt.toLocaleString("en-IN")}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              String(o.payment_method).toLowerCase() === "cod"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {o.payment_method || "ONLINE"}
                            </span>
                            <span className={`text-[11px] font-bold ${
                              o.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"
                            }`}>
                              {o.payment_status === "paid" ? "Paid" : "Pending"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px]">
                            <span className="text-slate-400">Payout:</span>
                            <span className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                              o.payout_status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}>
                              {o.payout_status === "paid" ? "Settled" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 5. Special Alerts: OTP or Refund note if applicable */}
                      {(o.refund_status || (o.delivery_otp && String(o.order_status).toLowerCase() !== "delivered")) && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          {o.refund_status && (
                            <div className="flex items-center gap-1">
                              {getRefundBadge(o.refund_status)}
                              {o.refund_note && (
                                <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={o.refund_note}>
                                  {o.refund_note}
                                </span>
                              )}
                            </div>
                          )}
                          {o.delivery_otp && String(o.order_status).toLowerCase() !== "delivered" && (
                            <span className="text-[10px] text-slate-600 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded">
                              OTP: {o.delivery_otp}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer cue: Entire card click opens dossier */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400 group-hover:text-primary transition-colors">
                      <span className="font-semibold flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect dossier &amp; update</span>
                      </span>
                      <span className="text-xs">→</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* B. STREAMLINED 6-COLUMN TABLE VIEW (Clean, fitted, no redundant Actions column) */
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Order &amp; Date</th>
                      <th className="px-4 py-3.5">Customer &amp; City</th>
                      <th className="px-4 py-3.5">Item &amp; Merchant</th>
                      <th className="px-4 py-3.5">Total &amp; Payment</th>
                      <th className="px-4 py-3.5">Lifecycle Status</th>
                      <th className="px-4 py-3.5">Settlement &amp; Dispute</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {paginatedOrders.map((o) => {
                      const totalAmt = Number(o.price_at_purchase || 0) * Number(o.quantity || 1);
                      const orderDate = new Date(o.created_at);
                      const placedToday = isToday(o.created_at);

                      return (
                        <tr
                          key={`${o.order_id}-${o.item_id}`}
                          onClick={() => setViewOrder(o)}
                          className="hover:bg-orange-50/40 transition cursor-pointer group"
                          title="Click row to inspect order dossier"
                        >
                          {/* 1. ORDER & DATE */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 group-hover:text-primary transition-colors">
                                #{String(o.order_id).slice(0, 8).toUpperCase()}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(o.order_id, `order-${o.order_id}`);
                                }}
                                className="text-slate-400 hover:text-primary transition p-0.5 rounded"
                                title="Copy full UUID"
                              >
                                {copiedId === `order-${o.order_id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5 mt-1">
                              {placedToday && (
                                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-900 uppercase">
                                  Today
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400">
                                {orderDate.toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short"
                                })}{" "}
                                •{" "}
                                {orderDate.toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                          </td>

                          {/* 2. CUSTOMER & CITY */}
                          <td className="px-4 py-3.5">
                            <p className="font-bold text-slate-900">{o.buyer_name || "Customer"}</p>
                            <p className="text-[11px] text-slate-400 truncate max-w-[130px]" title={o.buyer_email}>
                              {o.buyer_email || "N/A"}
                            </p>
                            {o.city && (
                              <p className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                <span className="truncate max-w-[120px]">{o.city}{o.state ? `, ${o.state}` : ""}</span>
                              </p>
                            )}
                          </td>

                          {/* 3. ITEM & MERCHANT */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5 max-w-xs">
                              {o.product_image ? (
                                <img
                                  src={o.product_image}
                                  alt={o.product_name}
                                  className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                {o.product_id ? (
                                  <Link
                                    to={`/admin/products/${o.product_id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-bold text-slate-800 hover:text-primary transition truncate block"
                                    title={o.product_name}
                                  >
                                    {o.product_name}
                                  </Link>
                                ) : (
                                  <p className="font-bold text-slate-800 truncate" title={o.product_name}>
                                    {o.product_name}
                                  </p>
                                )}

                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                  {o.vendor_id ? (
                                    <Link
                                      to={`/admin/vendors/${o.vendor_id}`}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-primary hover:underline font-semibold flex items-center gap-1"
                                    >
                                      <Store className="w-3 h-3" />
                                      <span className="truncate max-w-[100px]">{o.business_name}</span>
                                    </Link>
                                  ) : (
                                    <span>{o.business_name || "Merchant"}</span>
                                  )}
                                  <span className="text-slate-400">• Qty: {o.quantity}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 4. TOTAL & PAYMENT */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <p className="font-black text-slate-900 text-sm">
                              ₹{totalAmt.toLocaleString("en-IN")}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                String(o.payment_method).toLowerCase() === "cod"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {o.payment_method || "ONLINE"}
                              </span>
                              <span className={`text-[10px] font-semibold ${
                                o.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"
                              }`}>
                                {o.payment_status || "paid"}
                              </span>
                            </div>
                          </td>

                          {/* 5. ORDER LIFECYCLE STATUS */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {getStatusBadge(o.order_status)}
                            {o.delivery_otp && String(o.order_status).toLowerCase() !== "delivered" && (
                              <div className="text-[10px] text-slate-500 mt-1 font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                                OTP: {o.delivery_otp}
                              </div>
                            )}
                          </td>

                          {/* 6. SETTLEMENT & REFUND STATUS */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="space-y-1">
                              <div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  o.payout_status === "paid"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                  Payout: {o.payout_status === "paid" ? "Settled" : "Pending"}
                                </span>
                              </div>
                              {o.refund_status && (
                                <div>
                                  {getRefundBadge(o.refund_status)}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* C. RESPONSIVE PAGINATION CONTROLS */}
          <div className="bg-white border border-slate-200/90 rounded-2xl px-5 py-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                <strong>{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</strong> of{" "}
                <strong>{filteredOrders.length}</strong> orders
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Rows:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
                >
                  <option value={9}>9</option>
                  <option value={15}>15</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>
            </div>

            {/* Page Buttons with Fragment */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => {
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <Fragment key={page}>
                      {showEllipsis && (
                        <span className="px-2 text-slate-400 text-xs">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                          currentPage === page
                            ? "bg-primary text-white shadow-xs"
                            : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        {page}
                      </button>
                    </Fragment>
                  );
                })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. COMPLETE ORDER DOSSIER MODAL / DRAWER */}
      {viewOrder && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-scaleUp">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Order Telemetry Dossier
                </span>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>Order #{String(viewOrder.order_id).slice(0, 8).toUpperCase()}</span>
                  <span className="text-xs text-slate-400 font-mono">({viewOrder.order_id})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed on {new Date(viewOrder.created_at).toLocaleString("en-IN", {
                    dateStyle: "full",
                    timeStyle: "short"
                  })}
                </p>
              </div>

              <button
                onClick={() => setViewOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Status & OTP Highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Current Lifecycle
                </span>
                <div className="mt-1">{getStatusBadge(viewOrder.order_status)}</div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Delivery Verification OTP
                </span>
                <div className="text-sm font-mono font-black text-slate-800 mt-1">
                  {viewOrder.delivery_otp ? (
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      {viewOrder.delivery_otp}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">Generated upon dispatch</span>
                  )}
                </div>
              </div>
            </div>

            {/* Customer & Shipping Info */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>Buyer &amp; Shipping Destination</span>
              </h4>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{viewOrder.buyer_name || "Customer"}</p>
                  <p className="text-slate-500 flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{viewOrder.buyer_email || "N/A"}</span>
                  </p>
                  {(viewOrder.buyer_phone || viewOrder.shipping_phone) && (
                    <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{viewOrder.shipping_phone || viewOrder.buyer_phone}</span>
                    </p>
                  )}
                </div>

                <div className="text-slate-600">
                  <p className="font-bold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>Shipping Address:</span>
                  </p>
                  <p className="mt-1 leading-relaxed">
                    {[
                      viewOrder.house_no,
                      viewOrder.street,
                      viewOrder.locality,
                      viewOrder.landmark,
                      viewOrder.city,
                      viewOrder.state,
                      viewOrder.pincode
                    ]
                      .filter(Boolean)
                      .join(", ") || "Standard delivery address registered on profile"}
                  </p>
                </div>
              </div>
            </div>

            {/* Merchant & Product Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-primary" />
                <span>Product &amp; Merchant Storefront</span>
              </h4>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-primary" />
                    <span className="font-bold text-slate-800 text-xs">
                      {viewOrder.business_name || "Merchant Store"}
                    </span>
                    {viewOrder.vendor_owner && (
                      <span className="text-slate-400 text-xs">({viewOrder.vendor_owner})</span>
                    )}
                  </div>

                  {viewOrder.vendor_id && (
                    <Link
                      to={`/admin/vendors/${viewOrder.vendor_id}`}
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Vendor Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {viewOrder.product_image ? (
                    <img
                      src={viewOrder.product_image}
                      alt={viewOrder.product_name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-900 text-sm truncate">
                      {viewOrder.product_name}
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Net Size: {viewOrder.product_size || "Standard"} • Quantity: <strong>{viewOrder.quantity}</strong>
                    </p>
                    <p className="text-xs font-black text-slate-900 mt-1">
                      ₹{Number(viewOrder.price_at_purchase || 0).toLocaleString("en-IN")} per unit
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Line Total</span>
                    <p className="text-base font-black text-primary">
                      ₹{(Number(viewOrder.price_at_purchase || 0) * Number(viewOrder.quantity || 1)).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial & Settlement Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-primary" />
                <span>Financial Settlement &amp; Payment Telemetry</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Method</span>
                  <p className="font-extrabold text-slate-800 mt-0.5 uppercase">
                    {viewOrder.payment_method || "ONLINE"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Payment Status</span>
                  <p className="font-extrabold text-emerald-700 mt-0.5 uppercase">
                    {viewOrder.payment_status || "paid"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Payout Status</span>
                  <p className="font-extrabold text-slate-800 mt-0.5 uppercase">
                    {viewOrder.payout_status || "pending"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Refund Status</span>
                  <p className="font-extrabold text-slate-800 mt-0.5 uppercase">
                    {viewOrder.refund_status || "none"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Close Dossier
              </button>

              <button
                onClick={() => {
                  const target = viewOrder;
                  setViewOrder(null);
                  handleOpenEdit(target);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modify Lifecycle &amp; Settlement</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 8. ADMIN MANAGE / UPDATE ORDER MODAL */}
      {editOrder && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span>Manage Order Lifecycle &amp; Settlement</span>
              </h3>
              <button
                onClick={() => setEditOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <p>Order: <strong className="text-slate-900 font-mono">#{String(editOrder.order_id).slice(0, 8).toUpperCase()}</strong></p>
              <p>Customer: <strong className="text-slate-900">{editOrder.buyer_name}</strong> ({editOrder.buyer_email})</p>
              <p>Total Amount: <strong className="text-primary font-bold">₹{Number(editOrder.price_at_purchase) * Number(editOrder.quantity)}</strong></p>
            </div>

            {/* Lifecycle Status Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Order Fulfillment Status
              </label>
              <select
                value={editOrderStatus}
                onChange={(e) => setEditOrderStatus(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="placed">Placed / Pending Vendor</option>
                <option value="confirmed">Confirmed / Preparing</option>
                <option value="in_transit">In Transit / Out for Delivery</option>
                <option value="delivered">Delivered &amp; Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Customer Payment Status
              </label>
              <select
                value={editPaymentStatus}
                onChange={(e) => setEditPaymentStatus(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="paid">Paid (Verified)</option>
                <option value="pending">Pending Payment</option>
                <option value="failed">Failed / Void</option>
              </select>
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
                <option value="processing">Processing (Refund Initiated)</option>
                <option value="refunded">Refunded (Disbursed to Customer)</option>
              </select>
            </div>

            {/* Vendor Payout Settlement */}
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
                  <option value="paid">Paid (Disbursed to Merchant)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Settlement Reference (UTR / Bank Txn ID)
                </label>
                <input
                  type="text"
                  value={editPayoutRef}
                  onChange={(e) => setEditPayoutRef(e.target.value)}
                  placeholder="e.g. UTR-982183921 / PAY-1002"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Refund Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Refund Note / Buyer Memo (Optional)
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
                type="button"
                onClick={() => setEditOrder(null)}
                disabled={updating}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updating}
                className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition shadow-xs disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Changes & Notify"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}