import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import TrackingModal from "../../components/TrackingModal";
import { 
  ShoppingBag, Search, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, Calendar, Truck,
  Package, RefreshCw, ChevronLeft, TrendingUp, ArrowRight
} from "lucide-react";

import socket from "../../services/socket";

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [trackingItemId, setTrackingItemId] = useState(null);

  // Fixed default items per page
  const ITEMS_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vendor/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Orders Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleOrderUpdated = () => {
      console.log("⚡ [VendorOrders] Socket order_updated event received - auto refreshing");
      fetchOrders();
    };

    socket.on("order_updated", handleOrderUpdated);
    return () => {
      socket.off("order_updated", handleOrderUpdated);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const getStatusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "delivered") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered
        </span>
      );
    }
    if (s === "in_transit" || s === "confirmed" || s === "shipped") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
          <Truck className="w-3.5 h-3.5 text-blue-600" /> In Transit
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
        <Package className="w-3.5 h-3.5 text-amber-600" /> Pending Acceptance
      </span>
    );
  };

  const placedCount = orders.filter(o => ["placed", "pending"].includes(String(o.item_status || "").toLowerCase())).length;
  const inTransitCount = orders.filter(o => ["in_transit", "confirmed", "shipped"].includes(String(o.item_status || "").toLowerCase())).length;
  const deliveredCount = orders.filter(o => String(o.item_status || "").toLowerCase() === "delivered").length;

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      String(o.order_id || "").toLowerCase().includes(q) ||
      String(o.item_id || "").toLowerCase().includes(q) ||
      String(o.product_title || "").toLowerCase().includes(q);

    const s = String(o.item_status || "").toLowerCase();
    if (statusFilter === "placed") return matchesSearch && ["placed", "pending"].includes(s);
    if (statusFilter === "in_transit") return matchesSearch && ["in_transit", "confirmed", "shipped"].includes(s);
    if (statusFilter === "delivered") return matchesSearch && s === "delivered";

    return matchesSearch;
  });

  // Calculate pagination
  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (safeCurrentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages];
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold font-primary">
              <span className="text-primary">Vendor</span>{" "}
              <span className="text-slate-900">Orders</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Manage order workflow: Order Placed → In Transit → Delivered (OTP Verified).
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold transition text-sm shrink-0 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          Refresh List
        </button>
      </div>

      {/* 2. KPI METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setStatusFilter("all")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition shadow-2xs relative overflow-hidden ${
            statusFilter === "all"
              ? "bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900 ring-offset-2"
              : "bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50/50"
          }`}
        >
          <span className={`block text-[11px] sm:text-xs uppercase tracking-wider font-bold ${
            statusFilter === "all" ? "text-slate-300" : "text-slate-500"
          }`}>
            Total Orders
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold font-primary block mt-1.5">
            {orders.length}
          </span>
          <div className="text-[11px] opacity-70 mt-1">All store items</div>
        </button>

        <button
          onClick={() => setStatusFilter("placed")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition shadow-2xs relative overflow-hidden ${
            statusFilter === "placed"
              ? "bg-amber-600 text-white border-amber-600 ring-2 ring-amber-600 ring-offset-2"
              : "bg-white border-slate-200 hover:border-amber-300 text-slate-800 hover:bg-amber-50/30"
          }`}
        >
          <span className={`block text-[11px] sm:text-xs uppercase tracking-wider font-bold ${
            statusFilter === "placed" ? "text-amber-100" : "text-amber-600"
          }`}>
            Pending Acceptance
          </span>
          <span className={`text-2xl sm:text-3xl font-extrabold font-primary block mt-1.5 ${
            statusFilter === "placed" ? "text-white" : "text-amber-700"
          }`}>
            {placedCount}
          </span>
          <div className={`text-[11px] mt-1 ${statusFilter === "placed" ? "text-amber-100" : "text-amber-600/80"}`}>
            Awaiting dispatch acceptance
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("in_transit")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition shadow-2xs relative overflow-hidden ${
            statusFilter === "in_transit"
              ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-600 ring-offset-2"
              : "bg-white border-slate-200 hover:border-blue-300 text-slate-800 hover:bg-blue-50/30"
          }`}
        >
          <span className={`block text-[11px] sm:text-xs uppercase tracking-wider font-bold ${
            statusFilter === "in_transit" ? "text-blue-100" : "text-blue-600"
          }`}>
            In Transit
          </span>
          <span className={`text-2xl sm:text-3xl font-extrabold font-primary block mt-1.5 ${
            statusFilter === "in_transit" ? "text-white" : "text-blue-700"
          }`}>
            {inTransitCount}
          </span>
          <div className={`text-[11px] mt-1 ${statusFilter === "in_transit" ? "text-blue-100" : "text-blue-600/80"}`}>
            OTP sent to customer
          </div>
        </button>

        <button
          onClick={() => setStatusFilter("delivered")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition shadow-2xs relative overflow-hidden ${
            statusFilter === "delivered"
              ? "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-600 ring-offset-2"
              : "bg-white border-slate-200 hover:border-emerald-300 text-slate-800 hover:bg-emerald-50/30"
          }`}
        >
          <span className={`block text-[11px] sm:text-xs uppercase tracking-wider font-bold ${
            statusFilter === "delivered" ? "text-emerald-100" : "text-emerald-600"
          }`}>
            Delivered
          </span>
          <span className={`text-2xl sm:text-3xl font-extrabold font-primary block mt-1.5 ${
            statusFilter === "delivered" ? "text-white" : "text-emerald-700"
          }`}>
            {deliveredCount}
          </span>
          <div className={`text-[11px] mt-1 ${statusFilter === "delivered" ? "text-emerald-100" : "text-emerald-600/80"}`}>
            OTP verified
          </div>
        </button>
      </div>

      {/* 3. SEARCH & STATUS FILTERS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Order #, Item ID or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition placeholder:text-slate-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Orders", count: orders.length },
            { id: "placed", label: "Order Placed", count: placedCount },
            { id: "in_transit", label: "In Transit", count: inTransitCount },
            { id: "delivered", label: "Delivered", count: deliveredCount }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                statusFilter === f.id
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{f.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === f.id ? "bg-slate-800 text-slate-200" : "bg-white text-slate-600"
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. ORDERS LIST */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 bg-white border border-slate-200/90 rounded-2xl">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent mb-3" />
          <p className="text-sm font-medium">Loading store orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {searchQuery ? "No matching orders found" : "No orders found in this status"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {searchQuery
              ? `No orders matched your search query "${searchQuery}". Try searching by a different term.`
              : "When customers place orders, they will appear here ready for dispatch and OTP verification."}
          </p>
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
              className="text-xs font-bold text-primary hover:underline inline-block mt-2"
            >
              Clear filters & show all orders
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedOrders.map((order) => {
              const formattedDate = order.created_at
                ? new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                : "Recent";

              const orderDisplayId = String(order.order_id || "").slice(0, 8).toUpperCase();
              const imageUrl = order.image_url
                ? order.image_url.startsWith("http")
                  ? order.image_url
                  : `http://localhost:5000/uploads/${order.image_url}`
                : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80";

              return (
                <div
                  key={order.item_id || order.order_id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition duration-150 space-y-4"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="font-mono font-bold text-xs sm:text-sm bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                        #{orderDisplayId}
                      </span>
                      
                      <span className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formattedDate}
                      </span>
                    </div>

                    <div>{getStatusBadge(order.item_status)}</div>
                  </div>

                  {/* Middle Content */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-slate-50 border border-slate-200/80 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={order.product_title || "Product"}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80";
                          }}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug hover:text-primary transition-colors">
                          {order.product_title || "Product Item"}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                            Qty: {order.quantity || 1}
                          </span>
                          {order.unit_price && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">
                                Price: <strong className="text-slate-800">₹{Number(order.unit_price).toLocaleString()}</strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Vendor Net Payout */}
                    <div className="bg-emerald-50/60 border border-emerald-100 sm:border-emerald-200/70 p-3 sm:py-2.5 sm:px-4 rounded-xl flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                      <div className="text-[11px] sm:text-xs text-emerald-800 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Your Payout</span>
                      </div>
                      <div className="text-lg sm:text-xl font-extrabold text-emerald-950 font-primary">
                        ₹{Number(order.vendor_earning || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Strip */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    {order.item_id ? (
                      <button
                        onClick={() => setTrackingItemId(order.item_id)}
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-primary bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition"
                      >
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>View Status Progress</span>
                      </button>
                    ) : <div className="hidden sm:block" />}

                    <Link
                      to={`/vendor/orders/${order.order_id}`}
                      className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-2xs active:scale-95 text-center"
                    >
                      <span>Update Status</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 5. PAGINATION FOOTER */}
          {totalItems > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600 font-medium">
                Showing <strong className="text-slate-900 font-bold">{startIndex + 1}</strong>–
                <strong className="text-slate-900 font-bold">{endIndex}</strong> of{" "}
                <strong className="text-slate-900 font-bold">{totalItems}</strong> orders
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition shadow-2xs active:scale-95"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((item, idx) => {
                    if (item === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-400 select-none">
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(item);
                    const isActive = safeCurrentPage === pageNum;
                    return (
                      <button
                        key={`page-${pageNum}`}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs font-extrabold transition shadow-2xs flex items-center justify-center ${
                          isActive
                            ? "bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-1"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition shadow-2xs active:scale-95"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* TRACKING STATUS MODAL */}
      {trackingItemId && (
        <TrackingModal
          itemId={trackingItemId}
          onClose={() => setTrackingItemId(null)}
        />
      )}
    </div>
  );
}