import { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { deleteVendorById, updateVendorStatusById } from "../../services/adminService";
import { 
  Store, Search, Filter, ArrowUpDown, CheckCircle2, Clock, 
  ShieldAlert, Ban, Package, Mail, Phone, MapPin, Eye, 
  Trash2, RefreshCw, AlertCircle, User, Building2, ChevronRight
} from "lucide-react";

export default function Vendors() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'approved', 'pending', 'hold', 'disabled'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'oldest', 'most_products', 'name_asc'

  /* ================= FETCH VENDORS ================= */
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/vendors");
      setVendors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  /* ================= ACTION HANDLERS ================= */
  const handleToggleStatus = async (vendor, e) => {
    e.stopPropagation();
    const isCurrentlyActive = vendor.kyc_status === "approved";
    const nextStatus = isCurrentlyActive ? "disabled" : "approved";
    const confirmMsg = isCurrentlyActive 
      ? `Disable store "${vendor.business_name}"? Their products will be hidden from the marketplace.`
      : `Re-activate store "${vendor.business_name}" and mark as verified?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoadingId(vendor.id);
      await updateVendorStatusById(vendor.id, nextStatus);
      setVendors(prev =>
        prev.map(v => v.id === vendor.id ? { ...v, kyc_status: nextStatus } : v)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update vendor status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("CRITICAL: Delete this merchant permanently? This will remove their store profile and catalog.")) return;

    try {
      setActionLoadingId(id);
      await deleteVendorById(id);
      setVendors(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete vendor");
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

  /* ================= COMPUTED STATS ================= */
  const approvedCount = useMemo(() => vendors.filter(v => v.kyc_status === "approved").length, [vendors]);
  const pendingCount = useMemo(() => vendors.filter(v => v.kyc_status === "pending").length, [vendors]);
  const holdCount = useMemo(() => vendors.filter(v => v.kyc_status === "hold").length, [vendors]);
  const disabledCount = useMemo(() => vendors.filter(v => v.kyc_status === "disabled" || v.kyc_status === "rejected").length, [vendors]);

  /* ================= FILTER & SORT ================= */
  const filteredVendors = useMemo(() => {
    return vendors
      .filter((v) => {
        // Status filter
        if (statusFilter === "approved" && v.kyc_status !== "approved") return false;
        if (statusFilter === "pending" && v.kyc_status !== "pending") return false;
        if (statusFilter === "hold" && v.kyc_status !== "hold") return false;
        if (statusFilter === "disabled" && v.kyc_status !== "disabled" && v.kyc_status !== "rejected") return false;

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchBusiness = v.business_name?.toLowerCase().includes(q);
          const matchOwner = (v.owner_name || v.user_name)?.toLowerCase().includes(q);
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
        if (sortBy === "most_products") {
          return Number(b.product_count || 0) - Number(a.product_count || 0);
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
            <Store className="w-7 h-7 text-primary" />
            <span>Merchant Directory &amp; Store Oversight</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Directory of all registered marketplace merchants, verification status, and catalog inventory.
          </p>
        </div>

        <button
          onClick={fetchVendors}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* ================= 2. KPI OVERVIEW METRICS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => setStatusFilter("all")}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            statusFilter === "all"
              ? "bg-orange-50/70 border-orange-300 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-orange-200"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Merchants</span>
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{vendors.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">All registered seller accounts</p>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter("approved")}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            statusFilter === "approved"
              ? "bg-emerald-50/70 border-emerald-300 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Verified &amp; Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">{approvedCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Live store catalogs</p>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter("pending")}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            statusFilter === "pending"
              ? "bg-amber-50/70 border-amber-300 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Awaiting Verification</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-700">{pendingCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Pending admin approval</p>
          </div>
        </div>

        <div 
          onClick={() => setStatusFilter("disabled")}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            statusFilter === "disabled"
              ? "bg-rose-50/70 border-rose-300 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-rose-200"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Disabled / Hold</span>
            <Ban className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-rose-700">{disabledCount + holdCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Deactivated or paused stores</p>
          </div>
        </div>

      </div>

      {/* ================= 3. SEARCH & FILTER CONTROLS ================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search merchants by store name, owner, email, phone, location..."
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
              aria-label="Sort merchants"
              className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="newest">Newest Registered First</option>
              <option value="oldest">Oldest First</option>
              <option value="most_products">Most Products Listed</option>
              <option value="name_asc">Store Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>

          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Merchants ({vendors.length})
          </button>

          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === "approved"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Verified &amp; Active ({approvedCount})</span>
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
            <span>Awaiting Review ({pendingCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter("disabled")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === "disabled"
                ? "bg-rose-600 text-white shadow-2xs"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100"
            }`}
          >
            <Ban className="w-3 h-3" />
            <span>Disabled / Inactive ({disabledCount})</span>
          </button>
        </div>
      </div>

      {/* ================= 4. MERCHANTS DIRECTORY CARDS ================= */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-medium">Loading merchant directory...</p>
        </div>
      ) : filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredVendors.map((v) => {
            const isApproved = v.kyc_status === "approved";
            const isPending = v.kyc_status === "pending";
            const isHold = v.kyc_status === "hold";
            const isDisabled = v.kyc_status === "disabled" || v.kyc_status === "rejected";
            const isActionLoading = actionLoadingId === v.id;

            return (
              <div
                key={v.id}
                onClick={() => navigate(`/admin/vendors/${v.id}`)}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  
                  {/* Card Header: Avatar, Name, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 text-primary border border-orange-300 flex items-center justify-center shrink-0 font-black text-lg group-hover:scale-105 transition-transform">
                        {v.business_name?.[0]?.toUpperCase() || "S"}
                      </div>
                      
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                          {v.business_name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">
                          Owner: <strong className="text-slate-700 font-medium">{v.owner_name || v.user_name || "N/A"}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isApproved && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      {isPending && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 animate-pulse inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )}
                      {isHold && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 border border-yellow-200 inline-flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          On Hold
                        </span>
                      )}
                      {isDisabled && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Contact Grid */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{v.email}</span>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{v.phone || "No phone registered"}</span>
                    </div>

                    {v.shop_address && (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{v.shop_address}{v.pincode ? ` (${v.pincode})` : ""}</span>
                      </div>
                    )}
                  </div>

                  {/* Badges / Metrics bar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 font-semibold text-slate-700">
                      <Package className="w-3.5 h-3.5 text-primary" />
                      <span>{v.product_count || 0} Products</span>
                    </span>

                    <span className="text-[11px] text-slate-400">
                      Registered: {formatDate(v.created_at)}
                    </span>
                  </div>

                </div>

                {/* Card Action Controls Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Profile &amp; Products</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Disable / Enable Toggle */}
                    {isApproved ? (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={(e) => handleToggleStatus(v, e)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
                        title="Deactivate merchant and hide products"
                      >
                        Disable
                      </button>
                    ) : isDisabled ? (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={(e) => handleToggleStatus(v, e)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition"
                      >
                        Re-enable
                      </button>
                    ) : null}

                    {/* Delete */}
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={(e) => handleDelete(v.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Permanently delete merchant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8 space-y-3">
          <Store className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">
            {searchQuery || statusFilter !== "all" 
              ? "No merchants matching your search criteria" 
              : "No Merchants Found"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search terms or clearing your status filters."
              : "No sellers have registered on the platform yet."}
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