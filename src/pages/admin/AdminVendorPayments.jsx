import React, { useState, useEffect, useMemo, Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import {
  CreditCard,
  DollarSign,
  Send,
  Store,
  Phone,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  User,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building2,
  FileText,
  Clock,
  Package,
  X,
  Eye,
  MapPin,
  Mail,
  RotateCcw,
  ShieldCheck,
  Layers,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  List
} from "lucide-react";

export default function AdminVendorPayments() {
  const navigate = useNavigate();

  // Active Hub Tab: 'vendors' (Vendor Payouts & Dues) vs 'refunds' (Buyer Refunds & Disputes)
  const [activeTab, setActiveTab] = useState("vendors");

  // Layout View Mode: 'cards' (Modern Card Grid) vs 'table' (Tabular Audit View)
  const [viewMode, setViewMode] = useState("cards");

  // Data states
  const [vendors, setVendors] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorStatusFilter, setVendorStatusFilter] = useState("all"); // 'all', 'due', 'settled'
  const [refundStatusFilter, setRefundStatusFilter] = useState("all"); // 'all', 'processing', 'refunded'
  const [sortBy, setSortBy] = useState("amount_desc"); // 'amount_desc', 'amount_asc', 'name_asc'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  // 1. Vendor Detail Dossier & Items Modal
  const [viewVendor, setViewVendor] = useState(null);
  const [vendorItems, setVendorItems] = useState([]);
  const [loadingVendorItems, setLoadingVendorItems] = useState(false);

  // 2. Vendor Payout Disburse Modal
  const [payoutVendor, setPayoutVendor] = useState(null);
  const [payoutReference, setPayoutReference] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [clearingPayout, setClearingPayout] = useState(false);

  // 3. Buyer Refund Detail Modal
  const [viewRefund, setViewRefund] = useState(null);

  // 4. Buyer Process Refund Modal
  const [refundOrder, setRefundOrder] = useState(null);
  const [refundReference, setRefundReference] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundNote, setRefundNote] = useState("");
  const [processingRefund, setProcessingRefund] = useState(false);

  /* ================= FETCH ALL FINANCIAL TELEMETRY ================= */
  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);

      const [vendorRes, refundRes] = await Promise.all([
        api.get("/admin/vendor-earnings"),
        api.get("/admin/buyer-refunds")
      ]);

      setVendors(vendorRes.data || []);
      setRefunds(refundRes.data || []);
    } catch (err) {
      console.error("Error loading financial data:", err);
      showToast("Failed to sync financial telemetry", "error");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  /* ================= FETCH VENDOR ITEMS BREAKDOWN ================= */
  const handleOpenVendorDossier = async (vendor) => {
    setViewVendor(vendor);
    setLoadingVendorItems(true);
    setVendorItems([]);
    try {
      const res = await api.get(`/admin/vendor-payout-items/${vendor.vendor_id}`);
      setVendorItems(res.data || []);
    } catch (err) {
      console.error("Error loading vendor items:", err);
    } finally {
      setLoadingVendorItems(false);
    }
  };

  /* ================= EXECUTE VENDOR PAYOUT ================= */
  const handleClearPayment = async (e) => {
    e?.preventDefault();
    if (!payoutVendor) return;
    try {
      setClearingPayout(true);
      const ref = payoutReference.trim() || `PAY-${Date.now().toString().slice(-8)}`;
      const res = await api.post(`/admin/vendor-payout/${payoutVendor.vendor_id}`, { 
        reference: ref,
        amount: payoutAmount !== "" ? Number(payoutAmount) : Number(payoutVendor.total_earning || 0)
      });

      showToast(res.data?.message || "Vendor payout cleared and disbursed successfully!");
      setPayoutVendor(null);
      setPayoutReference("");
      setPayoutAmount("");
      if (viewVendor && viewVendor.vendor_id === payoutVendor.vendor_id) {
        setViewVendor(prev => ({ ...prev, total_earning: 0, pending_orders_count: 0 }));
      }
      fetchData(true);
    } catch (err) {
      console.error("Payout disbursal error:", err);
      showToast(err.response?.data?.message || "Failed to disburse payout", "error");
    } finally {
      setClearingPayout(false);
    }
  };

  /* ================= EXECUTE BUYER REFUND ================= */
  const handleProcessRefund = async (e) => {
    e?.preventDefault();
    if (!refundOrder) return;
    try {
      setProcessingRefund(true);
      const ref = refundReference.trim() || `REF-${Date.now().toString().slice(-8)}`;
      const note = refundNote.trim() || `Refund settled via transaction reference #${ref}`;

      const res = await api.post("/admin/process-refund", {
        order_id: refundOrder.order_id,
        reference: ref,
        note,
        amount: refundAmount !== "" ? Number(refundAmount) : Number(refundOrder.refund_amount || refundOrder.total_amount || 0)
      });

      showToast(res.data?.message || "Buyer refund settled and customer notified!");
      setRefundOrder(null);
      setRefundReference("");
      setRefundAmount("");
      setRefundNote("");
      if (viewRefund && viewRefund.order_id === refundOrder.order_id) {
        setViewRefund(prev => ({ ...prev, refund_status: "refunded", refund_note: note }));
      }
      fetchData(true);
    } catch (err) {
      console.error("Refund processing error:", err);
      showToast(err.response?.data?.message || "Failed to process refund", "error");
    } finally {
      setProcessingRefund(false);
    }
  };

  /* ================= KPI TELEMETRY CALCULATIONS ================= */
  const financialStats = useMemo(() => {
    let totalVendorDues = 0;
    let totalVendorSettled = 0;
    let vendorsAwaitingPayout = 0;

    vendors.forEach(v => {
      const due = Number(v.total_earning || 0);
      const settled = Number(v.total_settled || 0);
      totalVendorDues += due;
      totalVendorSettled += settled;
      if (due > 0) vendorsAwaitingPayout += 1;
    });

    let totalPendingRefunds = 0;
    let totalSettledRefunds = 0;
    let pendingRefundCount = 0;
    let settledRefundCount = 0;

    refunds.forEach(r => {
      const amt = Number(r.refund_amount || r.total_amount || 0);
      const st = String(r.refund_status || "").toLowerCase();
      if (st === "refunded") {
        totalSettledRefunds += amt;
        settledRefundCount += 1;
      } else {
        totalPendingRefunds += amt;
        pendingRefundCount += 1;
      }
    });

    return {
      totalVendorDues,
      totalVendorSettled,
      vendorsAwaitingPayout,
      totalPendingRefunds,
      totalSettledRefunds,
      pendingRefundCount,
      settledRefundCount
    };
  }, [vendors, refunds]);

  /* ================= FILTERED VENDORS LIST ================= */
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        String(v.business_name || "").toLowerCase().includes(q) ||
        String(v.owner_name || "").toLowerCase().includes(q) ||
        String(v.phone || "").toLowerCase().includes(q) ||
        String(v.upi_id || "").toLowerCase().includes(q) ||
        String(v.bank_account_number || "").toLowerCase().includes(q) ||
        String(v.bank_ifsc || "").toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const due = Number(v.total_earning || 0);
      if (vendorStatusFilter === "due" && due <= 0) return false;
      if (vendorStatusFilter === "settled" && due > 0) return false;

      return true;
    }).sort((a, b) => {
      const dueA = Number(a.total_earning || 0);
      const dueB = Number(b.total_earning || 0);
      if (sortBy === "amount_desc") return dueB - dueA;
      if (sortBy === "amount_asc") return dueA - dueB;
      if (sortBy === "name_asc") return String(a.business_name || "").localeCompare(String(b.business_name || ""));
      return dueB - dueA;
    });
  }, [vendors, searchQuery, vendorStatusFilter, sortBy]);

  /* ================= FILTERED BUYER REFUNDS LIST ================= */
  const filteredRefunds = useMemo(() => {
    return refunds.filter(r => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        String(r.order_id || "").toLowerCase().includes(q) ||
        String(r.buyer_name || "").toLowerCase().includes(q) ||
        String(r.buyer_email || "").toLowerCase().includes(q) ||
        String(r.buyer_phone || "").toLowerCase().includes(q) ||
        String(r.cancellation_reason || "").toLowerCase().includes(q) ||
        String(r.city || "").toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const st = String(r.refund_status || "").toLowerCase();
      if (refundStatusFilter === "processing" && st === "refunded") return false;
      if (refundStatusFilter === "refunded" && st !== "refunded") return false;

      return true;
    }).sort((a, b) => {
      const amtA = Number(a.refund_amount || a.total_amount || 0);
      const amtB = Number(b.refund_amount || b.total_amount || 0);
      if (sortBy === "amount_desc") return amtB - amtA;
      if (sortBy === "amount_asc") return amtA - amtB;
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [refunds, searchQuery, refundStatusFilter, sortBy]);

  // Current dataset based on active tab
  const currentDataset = activeTab === "vendors" ? filteredVendors : filteredRefunds;
  const totalPages = Math.ceil(currentDataset.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, vendorStatusFilter, refundStatusFilter, sortBy]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return currentDataset.slice(start, start + itemsPerPage);
  }, [currentDataset, currentPage, itemsPerPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 animate-slideIn ${
            toastMessage.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {toastMessage.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          )}
          <span className="text-xs font-bold">{toastMessage.msg}</span>
        </div>
      )}

      {/* 1. TOP HEADER BANNER (Clean Light Theme) */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 text-slate-900 shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-orange-100/50 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full bg-slate-100/60 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-xs font-bold border border-emerald-200 text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>RBAC Financial Treasury Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Payouts, Dues &amp; Refund Settlements Hub
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Unified treasury terminal for disbursing merchant weekly earnings, auditing vendor bank accounts &amp; UPI credentials, and processing customer dispute refunds.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold transition shadow-sm"
              title="Sync treasury balances"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
              <span>{isRefreshing ? "Syncing Balances..." : "Sync Treasury"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE FINANCIAL KPI TELEMETRY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vendor Outstanding Dues */}
        <div
          onClick={() => {
            setActiveTab("vendors");
            setVendorStatusFilter("due");
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === "vendors" && vendorStatusFilter === "due"
              ? "bg-amber-50/80 border-amber-300 shadow-sm ring-2 ring-amber-400/20"
              : "bg-white border-slate-200/90 hover:border-amber-300 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Outstanding Vendor Dues</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-600">
              ₹{financialStats.totalVendorDues.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between font-medium">
              <span>{financialStats.vendorsAwaitingPayout} merchant{financialStats.vendorsAwaitingPayout === 1 ? "" : "s"} awaiting payout</span>
              <span className="text-amber-600 font-bold text-[10px]">Filter &rarr;</span>
            </p>
          </div>
        </div>

        {/* Vendor Settled */}
        <div
          onClick={() => {
            setActiveTab("vendors");
            setVendorStatusFilter("settled");
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === "vendors" && vendorStatusFilter === "settled"
              ? "bg-emerald-50/80 border-emerald-300 shadow-sm ring-2 ring-emerald-400/20"
              : "bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Disbursed to Merchants</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{financialStats.totalVendorSettled.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between font-medium">
              <span>Historical settled earnings</span>
              <span className="text-emerald-600 font-bold text-[10px]">Filter &rarr;</span>
            </p>
          </div>
        </div>

        {/* Buyer Pending Refunds */}
        <div
          onClick={() => {
            setActiveTab("refunds");
            setRefundStatusFilter("processing");
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === "refunds" && refundStatusFilter === "processing"
              ? "bg-rose-50/80 border-rose-300 shadow-sm ring-2 ring-rose-400/20"
              : "bg-white border-slate-200/90 hover:border-rose-300 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Pending Buyer Refunds</span>
            <RotateCcw className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-rose-600">
              ₹{financialStats.totalPendingRefunds.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between font-medium">
              <span>{financialStats.pendingRefundCount} claim{financialStats.pendingRefundCount === 1 ? "" : "s"} to be credited</span>
              <span className="text-rose-600 font-bold text-[10px]">Filter &rarr;</span>
            </p>
          </div>
        </div>

        {/* Buyer Settled Refunds */}
        <div
          onClick={() => {
            setActiveTab("refunds");
            setRefundStatusFilter("refunded");
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeTab === "refunds" && refundStatusFilter === "refunded"
              ? "bg-purple-50/80 border-purple-300 shadow-sm ring-2 ring-purple-400/20"
              : "bg-white border-slate-200/90 hover:border-purple-300 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Refunds Settled</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              ₹{financialStats.totalSettledRefunds.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between font-medium">
              <span>{financialStats.settledRefundCount} customer claims completed</span>
              <span className="text-purple-600 font-bold text-[10px]">Filter &rarr;</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. DUAL-STREAM SELECTION TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab("vendors")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "vendors"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Store className="w-4 h-4 text-primary" />
            <span>Merchant Payouts &amp; Dues</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
              {financialStats.vendorsAwaitingPayout} Due
            </span>
          </button>

          <button
            onClick={() => setActiveTab("refunds")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === "refunds"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Buyer Refunds &amp; Claims</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              financialStats.pendingRefundCount > 0 ? "bg-rose-100 text-rose-800 animate-pulse" : "bg-slate-200 text-slate-700"
            }`}>
              {financialStats.pendingRefundCount} Pending
            </span>
          </button>
        </div>

        {/* Quick Help / Info Pill */}
        <div className="text-xs text-slate-500 flex items-center gap-1.5 self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>
            {activeTab === "vendors"
              ? "All payments verified with vendor bank account & UTR tracking."
              : "Disburse refunds directly to buyer via Razorpay / UPI reference."}
          </span>
        </div>
      </div>

      {/* 4. MULTI-ATTRIBUTE SEARCH & FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">

          {/* Search bar (5 cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "vendors"
                  ? "Search by Merchant Name, Owner, Phone, Bank Account, or UPI ID..."
                  : "Search by Order ID, Buyer Name, Email, Phone, or City..."
              }
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

          {/* Status Filter (3 cols) */}
          <div className="md:col-span-3">
            {activeTab === "vendors" ? (
              <select
                value={vendorStatusFilter}
                onChange={(e) => setVendorStatusFilter(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700"
              >
                <option value="all">All Vendors ({vendors.length})</option>
                <option value="due">Awaiting Payout (Due &gt; 0)</option>
                <option value="settled">Settled / Zero Due</option>
              </select>
            ) : (
              <select
                value={refundStatusFilter}
                onChange={(e) => setRefundStatusFilter(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700"
              >
                <option value="all">All Refund Statuses ({refunds.length})</option>
                <option value="processing">Pending / Processing Refund</option>
                <option value="refunded">Refunded / Disbursed</option>
              </select>
            )}
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
                <option value="amount_desc">Amount: High to Low</option>
                <option value="amount_asc">Amount: Low to High</option>
                {activeTab === "vendors" && (
                  <option value="name_asc">Merchant Name (A-Z)</option>
                )}
              </select>
            </div>
          </div>

          {/* View Mode Toggle: Cards vs Table (2 cols) */}
          <div className="md:col-span-2 flex items-center justify-end">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto justify-center">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "cards"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-primary" />
                <span>Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 5. TAB 1: VENDOR PAYOUTS & SETTLEMENT HUB */}
      {activeTab === "vendors" && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
              <p className="text-slate-500 font-semibold text-xs">Loading vendor earnings and banking details...</p>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-50 text-primary flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Merchant Payouts Found</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                No vendors match your current search or filter criteria.
              </p>
            </div>
          ) : viewMode === "cards" ? (
            /* ================= VENDOR CARDS GRID ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedData.map((v) => {
                const amount = Number(v.total_earning || 0);
                const hasDue = amount > 0;

                return (
                  <div
                    key={v.vendor_id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      {/* Card Header: Store Avatar, Name, Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 text-primary border border-orange-300 flex items-center justify-center shrink-0 font-black text-base group-hover:scale-105 transition-transform">
                            {v.business_name?.[0]?.toUpperCase() || "S"}
                          </div>
                          <div className="min-w-0">
                            <h3
                              onClick={() => handleOpenVendorDossier(v)}
                              className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-primary transition-colors truncate cursor-pointer"
                              title={v.business_name}
                            >
                              {v.business_name}
                            </h3>
                            <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{v.owner_name || "N/A"}</span>
                              {v.phone && <span>• {v.phone}</span>}
                            </p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                          hasDue
                            ? "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}>
                          {hasDue ? "Settlement Due" : "All Settled"}
                        </span>
                      </div>

                      {/* Outstanding Amount Highlight Box */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Pending Payout Due
                          </span>
                          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                            ₹{amount.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div className="text-right space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Orders Awaiting
                          </span>
                          <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {v.pending_orders_count || 0} items
                          </span>
                          {v.commission_percent !== undefined && (
                            <span className="text-[10px] text-primary font-bold block">
                              Fee: {v.commission_percent}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bank & UPI Credentials Box */}
                      <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2 text-xs">
                        {/* UPI */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">UPI:</span>
                            <span className="font-mono text-xs font-bold text-slate-800 truncate">
                              {v.upi_id || "Not registered"}
                            </span>
                          </div>
                          {v.upi_id && (
                            <button
                              onClick={() => handleCopy(v.upi_id, `card-upi-${v.vendor_id}`)}
                              className="text-slate-400 hover:text-primary transition p-0.5 shrink-0"
                              title="Copy UPI ID"
                            >
                              {copiedKey === `card-upi-${v.vendor_id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Bank Account */}
                        {v.bank_account_number ? (
                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">A/C:</span>
                              <span className="font-mono text-xs font-semibold text-slate-700 truncate">
                                {v.bank_account_number} {v.bank_ifsc ? `(${v.bank_ifsc})` : ""}
                              </span>
                            </div>
                            <button
                              onClick={() => handleCopy(v.bank_account_number, `card-bank-${v.vendor_id}`)}
                              className="text-slate-400 hover:text-primary transition p-0.5 shrink-0"
                              title="Copy Account Number"
                            >
                              {copiedKey === `card-bank-${v.vendor_id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          !v.upi_id && (
                            <div className="text-[11px] text-slate-400 italic">
                              No bank or UPI registered yet
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenVendorDossier(v)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-primary hover:bg-orange-50 text-xs font-bold transition"
                        title="View Vendor Payout Dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dossier</span>
                      </button>

                      {hasDue ? (
                        <button
                          onClick={() => {
                            setPayoutVendor(v);
                            setPayoutReference(`PAY-${Date.now().toString().slice(-6)}`);
                            setPayoutAmount(v.total_earning || 0);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition shadow-2xs active:scale-95"
                          title="Disburse Payout to Merchant"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Pay Merchant</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>All Settled</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ================= VENDOR TABLE VIEW ================= */
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Merchant Storefront</th>
                      <th className="px-5 py-3.5">Owner &amp; Phone</th>
                      <th className="px-5 py-3.5">Pending Dues</th>
                      <th className="px-5 py-3.5">Bank / UPI Credentials</th>
                      <th className="px-5 py-3.5">Settlement Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {paginatedData.map((v) => {
                      const amount = Number(v.total_earning || 0);
                      const hasDue = amount > 0;

                      return (
                        <tr key={v.vendor_id} className="hover:bg-slate-50/70 transition group">
                          {/* 1. STOREFRONT */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/70 text-primary flex items-center justify-center shrink-0">
                                <Store className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h4
                                  onClick={() => handleOpenVendorDossier(v)}
                                  className="font-bold text-slate-900 hover:text-primary transition cursor-pointer truncate max-w-[180px]"
                                  title={v.business_name}
                                >
                                  {v.business_name}
                                </h4>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                  <span>ID: #{String(v.vendor_id || "").slice(0, 8)}</span>
                                  {v.commission_percent !== undefined && (
                                    <span>• Fee: {v.commission_percent}%</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. OWNER & PHONE */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <p className="font-bold text-slate-800">{v.owner_name || "N/A"}</p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{v.phone || "No phone"}</span>
                            </p>
                          </td>

                          {/* 3. PENDING DUES */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-baseline gap-1">
                              <span className="text-base font-black text-slate-900">
                                ₹{amount.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {v.pending_orders_count || 0} order item{(v.pending_orders_count || 0) === 1 ? "" : "s"}
                            </span>
                          </td>

                          {/* 4. BANK / UPI CREDENTIALS */}
                          <td className="px-5 py-4">
                            <div className="space-y-1 max-w-xs">
                              {v.upi_id ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">UPI:</span>
                                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                    {v.upi_id}
                                  </span>
                                  <button
                                    onClick={() => handleCopy(v.upi_id, `upi-${v.vendor_id}`)}
                                    className="text-slate-400 hover:text-primary transition p-0.5"
                                    title="Copy UPI ID"
                                  >
                                    {copiedKey === `upi-${v.vendor_id}` ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              ) : null}

                              {v.bank_account_number ? (
                                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                                  <span className="text-slate-400">A/C:</span>
                                  <span className="font-mono font-semibold">{v.bank_account_number}</span>
                                  {v.bank_ifsc && (
                                    <span className="text-slate-400 text-[10px]">({v.bank_ifsc})</span>
                                  )}
                                  <button
                                    onClick={() => handleCopy(v.bank_account_number, `bank-${v.vendor_id}`)}
                                    className="text-slate-400 hover:text-primary transition p-0.5 ml-1"
                                    title="Copy Account Number"
                                  >
                                    {copiedKey === `bank-${v.vendor_id}` ? (
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              ) : (
                                !v.upi_id && <span className="text-slate-400 text-[11px]">No bank / UPI registered</span>
                              )}
                            </div>
                          </td>

                          {/* 5. SETTLEMENT STATUS */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              hasDue
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}>
                              {hasDue ? "Settlement Due" : "All Settled"}
                            </span>
                          </td>

                          {/* 6. ACTIONS */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenVendorDossier(v)}
                                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-primary hover:bg-orange-50 transition"
                                title="Inspect Payment Dossier &amp; Orders"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {hasDue ? (
                                <button
                                  onClick={() => {
                                    setPayoutVendor(v);
                                    setPayoutReference(`PAY-${Date.now().toString().slice(-6)}`);
                                    setPayoutAmount(v.total_earning || 0);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition shadow-xs active:scale-95"
                                  title="Disburse Payout"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Pay Merchant</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400 px-2 py-1">
                                  No Dues
                                </span>
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
        </div>
      )}

      {/* 6. TAB 2: BUYER REFUNDS & CLAIMS HUB */}
      {activeTab === "refunds" && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin mb-3"></div>
              <p className="text-slate-500 font-semibold text-xs">Loading customer refund claims...</p>
            </div>
          ) : filteredRefunds.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Buyer Refunds Found</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                No cancelled or refunded orders matching your filter criteria.
              </p>
            </div>
          ) : viewMode === "cards" ? (
            /* ================= BUYER REFUNDS CARDS GRID ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedData.map((r) => {
                const amount = Number(r.refund_amount || r.total_amount || 0);
                const isPending = String(r.refund_status || "").toLowerCase() !== "refunded";

                return (
                  <div
                    key={r.order_id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      {/* Header: Order ID, Date & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              #{String(r.order_id).slice(0, 8).toUpperCase()}
                            </span>
                            <button
                              onClick={() => handleCopy(r.order_id, `card-ref-${r.order_id}`)}
                              className="text-slate-400 hover:text-primary transition p-0.5"
                              title="Copy Order UUID"
                            >
                              {copiedKey === `card-ref-${r.order_id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {new Date(r.cancelled_at || r.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                          isPending
                            ? "bg-rose-100 text-rose-800 border border-rose-200 animate-pulse"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}>
                          {isPending ? "Refund Pending" : "Refund Settled"}
                        </span>
                      </div>

                      {/* Customer Details */}
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{r.buyer_name || "Customer"}</span>
                        </p>
                        <p className="text-slate-500 truncate" title={r.buyer_email}>
                          {r.buyer_email}
                        </p>
                        {r.buyer_phone && (
                          <p className="text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{r.buyer_phone}</span>
                          </p>
                        )}
                      </div>

                      {/* Refund Highlight Box */}
                      <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                            Refund Amount
                          </span>
                          <div className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">
                            ₹{amount.toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Method
                          </span>
                          <span className="text-xs font-bold text-slate-700 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                            {r.payment_method || "ONLINE"}
                          </span>
                        </div>
                      </div>

                      {/* Cancellation Reason */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Reason:</span>
                        <p className="line-clamp-2 leading-relaxed text-[11px]">
                          {r.cancellation_reason || "Customer requested order cancellation"}
                        </p>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setViewRefund(r)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-primary hover:bg-orange-50 text-xs font-bold transition"
                        title="Inspect Buyer Claim"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Claim Detail</span>
                      </button>

                      {isPending ? (
                        <button
                          onClick={() => {
                            setRefundOrder(r);
                            setRefundReference(`REF-${Date.now().toString().slice(-6)}`);
                            setRefundAmount(r.refund_amount || r.total_amount || 0);
                            setRefundNote(`Refund of ₹${amount} credited via Razorpay/Bank transfer`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-2xs active:scale-95"
                          title="Disburse Refund to Buyer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Pay Buyer</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Credited</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ================= BUYER REFUNDS TABLE VIEW ================= */
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Order ID &amp; Date</th>
                      <th className="px-5 py-3.5">Customer / Claimant</th>
                      <th className="px-5 py-3.5">Cancellation Reason</th>
                      <th className="px-5 py-3.5">Refund Amount</th>
                      <th className="px-5 py-3.5">Refund Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {paginatedData.map((r) => {
                      const amount = Number(r.refund_amount || r.total_amount || 0);
                      const isPending = String(r.refund_status || "").toLowerCase() !== "refunded";

                      return (
                        <tr key={r.order_id} className="hover:bg-slate-50/70 transition group">
                          {/* 1. ORDER ID & DATE */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900">
                                #{String(r.order_id).slice(0, 8).toUpperCase()}
                              </span>
                              <button
                                onClick={() => handleCopy(r.order_id, `ref-order-${r.order_id}`)}
                                className="text-slate-400 hover:text-primary transition p-0.5"
                                title="Copy Order UUID"
                              >
                                {copiedKey === `ref-order-${r.order_id}` ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {new Date(r.cancelled_at || r.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </span>
                          </td>

                          {/* 2. CUSTOMER */}
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-900">{r.buyer_name || "Customer"}</p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[140px]" title={r.buyer_email}>
                              {r.buyer_email}
                            </p>
                            {r.buyer_phone && (
                              <p className="text-[10px] text-slate-400 mt-0.5">{r.buyer_phone}</p>
                            )}
                          </td>

                          {/* 3. CANCELLATION REASON */}
                          <td className="px-5 py-4">
                            <p className="text-xs text-slate-700 max-w-xs line-clamp-2 leading-relaxed">
                              {r.cancellation_reason || "Customer cancelled order before delivery"}
                            </p>
                            <span className="text-[10px] text-slate-400 uppercase font-bold mt-0.5 block">
                              Method: {r.payment_method || "ONLINE"}
                            </span>
                          </td>

                          {/* 4. REFUND AMOUNT */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-base font-black text-rose-600">
                              ₹{amount.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Total Order: ₹{Number(r.total_amount || 0).toLocaleString("en-IN")}
                            </span>
                          </td>

                          {/* 5. REFUND STATUS */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isPending
                                ? "bg-orange-100 text-orange-800 border border-orange-200 animate-pulse"
                                : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}>
                              {isPending ? "Refund Pending" : "Refund Settled"}
                            </span>
                            {r.refund_note && (
                              <p className="text-[10px] text-slate-400 max-w-[120px] truncate mt-0.5" title={r.refund_note}>
                                {r.refund_note}
                              </p>
                            )}
                          </td>

                          {/* 6. ACTIONS */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setViewRefund(r)}
                                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-primary hover:bg-orange-50 transition"
                                title="Inspect Buyer Refund Claim"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {isPending ? (
                                <button
                                  onClick={() => {
                                    setRefundOrder(r);
                                    setRefundReference(`REF-${Date.now().toString().slice(-6)}`);
                                    setRefundAmount(r.refund_amount || r.total_amount || 0);
                                    setRefundNote(`Refund of ₹${amount} credited via Razorpay/Bank transfer`);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs active:scale-95"
                                  title="Process Customer Refund"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Pay Buyer</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-emerald-600 font-bold px-2 py-1">
                                  Refunded
                                </span>
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
        </div>
      )}

      {/* 7. PROPER PAGINATION CONTROLS */}
      {currentDataset.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 shadow-xs">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
              <strong>{Math.min(currentPage * itemsPerPage, currentDataset.length)}</strong> of{" "}
              <strong>{currentDataset.length}</strong> {activeTab === "vendors" ? "merchants" : "claims"}
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
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

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
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .map((page, index, array) => {
                const prevPage = array[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <Fragment key={page}>
                    {showEllipsis && <span className="px-2 text-slate-400 text-xs">...</span>}
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
      )}

      {/* 8. VENDOR PAYMENT & PROFILE DETAIL DOSSIER MODAL */}
      {viewVendor && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-scaleUp">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-primary flex items-center justify-center shrink-0 border border-orange-200/60">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Merchant Settlement Dossier
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {viewVendor.business_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Owner: <strong>{viewVendor.owner_name || "N/A"}</strong> • Phone: {viewVendor.phone || "N/A"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewVendor(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Financial Status Highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Outstanding Payout Balance
                </span>
                <div className="text-2xl font-black text-primary mt-0.5">
                  ₹{Number(viewVendor.total_earning || 0).toLocaleString("en-IN")}
                </div>
                <span className="text-[11px] text-amber-800">
                  {viewVendor.pending_orders_count || 0} order item{(viewVendor.pending_orders_count || 0) === 1 ? "" : "s"} awaiting payout
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total Disbursed Historically
                </span>
                <div className="text-xl font-black text-slate-800 mt-0.5">
                  ₹{Number(viewVendor.total_settled || 0).toLocaleString("en-IN")}
                </div>
                <span className="text-[11px] text-slate-500">
                  Settled into registered bank account
                </span>
              </div>
            </div>

            {/* Complete Banking Credentials Card */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-primary" />
                <span>Verified Banking &amp; UPI Credentials</span>
              </h4>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 text-xs">
                {/* UPI ID */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">UPI ID</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {viewVendor.upi_id || "No UPI ID registered"}
                    </span>
                  </div>
                  {viewVendor.upi_id && (
                    <button
                      onClick={() => handleCopy(viewVendor.upi_id, "modal-upi")}
                      className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-primary font-bold text-xs border border-orange-200 transition flex items-center gap-1"
                    >
                      {copiedKey === "modal-upi" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "modal-upi" ? "Copied" : "Copy UPI"}</span>
                    </button>
                  )}
                </div>

                {/* Bank Account */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Holder</span>
                    <span className="font-semibold text-slate-800">
                      {viewVendor.bank_holder_name || viewVendor.owner_name || "N/A"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Account Number</span>
                      <span className="font-mono font-bold text-slate-900">
                        {viewVendor.bank_account_number || "Not provided"}
                      </span>
                    </div>
                    {viewVendor.bank_account_number && (
                      <button
                        onClick={() => handleCopy(viewVendor.bank_account_number, "modal-ac")}
                        className="text-slate-400 hover:text-primary p-1"
                        title="Copy Account Number"
                      >
                        {copiedKey === "modal-ac" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">IFSC Code</span>
                      <span className="font-mono font-bold text-slate-900">
                        {viewVendor.bank_ifsc || "Not provided"}
                      </span>
                    </div>
                    {viewVendor.bank_ifsc && (
                      <button
                        onClick={() => handleCopy(viewVendor.bank_ifsc, "modal-ifsc")}
                        className="text-slate-400 hover:text-primary p-1"
                        title="Copy IFSC"
                      >
                        {copiedKey === "modal-ifsc" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Shop Address</span>
                    <span className="text-slate-700 truncate block" title={viewVendor.shop_address}>
                      {viewVendor.shop_address || "Standard Storefront registered"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Order Items Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-primary" />
                <span>Pending Order Items Contributing to Payout</span>
              </h4>

              {loadingVendorItems ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Loading order items...
                </div>
              ) : vendorItems.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
                  No active pending items for this merchant.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                  {vendorItems.map((item) => (
                    <div key={item.item_id} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        {item.product_image ? (
                          <img src={item.product_image} alt="" className="w-8 h-8 rounded object-cover border" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-400">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800">{item.product_name}</p>
                          <p className="text-[10px] text-slate-400">
                            Order #{String(item.order_id).slice(0, 8)} • Buyer: {item.buyer_name} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-slate-900">
                          ₹{Number(item.vendor_earning || 0).toLocaleString()}
                        </span>
                        <span className={`block text-[9px] uppercase font-bold ${
                          item.payout_status === "paid" ? "text-emerald-600" : "text-amber-600"
                        }`}>
                          {item.payout_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <Link
                to={`/admin/vendors/${viewVendor.vendor_id}`}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
              >
                <span>View Full Storefront Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-2.5 justify-end">
                <button
                  onClick={() => setViewVendor(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100"
                >
                  Close
                </button>

                {Number(viewVendor.total_earning || 0) > 0 && (
                  <button
                    onClick={() => {
                      const v = viewVendor;
                      setViewVendor(null);
                      setPayoutVendor(v);
                      setPayoutReference(`PAY-${Date.now().toString().slice(-6)}`);
                      setPayoutAmount(v.total_earning || 0);
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition shadow-xs active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Disburse ₹{Number(viewVendor.total_earning || 0).toLocaleString()}</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 9. VENDOR PAYOUT DISBURSAL MODAL */}
      {payoutVendor && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                <span>Confirm Vendor Payout Disbursal</span>
              </h3>
              <button
                onClick={() => setPayoutVendor(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-orange-50/80 p-4 rounded-2xl border border-orange-200">
              <p>Store: <strong className="text-slate-900 font-bold">{payoutVendor.business_name}</strong></p>
              <p>Disbursal Amount: <strong className="text-primary font-black text-lg">₹{Number(payoutVendor.total_earning || 0).toLocaleString()}</strong></p>
              {payoutVendor.upi_id && <p>UPI ID: <strong className="text-slate-900 font-mono">{payoutVendor.upi_id}</strong></p>}
              {payoutVendor.bank_account_number && (
                <p>Bank A/C: <strong className="text-slate-900 font-mono">{payoutVendor.bank_account_number} ({payoutVendor.bank_ifsc})</strong></p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Payout Disbursal Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default: ₹{Number(payoutVendor.total_earning || 0).toLocaleString()}. Modify to disburse a custom or partial payout.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Bank / UPI Transaction Reference (UTR)
                </label>
                <input
                  type="text"
                  value={payoutReference}
                  onChange={(e) => setPayoutReference(e.target.value)}
                  placeholder="e.g. UTR-98218932 or IMPS-8921"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This transaction reference will be saved to the database and notified to the merchant.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPayoutVendor(null)}
                disabled={clearingPayout}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearPayment}
                disabled={clearingPayout}
                className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {clearingPayout ? "Processing..." : "Disburse & Notify"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. BUYER REFUND CLAIM DETAIL DOSSIER MODAL */}
      {viewRefund && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-scaleUp">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  Customer Refund &amp; Dispute Dossier
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Order #{String(viewRefund.order_id).slice(0, 8).toUpperCase()}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Cancelled on {new Date(viewRefund.cancelled_at || viewRefund.created_at).toLocaleString("en-IN", {
                    dateStyle: "full",
                    timeStyle: "short"
                  })}
                </p>
              </div>

              <button
                onClick={() => setViewRefund(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Refund Financial Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                  Refund Applicable Amount
                </span>
                <div className="text-2xl font-black text-rose-700 mt-0.5">
                  ₹{Number(viewRefund.refund_amount || viewRefund.total_amount || 0).toLocaleString("en-IN")}
                </div>
                <span className="text-[11px] text-rose-600">
                  Total Order Value: ₹{Number(viewRefund.total_amount || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Current Status
                </span>
                <div className="mt-1">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    viewRefund.refund_status === "refunded"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-orange-100 text-orange-800 border border-orange-200 animate-pulse"
                  }`}>
                    {viewRefund.refund_status === "refunded" ? "Settled & Refunded" : "Processing (Pending Disbursal)"}
                  </span>
                </div>
                {viewRefund.refund_note && (
                  <p className="text-[11px] text-slate-600 mt-1">
                    Memo: {viewRefund.refund_note}
                  </p>
                )}
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>Claimant / Buyer Information</span>
              </h4>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{viewRefund.buyer_name || "Customer"}</p>
                  <p className="text-slate-500 flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{viewRefund.buyer_email || "N/A"}</span>
                  </p>
                  <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{viewRefund.buyer_phone || viewRefund.shipping_phone || "N/A"}</span>
                  </p>
                </div>

                <div className="text-slate-600">
                  <span className="font-bold text-slate-800 block mb-0.5">Cancellation Reason:</span>
                  <p className="bg-white p-2.5 rounded-xl border border-slate-200 leading-relaxed text-slate-700">
                    {viewRefund.cancellation_reason || "Customer requested cancellation before order dispatch."}
                  </p>
                </div>
              </div>
            </div>

            {/* Items in the Cancelled Order */}
            {viewRefund.items && viewRefund.items.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-primary" />
                  <span>Items in Dispute Order</span>
                </h4>

                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs max-h-40 overflow-y-auto">
                  {viewRefund.items.map((item, i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.product_image ? (
                          <img src={item.product_image} alt="" className="w-8 h-8 rounded object-cover border" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center text-slate-400">
                            <Package className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800">{item.product_name}</p>
                          <p className="text-[10px] text-slate-400">
                            Merchant: {item.vendor_name} • Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <span className="font-black text-slate-900">
                        ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewRefund(null)}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100"
              >
                Close
              </button>

              {viewRefund.refund_status !== "refunded" && (
                <button
                  onClick={() => {
                    const r = viewRefund;
                    setViewRefund(null);
                    setRefundOrder(r);
                    setRefundReference(`REF-${Date.now().toString().slice(-6)}`);
                    setRefundAmount(r.refund_amount || r.total_amount || 0);
                    setRefundNote(`Refund of ₹${r.refund_amount || r.total_amount} settled successfully`);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Settle Refund Now</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 11. PROCESS BUYER REFUND ACTION MODAL */}
      {refundOrder && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-600" />
                <span>Process Customer Refund</span>
              </h3>
              <button
                onClick={() => setRefundOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-rose-50 p-4 rounded-2xl border border-rose-200">
              <p>Customer: <strong className="text-slate-900 font-bold">{refundOrder.buyer_name}</strong> ({refundOrder.buyer_email})</p>
              <p>Order: <strong className="text-slate-900 font-mono">#{String(refundOrder.order_id).slice(0, 8).toUpperCase()}</strong></p>
              <p>Refund Amount: <strong className="text-rose-700 font-black text-lg">₹{Number(refundOrder.refund_amount || refundOrder.total_amount || 0).toLocaleString()}</strong></p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Refund Disbursal Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-bold text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Default: ₹{Number(refundOrder.refund_amount || refundOrder.total_amount || 0).toLocaleString()}. Adjust to execute partial or custom refund amount.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Refund Transaction Reference ID (UTR / Gateway Ref)
              </label>
              <input
                type="text"
                value={refundReference}
                onChange={(e) => setRefundReference(e.target.value)}
                placeholder="e.g. RFND-98219 or RAZORPAY-REF-201"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Resolution Note (Sent to Buyer via Notification)
              </label>
              <textarea
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value)}
                placeholder="e.g. Refund disbursed to original payment method. Reference #..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRefundOrder(null)}
                disabled={processingRefund}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessRefund}
                disabled={processingRefund}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {processingRefund ? "Processing..." : "Confirm & Disburse Refund"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}