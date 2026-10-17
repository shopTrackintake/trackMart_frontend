import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getUserOrders } from "../../services/orderService";
import api from "../../services/api";
import TrackingModal from "../../components/TrackingModal";
import socket from "../../services/socket";
import { 
  Package, Truck, CheckCircle2, XCircle, Clock, 
  CreditCard, Search, ArrowRight, Eye, RefreshCw, 
  AlertTriangle, Copy, Check, ChevronLeft, ChevronRight, ShoppingBag
} from "lucide-react";

export default function Orders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightedOrderId = searchParams.get("orderId");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "recent" | "active" | "completed" | "past" | "cancelled"
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "highest" | "lowest"
  const [copiedOrderId, setCopiedOrderId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Live tracking modal
  const [trackingItemId, setTrackingItemId] = useState(null);

  // Cancel item modal state
  const [cancelModalItem, setCancelModalItem] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getUserOrders();
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching customer orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleOrderUpdated = () => {
      fetchOrders();
    };

    socket.on("order_updated", handleOrderUpdated);
    return () => {
      socket.off("order_updated", handleOrderUpdated);
    };
  }, []);

  const copyOrderId = (orderId, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handleCancelItem = async () => {
    if (!cancelModalItem) return;
    try {
      setCancelling(true);
      const res = await api.post("/orders/cancel-item", {
        item_id: cancelModalItem.id,
        reason: cancelReason || "Cancelled by buyer"
      });
      alert(res.data.message || "Item cancelled successfully!");
      setCancelModalItem(null);
      setCancelReason("");
      fetchOrders();
    } catch (err) {
      console.error("Cancel Item Error:", err);
      // Fallback: try cancelling order if single item or endpoint fallback
      try {
        if (cancelModalItem.order?.id) {
          const fallbackRes = await api.post("/orders/cancel", {
            order_id: cancelModalItem.order.id,
            reason: cancelReason || "Cancelled by buyer"
          });
          alert(fallbackRes.data.message || "Order cancelled successfully!");
          setCancelModalItem(null);
          setCancelReason("");
          fetchOrders();
          return;
        }
      } catch (fErr) {
        console.error("Fallback Cancel Error:", fErr);
      }
      alert(err.response?.data?.message || "Failed to cancel item");
    } finally {
      setCancelling(false);
    }
  };

  // Flatten orders into individual purchased items so each product is displayed separately
  const allOrderItems = useMemo(() => {
    const list = [];
    orders.forEach((order) => {
      if (order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          list.push({
            ...item,
            order: {
              id: order.id,
              created_at: order.created_at,
              total_amount: order.total_amount,
              order_status: order.order_status,
              payment_status: order.payment_status,
              payment_method: order.payment_method,
              shipping_address: order.shipping_address
            }
          });
        });
      } else {
        list.push({
          id: order.id,
          product_title: `Order #${order.id.slice(0, 8).toUpperCase()}`,
          quantity: 1,
          price_at_purchase: order.total_amount,
          item_status: order.order_status,
          order
        });
      }
    });
    return list;
  }, [orders]);

  // Helper categorization per item
  const isItemCancelled = (item) =>
    String(item.item_status || "").toLowerCase() === "cancelled" ||
    String(item.order?.order_status || "").toLowerCase() === "cancelled";

  const isItemDelivered = (item) =>
    !isItemCancelled(item) &&
    String(item.item_status || "").toLowerCase() === "delivered";

  const isItemInTransit = (item) =>
    !isItemCancelled(item) &&
    !isItemDelivered(item) &&
    ["in_transit", "shipped"].includes(String(item.item_status || "").toLowerCase());

  const isItemConfirmed = (item) =>
    !isItemCancelled(item) &&
    !isItemDelivered(item) &&
    !isItemInTransit(item) &&
    ["confirmed", "processing"].includes(String(item.item_status || "").toLowerCase());

  const isItemActive = (item) => !isItemCancelled(item) && !isItemDelivered(item);

  const isItemRecent = (item, days = 30) => {
    const dateStr = item.order?.created_at || item.created_at;
    if (!dateStr) return true;
    const diff = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= days;
  };

  const isItemPast = (item, days = 30) => {
    if (isItemDelivered(item)) return true;
    const dateStr = item.order?.created_at || item.created_at;
    if (!dateStr) return false;
    const diff = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
    return diff > days;
  };

  // Filter items based on active tab & search & sorting
  const filteredItems = useMemo(() => {
    return allOrderItems.filter((item) => {
      const query = searchQuery.trim().toLowerCase();
      const idMatch = item.order?.id?.toLowerCase().includes(query) || String(item.id).toLowerCase().includes(query);
      const titleMatch = (item.product_title || "").toLowerCase().includes(query);
      const vendorMatch = (item.vendor_name || "").toLowerCase().includes(query);
      const matchesSearch = !query || idMatch || titleMatch || vendorMatch;

      if (!matchesSearch) return false;

      if (activeTab === "recent") return isItemRecent(item);
      if (activeTab === "active") return isItemActive(item);
      if (activeTab === "completed") return isItemDelivered(item);
      if (activeTab === "past") return isItemPast(item);
      if (activeTab === "cancelled") return isItemCancelled(item);
      return true;
    }).sort((a, b) => {
      const dateA = a.order?.created_at ? new Date(a.order.created_at).getTime() : 0;
      const dateB = b.order?.created_at ? new Date(b.order.created_at).getTime() : 0;
      const totalA = Number(a.price_at_purchase || 0) * Number(a.quantity || 1);
      const totalB = Number(b.price_at_purchase || 0) * Number(b.quantity || 1);

      if (sortBy === "newest") return dateB - dateA;
      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "highest") return totalB - totalA;
      if (sortBy === "lowest") return totalA - totalB;
      return 0;
    });
  }, [allOrderItems, searchQuery, activeTab, sortBy]);

  // Reset to first page when tab, search, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortBy]);

  const recentCount = useMemo(() => allOrderItems.filter(isItemRecent).length, [allOrderItems]);
  const activeCount = useMemo(() => allOrderItems.filter(isItemActive).length, [allOrderItems]);
  const deliveredCount = useMemo(() => allOrderItems.filter(isItemDelivered).length, [allOrderItems]);
  const pastCount = useMemo(() => allOrderItems.filter(isItemPast).length, [allOrderItems]);
  const cancelledCount = useMemo(() => allOrderItems.filter(isItemCancelled).length, [allOrderItems]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-fadeIn">

      {/* TOP HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
              <Package className="w-3.5 h-3.5" />
              <span>Purchase History</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              <span className="text-slate-900">My </span>
              <span className="text-primary">Orders</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Track live deliveries, review ordered products individually, inspect verification OTPs, and access full details.
            </p>
          </div>

          <Link
            to="/buy"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs sm:text-sm transition shadow-xs active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shop More Products</span>
          </Link>
        </div>

        {/* STATS OVERVIEW BAR - CLICKABLE TO FILTER */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`p-3 rounded-2xl transition border cursor-pointer text-center ${
              activeTab === "all"
                ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                : "bg-slate-50/80 border-slate-100 hover:bg-slate-100/80"
            }`}
          >
            <p className={`text-[11px] font-bold uppercase ${activeTab === "all" ? "text-slate-300" : "text-slate-400"}`}>
              Total Items
            </p>
            <p className={`text-lg sm:text-xl font-extrabold mt-0.5 ${activeTab === "all" ? "text-white" : "text-slate-900"}`}>
              {allOrderItems.length}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("active")}
            className={`p-3 rounded-2xl transition border cursor-pointer text-center ${
              activeTab === "active"
                ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                : "bg-blue-50/80 border-blue-100 hover:bg-blue-100/80"
            }`}
          >
            <p className={`text-[11px] font-bold uppercase ${activeTab === "active" ? "text-blue-100" : "text-blue-500"}`}>
              In Transit / Active
            </p>
            <p className={`text-lg sm:text-xl font-extrabold mt-0.5 ${activeTab === "active" ? "text-white" : "text-blue-700"}`}>
              {activeCount}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("completed")}
            className={`p-3 rounded-2xl transition border cursor-pointer text-center ${
              activeTab === "completed"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                : "bg-emerald-50/80 border-emerald-100 hover:bg-emerald-100/80"
            }`}
          >
            <p className={`text-[11px] font-bold uppercase ${activeTab === "completed" ? "text-emerald-100" : "text-emerald-500"}`}>
              Completed (Delivered)
            </p>
            <p className={`text-lg sm:text-xl font-extrabold mt-0.5 ${activeTab === "completed" ? "text-white" : "text-emerald-700"}`}>
              {deliveredCount}
            </p>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS, SEARCH BAR & SORTING */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order ID, product title or seller..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-xs text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="newest">Most Recent First</option>
              <option value="oldest">Oldest Orders First</option>
              <option value="highest">Price: High to Low</option>
              <option value="lowest">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 pt-2 border-t border-slate-100 scrollbar-none">
          {[
            { id: "all", label: "All Orders", count: allOrderItems.length },
            { id: "recent", label: "Recent Orders", count: recentCount },
            { id: "active", label: "Pending / In Transit", count: activeCount },
            { id: "completed", label: "Completed", count: deliveredCount },
            { id: "past", label: "Past Orders", count: pastCount },
            { id: "cancelled", label: "Cancelled", count: cancelledCount }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ORDERS ITEMS LIST - EACH PRODUCT SHOWN SEPARATELY */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500">Loading your orders...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 bg-orange-50 text-primary rounded-full flex items-center justify-center mx-auto">
            <Package className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {searchQuery ? "No matching orders found" : "No orders in this category"}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? "Try searching for another Order ID or grocery title."
                : "Explore our farm-fresh catalog and purchase verified organic groceries."}
            </p>
          </div>
          <Link
            to="/buy"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-orange-600 transition"
          >
            <span>Browse Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {paginatedItems.map((item) => {
            const order = item.order || {};
            const isHighlighted = highlightedOrderId && (String(order.id) === String(highlightedOrderId) || String(item.id) === String(highlightedOrderId));
            const isCancelled = isItemCancelled(item);
            const isDelivered = isItemDelivered(item);
            const isInTransit = isItemInTransit(item);
            const isConfirmed = isItemConfirmed(item);
            const itemTotal = Number(item.price_at_purchase) * Number(item.quantity);
            const itemImage = item.image_url || (Array.isArray(item.images) ? item.images[0] : null);
            const canCancelItem = !isCancelled && !isDelivered && !isInTransit;

            return (
              <div
                key={item.id}
                id={`item-${item.id}`}
                className={`bg-white border rounded-3xl p-5 sm:p-7 shadow-xs space-y-5 transition-all duration-200 ${
                  isHighlighted
                    ? "border-primary ring-2 ring-primary/20 bg-orange-50/15"
                    : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                {/* ORDER HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-black text-slate-900 text-sm sm:text-base">
                        Order #{order.id ? order.id.slice(0, 8).toUpperCase() : String(item.id).slice(0, 8).toUpperCase()}
                      </p>
                      {order.id && (
                        <button
                          type="button"
                          onClick={(e) => copyOrderId(order.id, e)}
                          className="p-1 text-slate-400 hover:text-primary rounded-md transition cursor-pointer"
                          title="Copy full Order ID"
                        >
                          {copiedOrderId === order.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      {isHighlighted && (
                        <span className="text-[10px] font-extrabold uppercase bg-primary text-white px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">
                      Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      }) : "Recent"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    {/* Status Pill */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                        isCancelled
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : isDelivered
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isInTransit
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : isConfirmed
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {isCancelled ? (
                        <>
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>Cancelled</span>
                        </>
                      ) : isDelivered ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Delivered</span>
                        </>
                      ) : isInTransit ? (
                        <>
                          <Truck className="w-3 h-3 text-blue-600" />
                          <span>In Transit</span>
                        </>
                      ) : isConfirmed ? (
                        <>
                          <Package className="w-3 h-3 text-amber-600" />
                          <span>Confirmed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-slate-600" />
                          <span>Order Placed</span>
                        </>
                      )}
                    </span>

                    <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                      ₹{itemTotal}
                    </span>
                  </div>
                </div>

                {/* INDIVIDUAL PRODUCT ITEM ROW */}
                <div className="flex items-start sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
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
                        className="text-sm sm:text-base font-bold text-slate-900 hover:text-primary transition line-clamp-1"
                      >
                        {item.product_title}
                      </Link>
                      <p className="text-xs text-slate-500">
                        Qty: <strong className="text-slate-800">{item.quantity}</strong> • Price: <strong className="text-slate-800 font-mono">₹{item.price_at_purchase}</strong> each
                      </p>
                      {item.vendor_name && (
                        <p className="text-[11px] text-slate-500">
                          Seller: <strong className="text-slate-700 font-medium">{item.vendor_name}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {order.id && (
                      <button
                        type="button"
                        onClick={() => navigate(`/customer/orders/${order.id}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition active:scale-95 shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Full Order Details</span>
                      </button>
                    )}

                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => setTrackingItemId(item.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-50 text-primary hover:bg-orange-100 border border-orange-200 transition cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Delivery</span>
                      </button>
                    )}
                  </div>

                  {canCancelItem && (
                    <button
                      type="button"
                      onClick={() => setCancelModalItem(item)}
                      className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white border border-red-200 px-3.5 py-2 rounded-xl transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Order</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* PAGINATION CONTROLS */}
          {filteredItems.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs mt-6">
              <p className="text-xs text-slate-500 font-medium order-2 sm:order-1">
                Showing <strong className="text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to{" "}
                <strong className="text-slate-900">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)}
                </strong>{" "}
                of <strong className="text-slate-900">{filteredItems.length}</strong> items
              </p>

              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (totalPages > 7) {
                    if (p !== 1 && p !== totalPages && Math.abs(p - currentPage) > 1) {
                      if (p === 2 || p === totalPages - 1) {
                        return <span key={p} className="px-1 text-slate-400 text-xs">...</span>;
                      }
                      return null;
                    }
                  }

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                        currentPage === p
                          ? "bg-primary text-white shadow-xs"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {cancelModalItem && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h3 className="text-xl font-bold text-slate-900">
                Cancel "{cancelModalItem.product_title}"
              </h3>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to cancel this product? Since this item has not yet been dispatched by the vendor, full refund of <strong className="text-slate-900 font-bold">₹{Number(cancelModalItem.price_at_purchase) * Number(cancelModalItem.quantity)}</strong> will be initiated automatically to your original payment method in <strong>3–5 business days</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Cancellation Reason (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Ordered by mistake, changing item choice..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalItem(null)}
                disabled={cancelling}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={handleCancelItem}
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