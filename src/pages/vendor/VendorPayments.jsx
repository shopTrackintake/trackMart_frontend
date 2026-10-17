import { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import socket from "../../services/socket";
import { 
  IndianRupee, Wallet, CheckCircle2, Clock, 
  Building2, Phone, MapPin, Hash, ArrowUpRight,
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight,
  Receipt, Calendar
} from "lucide-react";

export default function VendorPayments() {
  const [data, setData] = useState({
    received: 0,
    pending: 0,
    history: []
  });

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "pending" | "paid"
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "highest" | "lowest"
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const [payRes, userRes] = await Promise.allSettled([
          api.get("/vendor/payments"),
          api.get("/user/profile")
        ]);

        if (payRes.status === "fulfilled" && payRes.value?.data) {
          setData(payRes.value.data);
        }

        if (userRes.status === "fulfilled" && userRes.value?.data) {
          setVendor(userRes.value.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();

    const handleUpdate = () => {
      fetchPayments();
    };

    socket.on("order_updated", handleUpdate);
    socket.on("new_notification", handleUpdate);

    return () => {
      socket.off("order_updated", handleUpdate);
      socket.off("new_notification", handleUpdate);
    };
  }, []);

  const history = useMemo(() => Array.isArray(data.history) ? data.history : [], [data.history]);

  const pendingCount = useMemo(() => {
    return history.filter(p => String(p.payout_status || "").toLowerCase() === "pending").length;
  }, [history]);

  const paidCount = useMemo(() => {
    return history.filter(p => String(p.payout_status || "").toLowerCase() === "paid").length;
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        String(p.product_title || "").toLowerCase().includes(q) ||
        String(p.payout_reference || "").toLowerCase().includes(q) ||
        String(p.order_id || "").toLowerCase().includes(q);

      const status = String(p.payout_status || "").toLowerCase();
      if (statusFilter === "pending") return matchesSearch && status === "pending";
      if (statusFilter === "paid") return matchesSearch && status === "paid";

      return matchesSearch;
    }).sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      const amountA = Number(a.vendor_earning || 0);
      const amountB = Number(b.vendor_earning || 0);

      if (sortBy === "newest") return dateB - dateA;
      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "highest") return amountB - amountA;
      if (sortBy === "lowest") return amountA - amountB;
      return 0;
    });
  }, [history, searchQuery, statusFilter, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE) || 1;
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-bold font-primary">
          <span className="text-primary">Payouts</span>{" "}
          <span className="text-slate-900">& Finances</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Track received merchant earnings and pending weekly payout settlement cycles with status filters.
        </p>
      </div>

      {/* 2. STATS KPI CARDS - CLICKABLE TO FILTER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Received / Completed */}
        <div 
          onClick={() => setStatusFilter(statusFilter === "paid" ? "all" : "paid")}
          className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between cursor-pointer transition-all duration-200 ${
            statusFilter === "paid"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10"
              : "border-slate-200/90 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Settled / Completed Earnings</span>
              {statusFilter === "paid" && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                  Active Filter
                </span>
              )}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
            {loading ? "..." : `₹${Number(data.received || 0).toLocaleString()}`}
          </div>
          <div className="mt-1.5 text-xs text-emerald-600 font-medium flex items-center justify-between">
            <span>Successfully deposited to registered bank/UPI</span>
            <span className="font-bold">{paidCount} settled</span>
          </div>
        </div>

        {/* Pending */}
        <div 
          onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
          className={`bg-white border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between cursor-pointer transition-all duration-200 ${
            statusFilter === "pending"
              ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/10"
              : "border-slate-200/90 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Pending Settlement</span>
              {statusFilter === "pending" && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.2 rounded-full font-bold">
                  Active Filter
                </span>
              )}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
            {loading ? "..." : `₹${Number(data.pending || 0).toLocaleString()}`}
          </div>
          <div className="mt-1.5 text-xs text-amber-600 font-medium flex items-center justify-between">
            <span>Scheduled for automated payout transfer</span>
            <span className="font-bold">{pendingCount} pending</span>
          </div>
        </div>
      </div>

      {/* 3. SETTLEMENT BANKING / UPI DETAILS */}
      {vendor && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-primary">
            Payout Settlement Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium">Business Name</span>
              <p className="font-bold text-slate-800 text-sm truncate">{vendor.business_name || "Merchant Store"}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium">Settlement UPI ID</span>
              <p className="font-bold text-slate-800 text-sm truncate">{vendor.upi_id || "Not configured"}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium">Registered Phone</span>
              <p className="font-bold text-slate-800 text-sm truncate">{vendor.phone || "Not set"}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium">Shop Location</span>
              <p className="font-bold text-slate-800 text-sm truncate">{vendor.shop_address || "Not set"}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. TRANSACTION / PAYOUT HISTORY WITH FILTERS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-primary">
              Payout History &amp; Settlements
            </h2>
            <p className="text-xs text-slate-500">
              Showing {filteredHistory.length} of {history.length} payout records
            </p>
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>All Payouts</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === "all" ? "bg-slate-800 text-slate-200" : "bg-white text-slate-600"
              }`}>
                {history.length}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "pending"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === "pending" ? "bg-amber-700 text-white" : "bg-white text-amber-700"
              }`}>
                {pendingCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("paid")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                statusFilter === "paid"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed (Paid)</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                statusFilter === "paid" ? "bg-emerald-700 text-white" : "bg-white text-emerald-700"
              }`}>
                {paidCount}
              </span>
            </button>
          </div>
        </div>

        {/* SEARCH AND SORT BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search product or ref ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Amount: High to Low</option>
              <option value="lowest">Amount: Low to High</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent mb-2" />
            <p>Loading payout statements...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800">
                {searchQuery || statusFilter !== "all"
                  ? "No matching payout records found"
                  : "No payout transactions recorded yet"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || statusFilter !== "all"
                  ? "Try clearing your search query or switching to 'All Payouts'."
                  : "When your customer orders are completed and settled by admin, they will appear here."}
              </p>
            </div>
            {(searchQuery || statusFilter !== "all") && (
              <button
                onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
                className="text-xs font-bold text-primary hover:underline inline-block mt-1 cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-slate-500 border-b border-slate-100 pb-2">
                    <th className="pb-3 px-3">Product Item</th>
                    <th className="pb-3 px-3">Date</th>
                    <th className="pb-3 px-3">Amount</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3 text-right">Reference ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedHistory.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-medium text-slate-900 max-w-[220px] truncate">
                        {p.product_title || "Product Item"}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-xs">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        }) : "Recent"}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 font-mono">
                        ₹{Number(p.vendor_earning || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.payout_status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {p.payout_status === "paid" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Completed (Paid)</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pending</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-xs text-slate-400 font-mono">
                        {p.payout_reference || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
