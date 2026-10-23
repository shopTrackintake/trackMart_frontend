import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { 
  ArrowLeft, Edit3, Trash2, Eye, EyeOff, Package, 
  Tag, IndianRupee, Percent, Layers, ShieldCheck, 
  ExternalLink, Calendar, Building, Sparkles, AlertCircle,
  CheckCircle2, Flame, Scale, Clock, HeartPulse, FileText,
  Barcode, Check, Copy
} from "lucide-react";

export default function VendorProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(false);
  const [copiedSku, setCopiedSku] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      console.error("Error fetching vendor product details:", err);
      setError(err.response?.data?.message || "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const toggleAvailability = async () => {
    if (!product) return;
    try {
      setToggling(true);
      const res = await api.patch(`/products/${product.id}/toggle-status`);
      const newStatus = res.data.product?.status || (product.status === "inactive" ? "active" : "inactive");
      setProduct((prev) => ({ ...prev, status: newStatus }));
      alert(res.data.message || `Product status updated to ${newStatus}`);
    } catch (err) {
      console.error("Toggle error:", err);
      alert(err.response?.data?.message || "Failed to update product availability");
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!window.confirm(`Are you sure you want to permanently delete "${product.title}" from your store catalog?`)) return;

    try {
      await api.delete(`/products/${product.id}`);
      alert("Product successfully deleted from your store catalog");
      navigate("/vendor/products");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const copySku = (skuText) => {
    navigator.clipboard.writeText(skuText);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-9 w-9 border-3 border-primary border-t-transparent" />
        <p className="text-sm font-semibold text-slate-600">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{error || "The product you requested could not be found."}</p>
        <Link
          to="/vendor/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const isInactive = product.status === "inactive";
  const hasDiscount = Number(product.discount_percent) > 0;
  const sellingPrice = hasDiscount
    ? Math.round(Number(product.price) * (1 - Number(product.discount_percent) / 100))
    : Number(product.price);

  const stockNum = Number(product.stock || 0);
  const isOutOfStock = stockNum <= 0;
  const isLowStock = stockNum > 0 && stockNum <= 5;
  const totalInventoryValue = sellingPrice * stockNum;

  const mainImageUrl = product.image_url
    ? product.image_url.startsWith("http")
      ? product.image_url
      : `http://localhost:5000/uploads/${product.image_url}`
    : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";

  const ingredientsImageUrl = product.ingredients_image_url
    ? product.ingredients_image_url.startsWith("http")
      ? product.ingredients_image_url
      : `http://localhost:5000/uploads/${product.ingredients_image_url}`
    : null;

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto py-3 px-1 sm:px-4 pb-16">
      {/* 0. BREADCRUMB & QUICK ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <button
          onClick={() => navigate("/vendor/products")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition shadow-2xs active:scale-95 cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Products Catalog</span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/product/${product.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Preview customer-facing product listing"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Storefront Preview</span>
          </Link>

          <button
            onClick={() => navigate(`/vendor/edit-product/${product.id}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Product</span>
          </button>

          <button
            onClick={toggleAvailability}
            disabled={toggling}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 ${
              isInactive
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
            }`}
          >
            {isInactive ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>{toggling ? "Updating..." : "Activate Listing"}</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span>{toggling ? "Updating..." : "Deactivate"}</span>
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Delete this product"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* 1. PRODUCT TOP HERO CARD */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left: Product Image */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full aspect-square max-w-[340px] rounded-2xl bg-white border border-slate-200 p-3 flex items-center justify-center overflow-hidden shadow-2xs relative group">
              <img
                src={mainImageUrl}
                alt={product.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80";
                }}
                className={`max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105 ${
                  isInactive ? "grayscale-30 opacity-75" : ""
                }`}
              />

              {/* Status pill on image */}
              <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                isInactive
                  ? "bg-slate-100 text-slate-600 border-slate-300"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}>
                {isInactive ? "Unavailable / Deactivated" : "Live & Active"}
              </span>

              {hasDiscount && (
                <span className="absolute top-3 right-3 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-2xs">
                  {product.discount_percent}% OFF
                </span>
              )}
            </div>

            {ingredientsImageUrl && (
              <div className="mt-3 w-full max-w-[340px] p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <img
                  src={ingredientsImageUrl}
                  alt="Ingredients Label"
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">Back Label / Nutrition Pack</p>
                  <a
                    href={ingredientsImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    <span>Inspect Full Image</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Right: Key Details */}
          <div className="md:col-span-7 space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {product.brand_name && (
                  <span className="text-xs font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                    {product.brand_name}
                  </span>
                )}
                {product.category_name && (
                  <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                    {product.category_name}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {product.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                {product.description || "No description provided."}
              </p>
            </div>

            {/* Price & Payout Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Listing Selling Price
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
                    ₹{sellingPrice}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{product.price}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Save ₹{Number(product.price) - sellingPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Your Net Earnings / Unit
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-primary">
                  ₹{sellingPrice}
                </span>
                <span className="text-[10px] text-slate-500 block">100% Payout • 0% Commission</span>
              </div>
            </div>

            {/* Quick Specs Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Size / Volume</span>
                <span className="font-bold text-slate-800">{product.size || "Standard"}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Net Weight</span>
                <span className="font-bold text-slate-800">{product.net_weight || product.size || "—"}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Dietary Type</span>
                <span className="font-bold text-slate-800">{product.dietary_type || "Vegetarian"}</span>
              </div>

              {product.flavour && (
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Flavour</span>
                  <span className="font-bold text-slate-800">{product.flavour}</span>
                </div>
              )}

              {product.sku && (
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">Store SKU</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px] truncate block">{product.sku}</span>
                  </div>
                  <button
                    onClick={() => copySku(product.sku)}
                    className="text-slate-400 hover:text-primary p-1 cursor-pointer"
                    title="Copy SKU"
                  >
                    {copiedSku ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              {product.barcode && (
                <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Barcode / EAN</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">{product.barcode}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. INVENTORY & FINANCIAL METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Current Stock */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Current Inventory
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              isOutOfStock
                ? "bg-red-50 text-red-600"
                : isLowStock
                ? "bg-amber-50 text-amber-600"
                : "bg-emerald-50 text-emerald-600"
            }`}>
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
            {stockNum} <span className="text-xs font-semibold text-slate-500">units in stock</span>
          </div>
          <p className={`text-xs font-bold ${
            isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-600" : "text-emerald-600"
          }`}>
            {isOutOfStock ? "Out of Stock - update inventory" : isLowStock ? "Low Stock Alert" : "Healthy Stock Level"}
          </p>
        </div>

        {/* Potential Inventory Value */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Stock Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
            ₹{totalInventoryValue.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Projected sales revenue from current inventory
          </p>
        </div>

        {/* Visibility / Availability Status */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Storefront Status
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
              isInactive ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-600"
            }`}>
              {isInactive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {isInactive ? "Unavailable" : "Public & Buyable"}
          </div>
          <p className="text-xs text-slate-500">
            {isInactive ? "Deactivated from customer catalog" : "Visible across search & category pages"}
          </p>
        </div>
      </div>

      {/* 3. NUTRITION FACTS & HEALTH INFORMATION */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
            <Flame className="w-4.5 h-4.5 text-orange-500" />
            <span>Nutrition Facts &amp; Health Matrix</span>
          </h2>
          <span className="text-xs text-slate-500">
            Per serving size: <strong className="text-slate-800">{product.serving_size || "100g"}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-100">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block">Calories</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">
              {product.calories ? `${product.calories} kcal` : "—"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Protein</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">
              {product.protein ? `${product.protein}g` : "—"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Total Fat</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">
              {product.fat ? `${product.fat}g` : "—"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100">
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Sugar</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono mt-0.5 block">
              {product.sugar ? `${product.sugar}g` : "—"}
            </span>
          </div>
        </div>

        {/* Nutrition breakdown notes if present */}
        {(product.nutrition_per_100g || product.nutrition_per_serving) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            {product.nutrition_per_100g && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Nutrition Breakdown (Per 100g):</span>
                <p className="text-slate-600 leading-relaxed">{product.nutrition_per_100g}</p>
              </div>
            )}
            {product.nutrition_per_serving && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Nutrition Breakdown (Per Serving):</span>
                <p className="text-slate-600 leading-relaxed">{product.nutrition_per_serving}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. PRODUCT DISCLOSURES & REGULATORY SPECIFICATIONS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
        <h2 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-4.5 h-4.5 text-primary" />
          <span>Vendor Disclosures &amp; Compliance Details</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Care Focus</span>
            <p className="font-bold text-slate-800 text-sm">{product.care_type || "General Wellness"}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Health Concern Focus</span>
            <p className="font-bold text-slate-800 text-sm">{product.concern_type || "Daily Nutrition"}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">FSSAI License No.</span>
            <p className="font-mono font-bold text-slate-800 text-sm">{product.fssai_license || "Verified Compliant"}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Batch Number</span>
            <p className="font-mono font-bold text-slate-800 text-sm">{product.batch_number || "—"}</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Mfg Date</span>
            <p className="font-bold text-slate-800 text-sm">
              {product.mfg_date ? new Date(product.mfg_date).toLocaleDateString() : "—"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Expiry Date</span>
            <p className="font-bold text-slate-800 text-sm">
              {product.expiry_date ? new Date(product.expiry_date).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>

        {/* Manufacturer info */}
        {(product.manufacturer_name || product.manufacturer_address) && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-800 block">Manufacturer / Packaging Details:</span>
            {product.manufacturer_name && <p className="text-slate-700 font-medium">{product.manufacturer_name}</p>}
            {product.manufacturer_address && <p className="text-slate-500">{product.manufacturer_address}</p>}
          </div>
        )}
      </div>

      {/* 5. INGREDIENTS & USAGE INSTRUCTIONS */}
      {(product.ingredients || product.how_to_use || product.making_process) && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
          <h2 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4.5 h-4.5 text-primary" />
            <span>Ingredients &amp; Directions for Use</span>
          </h2>

          <div className="space-y-4 text-xs sm:text-sm">
            {product.ingredients && (
              <div>
                <span className="font-bold text-slate-900 block mb-1">Ingredients:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                  {product.ingredients}
                </p>
              </div>
            )}

            {product.how_to_use && (
              <div>
                <span className="font-bold text-slate-900 block mb-1">Recommended Usage / Dosage:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                  {product.how_to_use}
                </p>
              </div>
            )}

            {product.making_process && (
              <div>
                <span className="font-bold text-slate-900 block mb-1">Making Process &amp; Sourcing:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                  {product.making_process}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
