import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getPendingVendors,
  approveVendorById,
  holdVendorById,
  deleteVendorById
} from "../../services/adminService";
import { 
  Search, Filter, CheckCircle2, Clock, ShieldAlert, Store, 
  User, Mail, Phone, MapPin, Eye, ArrowUpDown, RefreshCw, 
  AlertCircle, Trash2, ShieldCheck, ChevronRight, Ban
} from "lucide-react";

export default function ApproveVendors() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'hold'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'name_asc'

  /* ================= FETCH VENDORS ================= */
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await getPendingVendors();
      setVendors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching pending vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  /* ================= ACTIONS ================= */
  const handleApprove = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setActionLoadingId(id);
      await approveVendorById(id);
      setVendors(prev =>
        prev.map(v => v.id === id ? { ...v, kyc_status: "approved" } : v)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve seller");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleHold = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      setActionLoadingId(id);
      await holdVendorById(id);
      setVendors(prev =>
        prev.map(v => v.id === id ? { ...v, kyc_status: "hold" } : v)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to hold seller");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Permanently reject and delete this seller application?")) return;
    try {
      setActionLoadingId(id);
      await deleteVendorById(id);
      setVendors(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete seller");
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  /* ================= FILTER & SORT LOGIC ================= */
  const pendingCount = useMemo(() => vendors.filter(v => v.kyc_status === "pending").length, [vendors]);
  const holdCount = useMemo(() => vendors.filter(v => v.kyc_status === "hold").length, [vendors]);

  const filteredVendors = useMemo(() => {
    return vendors
      .filter((v) => {
        // Status filter
        if (statusFilter !== "all" && v.kyc_status !== statusFilter) return false;

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchBusiness = v.business_name?.toLowerCase().includes(q);
          const matchOwner = (v.owner_name || v.name)?.toLowerCase().includes(q);
          const matchEmail = v.email?.toLowerCase().includes(q);
          const matchPhone = v.phone?.includes(q);
          const matchAddress = v.shop_address?.toLowerCase().includes(q);
          if (!matchBusiness && !matchOwner && !matchEmail && !matchPhone && !matchAddress) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        if (sortBy === "oldest") {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        }
        if (sortBy === "name_asc") {
          return (a.business_name || "").localeCompare(b.business_name || "");
        }
        return 0;
      });
  }, [vendors, statusFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">

      {/* ================= 1. HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <span>Seller Approvals &amp; Verification</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Review incoming merchant applications, verify store profiles and tax credentials, and activate seller accounts.
          </p>
        </div>

        <button
          onClick={fetchVendors}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>Refresh Applications</span>
        </button>
      </div>

      {/* ================= 2. KPI SUMMARY PILLS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div 
          onClick={() => setStatusFilter("pending")}
          className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            statusFilter === "pending"
              ? "bg-amber-50/80 border-amber-300 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-amber-200"
          }`}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Awaiting Verification</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Urgent review required</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter("hold")}
          className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            statusFilter === "hold"
              ? "bg-yellow-50/80 border-yellow-300 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-yellow-200"
          }`}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">On Hold</span>
            <div className="text-2xl font-black text-yellow-700 mt-1">{holdCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Pending additional merchant info</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            statusFilter === "all"
              ? "bg-orange-50/60 border-orange-300 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-orange-200"
          }`}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total in Queue</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{vendors.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Active review queue</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-primary flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ================= 3. SEARCH & FILTER TOOLBAR ================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by store name, owner, email, phone, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
              >
                Clear
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort applications"
              className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="newest">Newest Applications First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Store Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>

          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Applications ({vendors.length})
          </button>

          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === "pending"
                ? "bg-amber-500 text-white shadow-2xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Pending Review ({pendingCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter("hold")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === "hold"
                ? "bg-yellow-600 text-white shadow-2xs"
                : "bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            <span>On Hold ({holdCount})</span>
          </button>
        </div>
      </div>

      {/* ================= 4. APPLICATION CARDS LIST ================= */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-medium">Loading applications queue...</p>
        </div>
      ) : filteredVendors.length > 0 ? (
        <div className="space-y-4">
          {filteredVendors.map((v) => {
            const isItemPending = v.kyc_status === "pending";
            const isItemHold = v.kyc_status === "hold";
            const isItemApproved = v.kyc_status === "approved";
            const isActionLoading = actionLoadingId === v.id;

            return (
              <div
                key={v.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
              >
                {/* STORE & APPLICANT INFO */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-primary border border-orange-200 flex items-center justify-center shrink-0 font-black text-lg">
                    {v.business_name?.[0]?.toUpperCase() || "S"}
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                        {v.business_name}
                      </h3>

                      {isItemPending && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                          Pending Review
                        </span>
                      )}
                      {isItemHold && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 border border-yellow-200">
                          On Hold
                        </span>
                      )}
                      {isItemApproved && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Verified &amp; Active
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Owner: <strong className="text-slate-800 font-semibold">{v.owner_name || v.name || "N/A"}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{v.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{v.phone || v.user_phone || "No phone"}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-0.5">
                      {v.shop_address && (
                        <span className="flex items-center gap-1 text-slate-500 truncate max-w-md">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{v.shop_address}{v.pincode ? ` (${v.pincode})` : ""}</span>
                        </span>
                      )}
                      <span>Applied on: {formatDate(v.created_at)}</span>
                      {v.gst_number && (
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          GST: {v.gst_number}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS & VIEW DOSSIER */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  {/* View Complete Dossier Button */}
                  <Link
                    to={`/admin/vendors/${v.id}`}
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 text-slate-700 hover:text-primary hover:border-primary hover:bg-orange-50/50 transition inline-flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Full Profile</span>
                  </Link>

                  {/* Approve */}
                  {!isItemApproved && (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={(e) => handleApprove(v.id, e)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition active:scale-95 inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify &amp; Activate</span>
                    </button>
                  )}

                  {/* Hold */}
                  {isItemPending && (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={(e) => handleHold(v.id, e)}
                      className="px-3.5 py-2 border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-xl text-xs sm:text-sm font-semibold transition inline-flex items-center gap-1"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Hold</span>
                    </button>
                  )}

                  {/* Delete / Decline */}
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={(e) => handleDelete(v.id, e)}
                    className="p-2 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 rounded-xl transition"
                    title="Reject and delete application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">
            {searchQuery || statusFilter !== "all" 
              ? "No applications matching your filters" 
              : "All Seller Applications Processed!"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "Try clearing your search keyword or switching status filter tabs."
              : "There are currently no new merchant applications pending verification."}
          </p>
          {(searchQuery || statusFilter !== "all") && (
            <button
              onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}
              className="mt-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

    </div>
  );
}