import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import {
  ArrowLeft,
  Trash2,
  Store,
  Package,
  Layers,
  ExternalLink,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Eye,
  X,
  Phone,
  User,
  Calendar,
  DollarSign,
  Scale
} from "lucide-react";

export default function AdminProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError(err?.response?.data?.message || "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (e) => {
    e?.preventDefault();
    setIsDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/admin/products/${id}`, {
        data: { reason: deleteReason.trim() || "Unlisted by platform administration" }
      });
      setShowDeleteModal(false);
      // Navigate back to catalog with state
      navigate("/admin/products", {
        replace: true,
        state: { message: `Product "${product?.title || id}" was deleted successfully.` }
      });
    } catch (err) {
      console.error("Error deleting product:", err);
      setDeleteError(err?.response?.data?.message || "Failed to delete product. Please try again.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium text-sm">Loading product catalog dossier...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
          <p className="text-slate-500 text-sm mt-1 mb-6 max-w-md mx-auto">
            {error || "The requested item could not be retrieved or has been permanently removed."}
          </p>
          <button
            onClick={() => navigate("/admin/products")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Product Catalog</span>
          </button>
        </div>
      </div>
    );
  }



  const isInactive = product.status === "inactive" || product.status === "deleted";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* TOP BREADCRUMB & ACTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1.5">
            <Link to="/admin" className="hover:text-primary transition">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/admin/products" className="hover:text-primary transition">Product Catalog</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {product.title}
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/products")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition active:scale-95"
              title="Return to Product Catalog"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Catalog</span>
            </button>

            <span className="text-xs text-slate-400">SKU #{product.id}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {product.vendor_id && (
            <Link
              to={`/admin/vendors/${product.vendor_id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100/80 text-primary text-xs sm:text-sm font-semibold transition active:scale-95"
              title="Inspect Seller Profile"
            >
              <Store className="w-4 h-4" />
              <span>Seller Profile</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </Link>
          )}

          {!isInactive && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold transition shadow-xs active:scale-95"
              title="Delete or unlist this item"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Product</span>
            </button>
          )}
        </div>
      </div>

      {/* STATUS BANNER IF INACTIVE */}
      {isInactive && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-bold">Item Status: Inactive / Delisted</p>
            <p className="text-rose-700 text-xs mt-0.5">
              This product has been removed by platform administration and is currently invisible to customers in the marketplace.
            </p>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-black rounded-full bg-rose-200/80 text-rose-900 uppercase">
            Inactive
          </span>
        </div>
      )}

      {/* PRIMARY PRODUCT CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-7 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: PRODUCT IMAGERY (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl bg-slate-50 border border-slate-200/70 overflow-hidden aspect-square flex items-center justify-center p-4">
              <img
                src={product.image_url || "/placeholder-product.png"}
                alt={product.title}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80";
                }}
              />

              {/* Status Badge Tag */}
              <div className="absolute top-3 left-3">
                {isInactive ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                    Delisted
                  </span>
                ) : product.stock === 0 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs">
                    Out of Stock
                  </span>
                ) : product.stock < 5 ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
                    Low Stock ({product.stock})
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                    Active Listing
                  </span>
                )}
              </div>
            </div>

            {/* INGREDIENTS LABEL ATTACHMENTS (ZOOMABLE) */}
            {product.ingredients_image_url && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span>Ingredients Packaging Photo</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Click to expand</span>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {product.ingredients_image_url.split(",").map((imgUrl, i) => {
                    const cleanUrl = imgUrl.trim();
                    if (!cleanUrl) return null;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedImage(cleanUrl)}
                        className="group relative w-16 h-16 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-primary transition"
                      >
                        <img
                          src={cleanUrl}
                          alt={`Ingredients label ${i + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PRODUCT TIMELINE / METADATA */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-2 text-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Created Date:
                </span>
                <span className="font-semibold text-slate-700">
                  {product.created_at ? new Date(product.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  }) : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Category:
                </span>
                <span className="font-semibold text-slate-700">
                  {product.category_name || `Cat #${product.category_id}`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" /> Packaging Size:
                </span>
                <span className="font-semibold text-slate-700">
                  {product.size || "Standard"}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CORE PRODUCT DETAILS & VENDOR DOSSIER (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">

            {/* TITLE & PRICE BLOCK */}
            <div className="space-y-3 pb-5 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                  {product.category_name || "General Goods"}
                </span>
                {product.size && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
                    Net Size: {product.size}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.title}
              </h1>

              <div className="flex flex-wrap items-baseline gap-4 pt-1">
                <div className="text-3xl font-black text-slate-900 flex items-baseline">
                  <span>₹{Number(product.price || 0).toLocaleString("en-IN")}</span>
                  <span className="text-xs text-slate-400 font-normal ml-1">MRP incl. taxes</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Stock Inventory:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    product.stock === 0
                      ? "bg-rose-100 text-rose-700"
                      : product.stock < 5
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {product.stock} units available
                  </span>
                </div>
              </div>
            </div>

            {/* MERCHANT STORE DOSSIER CARD */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/60 to-orange-50/40 border border-amber-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                      Fulfilled by Marketplace Merchant
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {product.business_name || "Merchant Store"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                      {product.owner_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{product.owner_name}</span>
                        </span>
                      )}
                      {product.vendor_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{product.vendor_phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {product.vendor_id && (
                  <Link
                    to={`/admin/vendors/${product.vendor_id}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-orange-200 hover:border-orange-300 text-primary font-bold text-xs shadow-xs hover:bg-orange-50/50 transition self-start sm:self-auto shrink-0 active:scale-95"
                  >
                    <span>View Merchant Dossier</span>
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </Link>
                )}
              </div>
            </div>

            {/* NUTRITIONAL TELEMETRY */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Nutritional Profile (per serving)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/60">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-amber-700">Calories</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{product.calories ?? "—"}</div>
                  <div className="text-[10px] text-amber-600">kcal</div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/60">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Protein</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{product.protein ?? "—"}</div>
                  <div className="text-[10px] text-emerald-600">grams</div>
                </div>

                <div className="p-3 rounded-xl bg-orange-50/80 border border-orange-200/60">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-orange-700">Total Fat</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{product.fat ?? "—"}</div>
                  <div className="text-[10px] text-orange-600">grams</div>
                </div>

                <div className="p-3 rounded-xl bg-sky-50/80 border border-sky-200/60">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-sky-700">Sugar</div>
                  <div className="text-lg font-black text-slate-800 mt-0.5">{product.sugar ?? "—"}</div>
                  <div className="text-[10px] text-sky-600">grams</div>
                </div>
              </div>
            </div>

            {/* KEY INGREDIENTS */}
            {product.ingredients && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Key Ingredients Formula
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {product.ingredients.split("\n").map((ing, i) => {
                    const cleanIng = ing.trim();
                    if (!cleanIng) return null;
                    return (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 border border-slate-200/70 text-slate-700"
                      >
                        {cleanIng}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PRODUCT DESCRIPTION */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Product Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-200/60">
                {product.description || "No description provided for this listing."}
              </p>
            </div>

          </div>
        </div>

        {/* LOWER SECTION: HOW TO USE & MAKING PROCESS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-100">
          {product.how_to_use && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Recommended Usage / Directions</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 pl-2">
                {product.how_to_use.split("\n").map((item, i) => {
                  const clean = item.trim();
                  if (!clean) return null;
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-orange-100 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{clean}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {product.making_process && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Manufacturing &amp; Quality Process</span>
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600 pl-2">
                {product.making_process.split("\n").map((item, i) => {
                  const clean = item.trim();
                  if (!clean) return null;
                  return (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{clean}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>



      </div>

      {/* INGREDIENT IMAGE FULLSCREEN MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-3 animate-scaleIn">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center transition"
              title="Close Image Preview"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[80vh] overflow-auto flex items-center justify-center p-2">
              <img
                src={selectedImage}
                alt="Enlarged packaging detail"
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleIn">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">Delete Product Listing</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to delete and unlist <strong className="text-slate-700">"{product.title}"</strong>?
                  This product will be immediately deactivated and removed from all marketplace storefronts.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Reason for Removal (notified to merchant)
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g. Non-compliant packaging label, prohibited ingredients, or vendor requested delisting"
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError("");
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? "Deleting..." : "Confirm & Delete Item"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}