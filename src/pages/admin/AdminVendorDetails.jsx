import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { 
  updateVendorStatusById, 
  approveVendorById, 
  holdVendorById, 
  deleteVendorById 
} from "../../services/adminService";
import { 
  Store, User, Mail, Phone, MapPin, Building2, CreditCard, 
  ShieldCheck, FileText, CheckCircle2, AlertCircle, Ban, 
  ArrowLeft, Package, Wallet, ShoppingBag, Eye, Calendar, 
  Hash, ShieldAlert, Sparkles, RefreshCw
} from "lucide-react";

export default function AdminVendorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchProduct, setSearchProduct] = useState("");

  const fetchVendor = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/vendors/${id}`);
      // Handle both object shapes: { vendor, products, stats } or direct vendor object
      if (res.data && res.data.vendor) {
        setData(res.data);
      } else {
        setData({
          vendor: res.data,
          products: [],
          stats: {
            totalProducts: 0,
            totalOrders: 0,
            totalUnitsSold: 0,
            settledEarnings: 0,
            pendingSettlement: 0
          }
        });
      }
    } catch (err) {
      console.error("Error fetching vendor details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const vendor = data?.vendor;
  const products = data?.products || [];
  const stats = data?.stats || {};

  /* ================= ACTION HANDLERS ================= */

  const handleUpdateStatus = async (newStatus) => {
    let confirmMsg = `Are you sure you want to change store status to "${newStatus}"?`;
    if (newStatus === "disabled") {
      confirmMsg = "Warning: Disabling this seller will hide their products from public search and store catalogs. Proceed?";
    }
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      await updateVendorStatusById(id, newStatus);
      await fetchVendor();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update vendor status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("CRITICAL: Delete this vendor permanently? This will remove their merchant profile and unlink their products.")) return;
    try {
      setActionLoading(true);
      await deleteVendorById(id);
      navigate("/admin/vendors");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete vendor");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val || 0);
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

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Loading merchant dossier...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Merchant Profile Not Found</h2>
        <p className="text-sm text-slate-500">The requested vendor may have been deleted or does not exist.</p>
        <button
          onClick={() => navigate("/admin/vendors")}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold"
        >
          Return to Merchant Directory
        </button>
      </div>
    );
  }

  const isVerified = vendor.kyc_status === "approved";
  const isPending = vendor.kyc_status === "pending";
  const isHold = vendor.kyc_status === "hold";
  const isDisabled = vendor.kyc_status === "disabled" || vendor.kyc_status === "rejected";

  const filteredProducts = products.filter((p) =>
    p.title?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.category_name?.toLowerCase().includes(searchProduct.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">

      {/* TOP NAVIGATION BREADCRUMB */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link to="/admin" className="hover:text-primary transition">Admin</Link>
          <span>/</span>
          <Link to="/admin/vendors" className="hover:text-primary transition">Merchants</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold truncate max-w-[200px]">{vendor.business_name}</span>
        </div>
      </div>

      {/* ================= 1. STORE HEADER & ACTION CONTROLS ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          {/* LEFT: STORE IDENTITY */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 text-primary border border-orange-300 flex items-center justify-center shrink-0 shadow-xs">
              <Store className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {vendor.business_name}
                </h1>

                {/* Status Badges */}
                {isVerified && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified &amp; Active
                  </span>
                )}
                {isPending && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse inline-flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Pending Verification
                  </span>
                )}
                {isHold && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200 inline-flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    On Hold
                  </span>
                )}
                {isDisabled && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                    <Ban className="w-3.5 h-3.5" />
                    Disabled / Suspended
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-3">
                <span>Owner: <strong className="text-slate-700">{vendor.owner_name || vendor.user_name || "N/A"}</strong></span>
                <span>•</span>
                <span>Email: <strong className="text-slate-700">{vendor.email}</strong></span>
                <span>•</span>
                <span>Member since: <strong className="text-slate-700">{formatDate(vendor.created_at)}</strong></span>
              </p>
            </div>
          </div>

          {/* RIGHT: ACTION TOOLBAR */}
          <div className="flex flex-wrap items-center gap-2.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">

            {/* If pending or hold or disabled, show Approve / Verify */}
            {!isVerified && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus("approved")}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition active:scale-95 inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify &amp; Activate</span>
              </button>
            )}

            {/* If verified or pending, show Hold option */}
            {!isHold && !isDisabled && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus("hold")}
                className="px-4 py-2.5 border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-95 inline-flex items-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Place on Hold</span>
              </button>
            )}

            {/* Disable / Deactivate Option */}
            {!isDisabled ? (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus("disabled")}
                className="px-4 py-2.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-95 inline-flex items-center gap-1.5"
                title="Deactivates store and hides products from marketplace"
              >
                <Ban className="w-4 h-4" />
                <span>Disable Store</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus("approved")}
                className="px-4 py-2.5 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 inline-flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Re-enable Store</span>
              </button>
            )}

            {/* Delete Option */}
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleDelete}
              className="px-4 py-2.5 border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-300 rounded-xl text-xs sm:text-sm font-semibold transition"
            >
              Delete
            </button>

          </div>
        </div>
      </div>

      {/* ================= 2. STORE PERFORMANCE METRICS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Catalog Listings</span>
            <Package className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{stats.totalProducts || products.length}</div>
            <p className="text-xs text-slate-500 mt-0.5">Uploaded items</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Orders Processed</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{stats.totalOrders || 0}</div>
            <p className="text-xs text-slate-500 mt-0.5">{stats.totalUnitsSold || 0} units delivered</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Settled Payouts</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700">{formatCurrency(stats.settledEarnings)}</div>
            <p className="text-xs text-slate-500 mt-0.5">Disbursed to merchant</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Balance</span>
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-700">{formatCurrency(stats.pendingSettlement)}</div>
            <p className="text-xs text-slate-500 mt-0.5">Awaiting payout clearance</p>
          </div>
        </div>

      </div>

      {/* ================= 3. COMPLETE PROFILE DOSSIER (ALL FIELDS) ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span>Complete Merchant Profile &amp; Credentials</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified identity, operational contacts, bank settlement details, and legal tax numbers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* SECTION 1: BUSINESS & LOCATION */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider text-primary flex items-center gap-2">
              <Store className="w-4 h-4" />
              <span>Store &amp; Location</span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 text-xs block">Business Store Name</span>
                <span className="font-bold text-slate-900">{vendor.business_name || "N/A"}</span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Owner Full Name</span>
                <span className="font-semibold text-slate-800">{vendor.owner_name || vendor.user_name || "N/A"}</span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Merchant Phone</span>
                <span className="font-semibold text-slate-800">{vendor.phone || "N/A"}</span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Shop Address</span>
                <span className="font-medium text-slate-700 leading-relaxed block">{vendor.shop_address || "N/A"}</span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Postal Pincode</span>
                <span className="font-mono font-semibold text-slate-800">{vendor.pincode || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: LEGAL & COMPLIANCE */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider text-emerald-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Tax &amp; Regulatory Credentials</span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 text-xs block">GSTIN / Tax ID</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                  {vendor.gst_number || "Not Provided"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Permanent Account Number (PAN)</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                  {vendor.pan_number || "Not Provided"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">FSSAI Food Safety License</span>
                <span className="font-mono font-semibold text-slate-800">
                  {vendor.fssai_number || "Not Applicable / Not Provided"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Platform Commission Rate</span>
                <span className="font-bold text-primary">
                  {vendor.commission_percent ? `${vendor.commission_percent}%` : "5% (Standard Rate)"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Verification Status</span>
                <span className="font-bold text-slate-800 uppercase tracking-wide">
                  {vendor.kyc_status}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: BANKING & PAYOUT COORDINATES */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider text-indigo-600 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>Banking &amp; Settlements</span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 text-xs block">Bank Account Holder</span>
                <span className="font-semibold text-slate-900">{vendor.bank_holder_name || "N/A"}</span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Bank Account Number</span>
                <span className="font-mono font-bold text-slate-900 tracking-wider">
                  {vendor.bank_account_number || "N/A"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Bank IFSC Code</span>
                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                  {vendor.bank_ifsc || "N/A"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Virtual Payment Address (UPI)</span>
                <span className="font-mono font-bold text-indigo-700">
                  {vendor.upi_id || "N/A"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-xs block">Registered User ID</span>
                <span className="font-mono text-[11px] text-slate-500 break-all">{vendor.user_id}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= 4. VENDOR PRODUCT CATALOG SHOWCASE ================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <span>Store Product Catalog ({products.length})</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              All inventory items listed by this merchant on TrackMart.
            </p>
          </div>

          {products.length > 0 && (
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search products by title..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary transition"
              />
            </div>
          )}
        </div>

        {/* PRODUCTS GRID */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((p) => {
              const displayImage = p.image_url || (Array.isArray(p.images) && p.images[0]) || "/placeholder.png";
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      <img
                        src={displayImage}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80"; }}
                      />
                      <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.status === "active"
                          ? "bg-emerald-500 text-white shadow-2xs"
                          : "bg-slate-700 text-white"
                      }`}>
                        {p.status || "active"}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-4 space-y-2">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                        {p.category_name || "General Grocery"}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {p.title}
                      </h4>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-base font-extrabold text-slate-900">
                          ₹{p.price}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Stock: <strong className="text-slate-800">{p.stock ?? "N/A"}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Product View Action */}
                  <div className="p-4 pt-0">
                    <Link
                      to={`/admin/products/${p.id}`}
                      className="w-full py-2 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-primary border border-slate-200 hover:border-orange-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Moderate Product</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-400 space-y-2">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-600">
              {searchProduct ? "No products matching your search query." : "This merchant has not listed any products yet."}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}