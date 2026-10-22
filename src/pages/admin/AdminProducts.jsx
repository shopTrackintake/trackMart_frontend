import React, { useEffect, useState, useMemo, Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { 
  Package, Search, Filter, ArrowUpDown, Eye, Trash2, 
  Store, CheckCircle2, AlertCircle, RefreshCw, ChevronLeft, 
  ChevronRight, ExternalLink, Tag, Layers, ShoppingBag
} from "lucide-react";

export default function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all"); // 'all', 'active', 'inactive'
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [selectedStock, setSelectedStock] = useState("all"); // 'all', 'instock', 'lowstock', 'outofstock'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'price_asc', 'price_desc', 'name_asc', 'stock_desc'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/products");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching admin products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ================= DELETE PRODUCT ================= */
  const deleteProduct = async (id, e) => {
    if (e) e.stopPropagation();
    const reason = prompt("Enter administrative reason for removing this product (will be notified to seller):");
    if (!reason) return;

    try {
      setActionLoadingId(id);
      await api.delete(`/admin/products/${id}`, {
        data: { reason }
      });
      // Update local status to inactive/removed
      setProducts(prev =>
        prev.map(p => p.id === id ? { ...p, status: "inactive" } : p)
      );
    } catch (err) {
      console.error("Error deleting product:", err);
      alert(err.response?.data?.message || "Failed to remove product");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ================= EXTRACT UNIQUE CATEGORIES & VENDORS ================= */
  const categoriesList = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      if (p.category_name) set.add(p.category_name);
    });
    return Array.from(set).sort();
  }, [products]);

  const vendorsList = useMemo(() => {
    const map = new Map();
    products.forEach(p => {
      if (p.vendor_id && p.business_name) {
        map.set(p.vendor_id, p.business_name);
      }
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [products]);

  /* ================= KPI COUNTS ================= */
  const activeCount = useMemo(() => products.filter(p => p.status === "active" || !p.status).length, [products]);
  const inactiveCount = useMemo(() => products.filter(p => p.status === "inactive" || p.status === "deleted").length, [products]);
  const outOfStockCount = useMemo(() => products.filter(p => Number(p.stock) === 0).length, [products]);

  /* ================= FILTER & SORT PRODUCTS ================= */
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Status filter
        if (selectedStatus === "active") {
          if (p.status !== "active" && p.status !== null && p.status !== undefined) return false;
        } else if (selectedStatus === "inactive") {
          if (p.status !== "inactive" && p.status !== "deleted") return false;
        }

        // Category filter
        if (selectedCategory !== "all" && p.category_name !== selectedCategory) {
          return false;
        }

        // Vendor filter
        if (selectedVendor !== "all" && p.vendor_id !== selectedVendor) {
          return false;
        }

        // Stock filter
        const stockNum = Number(p.stock ?? 0);
        if (selectedStock === "instock" && stockNum <= 0) return false;
        if (selectedStock === "lowstock" && (stockNum <= 0 || stockNum > 5)) return false;
        if (selectedStock === "outofstock" && stockNum > 0) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title?.toLowerCase().includes(q);
          const matchVendor = p.business_name?.toLowerCase().includes(q);
          const matchCategory = p.category_name?.toLowerCase().includes(q);
          const matchBrand = p.brand_name?.toLowerCase().includes(q);
          if (!matchTitle && !matchVendor && !matchCategory && !matchBrand) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        if (sortBy === "price_asc") {
          return Number(a.price || 0) - Number(b.price || 0);
        }
        if (sortBy === "price_desc") {
          return Number(b.price || 0) - Number(a.price || 0);
        }
        if (sortBy === "name_asc") {
          return (a.title || "").localeCompare(b.title || "");
        }
        if (sortBy === "stock_desc") {
          return Number(b.stock || 0) - Number(a.stock || 0);
        }
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedStatus, selectedVendor, selectedStock, sortBy]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, selectedVendor, selectedStock, sortBy]);

  /* ================= PAGINATION CALCULATIONS ================= */
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const startRecord = filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">

      {/* ================= 1. HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-primary" />
            <span>Product Catalog &amp; Moderation</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Global catalog oversight, price verification, inventory moderation, and direct seller links.
          </p>
        </div>

        <button
          onClick={fetchProducts}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>Refresh Catalog</span>
        </button>
      </div>

      {/* ================= 2. KPI OVERVIEW CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => setSelectedStatus("all")}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            selectedStatus === "all"
              ? "bg-orange-50/70 border-orange-300 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-orange-200"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
            <Package className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">{products.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">{categoriesList.length} unique categories</p>
          </div>
        </div>

        <div 
          onClick={() => setSelectedStatus("active")}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            selectedStatus === "active"
              ? "bg-emerald-50/70 border-emerald-300 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-emerald-200"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Live &amp; Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700">{activeCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Visible to buyers in store</p>
          </div>
        </div>

        <div 
          onClick={() => setSelectedStatus("inactive")}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            selectedStatus === "inactive"
              ? "bg-rose-50/70 border-rose-300 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-rose-200"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Inactive / Removed</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-rose-700">{inactiveCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Moderated or seller paused</p>
          </div>
        </div>

        <div 
          onClick={() => { setSelectedStock("outofstock"); }}
          className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
            selectedStock === "outofstock"
              ? "bg-amber-50/70 border-amber-300 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-amber-200"
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Out of Stock</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-700">{outOfStockCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Inventory depleted</p>
          </div>
        </div>

      </div>

      {/* ================= 3. SEARCH & ADVANCED FILTERS ================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        
        {/* Row 1: Search & Sort */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by title, category, merchant name, brand..."
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

          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
              className="px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="newest">Newest Added First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Product Title (A-Z)</option>
              <option value="stock_desc">Highest Stock Count</option>
            </select>
          </div>
        </div>

        {/* Row 2: Multi-Dimensional Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          
          {/* Category Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary bg-white text-slate-700 font-medium"
            >
              <option value="all">All Categories ({categoriesList.length})</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Live Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary bg-white text-slate-700 font-medium"
            >
              <option value="all">All Statuses ({products.length})</option>
              <option value="active">Active Only ({activeCount})</option>
              <option value="inactive">Inactive / Removed ({inactiveCount})</option>
            </select>
          </div>

          {/* Vendor Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Seller / Merchant
            </label>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary bg-white text-slate-700 font-medium"
            >
              <option value="all">All Merchants ({vendorsList.length})</option>
              {vendorsList.map(([vid, bName]) => (
                <option key={vid} value={vid}>{bName}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Stock Availability
            </label>
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary bg-white text-slate-700 font-medium"
            >
              <option value="all">All Inventory</option>
              <option value="instock">In Stock (&gt; 0)</option>
              <option value="lowstock">Low Stock (1 to 5)</option>
              <option value="outofstock">Out of Stock (0)</option>
            </select>
          </div>

        </div>

      </div>

      {/* ================= 4. PRODUCTS CATALOG GRID ================= */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-medium">Loading catalog inventory...</p>
        </div>
      ) : paginatedProducts.length > 0 ? (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginatedProducts.map((p) => {
              const displayImage = p.image_url || (Array.isArray(p.images) && p.images[0]) || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80";
              const isActive = p.status === "active" || !p.status;
              const isActionLoading = actionLoadingId === p.id;
              const stockNum = Number(p.stock ?? 0);

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail & Badges */}
                    <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                      <img
                        src={displayImage}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80"; }}
                      />

                      {/* Live Status Pill */}
                      <span className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-rose-600 text-white shadow-xs"
                      }`}>
                        {isActive ? "Active" : "Removed"}
                      </span>

                      {/* Category Pill */}
                      <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur-xs">
                        {p.category_name || "Grocery"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      
                      {/* Title & Price */}
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 group-hover:text-primary transition-colors">
                          {p.title}
                        </h3>
                        <div className="flex items-baseline justify-between pt-1">
                          <span className="text-lg font-black text-slate-900">
                            ₹{p.price}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            stockNum === 0
                              ? "bg-rose-100 text-rose-700"
                              : stockNum <= 5
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {stockNum === 0 ? "Out of Stock" : `Stock: ${stockNum}`}
                          </span>
                        </div>
                      </div>

                      {/* NAVIGATION TO VENDOR DETAIL PAGE (KEY USER REQUIREMENT) */}
                      {p.vendor_id ? (
                        <Link
                          to={`/admin/vendors/${p.vendor_id}`}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/60 hover:bg-orange-100/70 border border-orange-200/60 text-xs transition group/vendor"
                          title="View complete merchant profile & all products"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Store className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="font-bold text-slate-800 truncate group-hover/vendor:text-primary transition-colors">
                              {p.business_name || "Merchant Store"}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-primary flex items-center gap-0.5 shrink-0">
                            <span>Profile</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Store className="w-3.5 h-3.5" />
                          <span>{p.business_name || "Verified Vendor"}</span>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="p-4 pt-0 flex items-center gap-2">
                    <Link
                      to={`/admin/products/${p.id}`}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Link>

                    {isActive && (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={(e) => deleteProduct(p.id, e)}
                        className="p-2 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 rounded-xl transition"
                        title="Remove product listing from marketplace"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* ================= 5. PROPER PAGINATION CONTROLS ================= */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="text-xs sm:text-sm text-slate-500">
              Showing <strong className="text-slate-800">{startRecord}</strong> to <strong className="text-slate-800">{endRecord}</strong> of <strong className="text-slate-800">{filteredProducts.length}</strong> products
            </div>

            <div className="flex items-center gap-1.5">
              {/* Prev button */}
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                })
                .map((page, index, array) => {
                  const prevPage = array[index - 1];
                  const showEllipsis = prevPage && page - prevPage > 1;

                  return (
                    <Fragment key={page}>
                      {showEllipsis && (
                        <span className="px-2 text-slate-400 text-xs">...</span>
                      )}
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

              {/* Next button */}
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

        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Products Matching Criteria</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Try resetting your search query or switching your category and merchant filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedStatus("all");
              setSelectedVendor("all");
              setSelectedStock("all");
            }}
            className="mt-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
          >
            Clear All Filters
          </button>
        </div>
      )}

    </div>
  );
}