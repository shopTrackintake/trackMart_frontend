import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { 
  PlusCircle, Search, Edit3, Trash2, Package, 
  Percent, ChevronLeft, ChevronRight, Eye, EyeOff, 
  Power, CheckCircle2, AlertCircle
} from "lucide-react";

export default function VendorProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStock, setFilterStock] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);
  
  // Fixed default items per page
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/vendor");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching vendor products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStock]);

  const toggleAvailability = async (id, currentStatus, title) => {
    try {
      setUpdatingId(id);
      const res = await api.patch(`/products/${id}/toggle-status`);
      const newStatus = res.data.product?.status || (currentStatus === "inactive" ? "active" : "inactive");
      
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      console.error("Toggle error:", err);
      alert(err.response?.data?.message || "Failed to update product availability");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteProduct = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}" from your store catalog?`)) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isInactive = p.status === "inactive";
    const isActive = !p.status || p.status === "active";

    if (filterStock === "active") return matchesSearch && isActive;
    if (filterStock === "inactive") return matchesSearch && isInactive;
    if (filterStock === "in_stock") return matchesSearch && Number(p.stock) > 0;
    if (filterStock === "out_of_stock") return matchesSearch && Number(p.stock) <= 0;
    if (filterStock === "discounted") return matchesSearch && Number(p.discount_percent) > 0;

    return matchesSearch;
  });

  // Calculate pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Generate numbered pages with smart ellipsis (e.g. 1, 2, 3, 4, 5 or 1, ..., 4, 5, 6, ..., 10)
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

  const activeCount = products.filter(p => !p.status || p.status === "active").length;
  const inactiveCount = products.filter(p => p.status === "inactive").length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold font-primary">
              <span className="text-primary">My</span>{" "}
              <span className="text-slate-900">Products</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {products.length} {products.length === 1 ? "item" : "items"}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Manage your store catalog, toggle item availability/deactivation, and update inventory.
          </p>
        </div>

        <button
          onClick={() => navigate("/vendor/add-product")}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white px-5 py-2.5 rounded-xl font-semibold transition shadow-xs active:scale-95 text-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Items", count: products.length },
            { id: "active", label: "Active / Live", count: activeCount },
            { id: "inactive", label: "Unavailable", count: inactiveCount },
            { id: "discounted", label: "Discounted %" },
            { id: "in_stock", label: "In Stock" },
            { id: "out_of_stock", label: "Out of Stock" }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStock(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                filterStock === f.id
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{f.label}</span>
              {f.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filterStock === f.id ? "bg-slate-800 text-slate-200" : "bg-white text-slate-600"
                }`}>
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. PRODUCT GRID */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent mb-3" />
          <p className="text-sm">Loading your store catalog...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery ? "No matching products found" : "No products found in this filter"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? "Try adjusting your search query or filter options."
              : "Start adding products to your store with custom pricing, discount percentages, and nutritional details."}
          </p>
          {searchQuery ? (
            <button
              onClick={() => { setSearchQuery(""); setFilterStock("all"); }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear filters
            </button>
          ) : (
            <button
              onClick={() => navigate("/vendor/add-product")}
              className="inline-flex items-center gap-2 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primaryHover transition"
            >
              <PlusCircle className="w-4 h-4" /> Add First Product
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {paginatedProducts.map((p) => {
              const isInactive = p.status === "inactive";
              const hasDiscount = Number(p.discount_percent) > 0;
              const sellingPrice = hasDiscount
                ? Math.round(Number(p.price) * (1 - Number(p.discount_percent) / 100))
                : Number(p.price);
              const isOutOfStock = Number(p.stock) <= 0;
              const isBusy = updatingId === p.id;

              return (
                <div
                  key={p.id}
                  className={`bg-white border rounded-2xl shadow-xs hover:shadow-md transition flex flex-col overflow-hidden group ${
                    isInactive
                      ? "border-slate-300/80 opacity-90 bg-slate-50/40"
                      : "border-slate-200/90 hover:border-slate-300"
                  }`}
                >
                  {/* Product Image */}
                  <div className="relative h-44 bg-slate-50/80 p-4 flex items-center justify-center border-b border-slate-100">
                    {/* Status Pill on top left */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                      {isInactive ? (
                        <span className="bg-slate-800 text-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                          <EyeOff className="w-2.5 h-2.5 text-amber-400" />
                          Unavailable
                        </span>
                      ) : (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          Live & Active
                        </span>
                      )}

                      {hasDiscount && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                          <Percent className="w-2.5 h-2.5" />
                          {p.discount_percent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Stock pill on top right */}
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border z-10 ${
                      isOutOfStock 
                        ? "bg-red-50 text-red-700 border-red-200" 
                        : Number(p.stock) <= 5
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {isOutOfStock ? "Out of Stock" : `Stock: ${p.stock}`}
                    </span>

                    <img
                      src={
                        p.image_url?.startsWith("http")
                          ? p.image_url
                          : `http://localhost:5000/uploads/${p.image_url}`
                      }
                      alt={p.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
                      }}
                      className={`max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200 ${
                        isInactive ? "grayscale-30 opacity-75" : ""
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors" title={p.title}>
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {p.description || "No description provided."}
                      </p>
                    </div>

                    {/* Price & Weight info */}
                    <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-extrabold text-slate-900">
                            ₹{sellingPrice}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{p.price}
                            </span>
                          )}
                        </div>
                        {p.size && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            Size: {p.size}
                          </span>
                        )}
                      </div>

                      {p.health_rating && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.health_rating === "Healthy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {p.health_rating}
                        </span>
                      )}
                    </div>

                    {/* Actions Row 1: Edit & Delete */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => navigate(`/vendor/edit-product/${p.id}`)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-primary text-slate-700 hover:text-primary text-xs font-semibold transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>

                        <button
                          onClick={() => deleteProduct(p.id, p.title)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-red-300 text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>

                      {/* Actions Row 2: Availability / Deactivate Switch Button */}
                      <button
                        onClick={() => toggleAvailability(p.id, p.status, p.title)}
                        disabled={isBusy}
                        className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-2xs active:scale-95 disabled:opacity-50 ${
                          isInactive
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {isBusy ? (
                          <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" />
                        ) : isInactive ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Activate & Make Live</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                            <span>Deactivate / Unavailable</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. NUMBERED PAGINATION FOOTER (1 2 3 4 Navigation) */}
          {totalItems > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Items Counter */}
              <div className="text-xs text-slate-600 font-medium">
                Showing <strong className="text-slate-900 font-bold">{startIndex + 1}</strong>–
                <strong className="text-slate-900 font-bold">{endIndex}</strong> of{" "}
                <strong className="text-slate-900 font-bold">{totalItems}</strong> items
              </div>

              {/* 1 2 3 4 Numeric Page Navigation Bar */}
              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition shadow-2xs active:scale-95"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* 1 2 3 4 Numbered Buttons */}
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((item, idx) => {
                    if (item === "...") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-400 select-none"
                        >
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

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition shadow-2xs active:scale-95"
                  title="Next Page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}