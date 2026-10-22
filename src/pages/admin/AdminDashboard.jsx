import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { 
  TrendingUp, Wallet, ShoppingBag, Store, Package, Headphones,
  CheckCircle2, Clock, ArrowUpRight, RefreshCw, ShieldCheck, 
  AlertCircle, ChevronRight, Calendar, Zap, Activity, Eye, Truck,
  UserCheck, ExternalLink, Sparkles
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    vendors: 0,
    approvedVendors: 0,
    pending: 0,
    revenue: 0,
    grossVolume: 0,
    totalOrders: 0,
    pendingOrders: 0,
    inTransitOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
    openTickets: 0,
    recentOrders: [],
    recentVendors: []
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const res = await api.get("/admin/stats");
      setStats(prev => ({
        ...prev,
        ...res.data
      }));
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
      if (isManualRefresh) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-fadeIn">

      {/* ================= 1. EXECUTIVE WELCOME & TELEMETRY HEADER ================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/60">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white tracking-wide uppercase shadow-sm">
                Root Governance
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span>Marketplace Telemetry Live</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Platform Executive Console
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Real-time oversight of multi-vendor activities, platform GMV, fulfillment pipeline, and merchant compliance across all operational nodes.
            </p>
          </div>

          {/* Quick Actions & Status in Header */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {stats.pending > 0 && (
              <button
                onClick={() => navigate("/admin/approve-vendors")}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-orange-500/25 transition active:scale-95"
              >
                <AlertCircle className="w-4 h-4 animate-bounce" />
                <span>{stats.pending} Seller Review{stats.pending > 1 ? "s" : ""}</span>
              </button>
            )}

            <button
              onClick={() => fetchStats(true)}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold transition backdrop-blur-sm"
              title="Refresh platform statistics"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Refresh Data"}</span>
            </button>
          </div>
        </div>

        {/* Telemetry quick bar */}
        <div className="mt-6 pt-5 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>RBAC Admin Session Active</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Razorpay Webhooks Active</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-sky-400" />
              <span>OTP Dispatch System Live</span>
            </span>
          </div>

          {lastUpdated && (
            <div className="text-slate-400 text-[11px]">
              Last synced: {formatTime(lastUpdated)}
            </div>
          )}
        </div>
      </div>

      {/* ================= 2. CORE KPI METRICS GRID ================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span>Key Performance Indicators</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Platform Cumulative Metrics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

          {/* KPI 1: Gross Platform GMV */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Sales (GMV)</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : formatCurrency(stats.grossVolume)}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>Total consumer volume processed</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">100% Escrow Tracked</span>
              <span className="text-slate-400 font-medium">All Time</span>
            </div>
          </div>

          {/* KPI 2: Net Commission Revenue */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Revenue</span>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center border border-orange-100 group-hover:scale-110 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
                {loading ? "..." : formatCurrency(stats.revenue)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Net marketplace commission retained
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link to="/admin/vendor-payments" className="text-primary font-semibold hover:underline flex items-center gap-1">
                <span>View Payouts</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-slate-400 font-medium">5% Rate</span>
            </div>
          </div>

          {/* KPI 3: Orders Lifecycle */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : stats.totalOrders}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <span className="text-emerald-600 font-semibold">{stats.deliveredOrders} Delivered</span>
                <span>•</span>
                <span className="text-blue-600 font-semibold">{stats.inTransitOrders} In Transit</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link to="/admin/orders" className="text-blue-600 font-semibold hover:underline flex items-center gap-1">
                <span>Monitor Orders</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-slate-400 font-medium">Lifecycle Tracking</span>
            </div>
          </div>

          {/* KPI 4: Vendor Network */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Merchant Network</span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 group-hover:scale-110 transition-transform">
                <Store className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {loading ? "..." : stats.vendors}
                </h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {stats.approvedVendors} Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.pending > 0 ? (
                  <span className="text-amber-600 font-semibold">
                    {stats.pending} application{stats.pending > 1 ? "s" : ""} pending review
                  </span>
                ) : (
                  "All vendor applications processed"
                )}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link to="/admin/vendors" className="text-purple-600 font-semibold hover:underline flex items-center gap-1">
                <span>Vendors Directory</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              {stats.pending > 0 && (
                <Link to="/admin/approve-vendors" className="text-amber-600 font-bold hover:underline">
                  Verify Sellers ({stats.pending})
                </Link>
              )}
            </div>
          </div>

          {/* KPI 5: Active Catalog Products */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Catalog Products</span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : stats.totalProducts}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Active listings with verified specifications
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link to="/admin/products" className="text-indigo-600 font-semibold hover:underline flex items-center gap-1">
                <span>Product Moderation</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-slate-400 font-medium">Quality Checked</span>
            </div>
          </div>

          {/* KPI 6: Support Desk */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Support Desk</span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-110 transition-transform">
                <Headphones className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {loading ? "..." : stats.openTickets}
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  Open Tickets
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customer and vendor support inquiries
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link to="/admin/support" className="text-rose-600 font-semibold hover:underline flex items-center gap-1">
                <span>Open Support Desk</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-slate-400 font-medium">24/7 SLA</span>
            </div>
          </div>

        </div>
      </div>

      {/* ================= 3. QUICK COMMAND LAUNCHPAD ================= */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Operations Launchpad
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Direct access to platform governance modules and management workflows.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            6 Operational Modules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Module 1: Seller Verification & Approvals */}
          <div 
            onClick={() => navigate("/admin/approve-vendors")}
            className="p-5 rounded-2xl border border-slate-200/90 hover:border-orange-300 bg-gradient-to-br from-white to-orange-50/20 hover:to-orange-50/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-orange-100 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <UserCheck className="w-5 h-5" />
                </div>
                {stats.pending > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white animate-pulse shadow-xs">
                    {stats.pending} Pending
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Up to date
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-primary transition-colors">
                Seller Verification & Approvals
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Review incoming merchant registrations, verify store profiles, business credentials, and activate seller storefronts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-primary gap-1 group-hover:translate-x-1 transition-transform">
              <span>Review Applications</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Module 2: Product Moderation */}
          <div 
            onClick={() => navigate("/admin/products")}
            className="p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 bg-gradient-to-br from-white to-indigo-50/20 hover:to-indigo-50/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Package className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  {stats.totalProducts} Items
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                Product Moderation
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Inspect seller inventory, verify nutritional claims, manage pricing compliance, or deactivate listings.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-indigo-600 gap-1 group-hover:translate-x-1 transition-transform">
              <span>Moderate Catalog</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Module 3: Order Lifecycle */}
          <div 
            onClick={() => navigate("/admin/orders")}
            className="p-5 rounded-2xl border border-slate-200/90 hover:border-blue-300 bg-gradient-to-br from-white to-blue-50/20 hover:to-blue-50/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  {stats.totalOrders} Orders
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                Order Lifecycle
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Monitor global order statuses, dispatch schedules, OTP delivery handoffs, and customer refund claims.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600 gap-1 group-hover:translate-x-1 transition-transform">
              <span>Inspect Orders</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Module 4: Vendor Payouts */}
          <div 
            onClick={() => navigate("/admin/vendor-payments")}
            className="p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-300 bg-gradient-to-br from-white to-emerald-50/20 hover:to-emerald-50/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Wallet className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                  Settlements
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                Vendor Payments & Dues
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Calculate weekly seller sales, deduct platform commissions, and execute direct settlement payouts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-600 gap-1 group-hover:translate-x-1 transition-transform">
              <span>Manage Settlements</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Module 5: Customer Support */}
          <div 
            onClick={() => navigate("/admin/support")}
            className="p-5 rounded-2xl border border-slate-200/90 hover:border-rose-300 bg-gradient-to-br from-white to-rose-50/20 hover:to-rose-50/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Headphones className="w-5 h-5" />
                </div>
                {stats.openTickets > 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs">
                    {stats.openTickets} Open
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    Clear
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-600 transition-colors">
                Support & Inquiries Desk
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Review contact messages, respond to customer inquiries, and handle buyer dispute tickets.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-rose-600 gap-1 group-hover:translate-x-1 transition-transform">
              <span>View Support Tickets</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Module 6: Verified Vendors */}
          <div 
            onClick={() => navigate("/admin/vendors")}
            className="p-5 rounded-2xl border border-slate-200/90 hover:border-purple-300 bg-gradient-to-br from-white to-purple-50/20 hover:to-purple-50/50 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Store className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                  {stats.approvedVendors} Active
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base group-hover:text-purple-600 transition-colors">
                Merchant Directory
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Directory of all verified vendors, store contacts, performance history, and active catalog counts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-bold text-purple-600 gap-1 group-hover:translate-x-1 transition-transform">
              <span>View Directory</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

        </div>
      </div>

      {/* ================= 4. RECENT ACTIVITY DUAL COLUMNS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT COLUMN: RECENT ORDERS STREAM */}
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Recent Orders Stream
                </h3>
              </div>
              <Link 
                to="/admin/orders" 
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>View All ({stats.totalOrders})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {order.payment_status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate">
                        Customer: <span className="font-medium text-slate-800">{order.customer_name || "Guest Buyer"}</span>
                        {" • "}{order.item_count} item{order.item_count > 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-slate-900">
                        {formatCurrency(Number(order.total_amount))}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">
                No orders recorded yet.
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <Link 
              to="/admin/orders"
              className="text-xs font-bold text-slate-600 hover:text-primary transition inline-flex items-center gap-1.5"
            >
              <span>Manage All Order Lifecycles</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT VENDOR APPLICATIONS */}
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Merchant Registrations
                </h3>
              </div>
              <Link 
                to="/admin/vendors" 
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Directory ({stats.vendors})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {stats.recentVendors && stats.recentVendors.length > 0 ? (
              <div className="space-y-3">
                {stats.recentVendors.map((vendor) => (
                  <div 
                    key={vendor.id} 
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {vendor.business_name || "Merchant Store"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          vendor.kyc_status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : vendor.kyc_status === "pending"
                            ? "bg-amber-100 text-amber-800 animate-pulse"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {vendor.kyc_status === "approved" ? "Verified" : vendor.kyc_status === "pending" ? "Pending Approval" : "On Hold"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {vendor.name} • {vendor.email}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {vendor.kyc_status === "pending" ? (
                        <button
                          onClick={() => navigate("/admin/approve-vendors")}
                          className="px-3 py-1.5 bg-primary hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-2xs transition"
                        >
                          Verify Seller
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/admin/vendors/${vendor.id}`)}
                          className="px-3 py-1.5 border border-slate-200 hover:border-primary text-slate-600 hover:text-primary text-xs font-semibold rounded-lg bg-white transition"
                        >
                          Store Profile
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">
                No vendor registrations found.
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <Link 
              to="/admin/approve-vendors"
              className="text-xs font-bold text-slate-600 hover:text-primary transition inline-flex items-center gap-1.5"
            >
              <span>Open Seller Approvals Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}