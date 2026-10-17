import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { AuthContext } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { 
  Search, X, ShoppingBag, ShoppingCart, Plus, Eye, 
  ChevronLeft, ChevronRight, SlidersHorizontal, 
  Sparkles, CheckCircle2, RotateCcw, Tag, Check, ArrowUpDown
} from "lucide-react";

export default function Buy() {
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const { addToCart, updateQuantity, getProductQuantity } = useCart();
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [priceRange, setPriceRange] = useState("all"); // "all" | "under_100" | "100_250" | "250_500" | "500_1000" | "above_1000" | "custom"
  const [customMaxPrice, setCustomMaxPrice] = useState(1000);
  const [showPriceSlider, setShowPriceSlider] = useState(false);
  const [sort, setSort] = useState("featured"); // "featured" | "price_low" | "price_high" | "discount" | "title_asc"
  const [discountOnly, setDiscountOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(window.innerWidth < 768 ? 8 : 12);
  const [totalPages, setTotalPages] = useState(1);

  // Responsive limit adjustments
  useEffect(() => {
    const handleResize = () => {
      setLimit(window.innerWidth < 768 ? 8 : 12);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products whenever filters change
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const queryParams = {
          search: searchText.trim(),
          category,
          sort,
          page,
          limit
        };

        // Price range mapping
        if (priceRange === "under_100") {
          queryParams.max_price = 100;
        } else if (priceRange === "100_250") {
          queryParams.min_price = 100;
          queryParams.max_price = 250;
        } else if (priceRange === "250_500") {
          queryParams.min_price = 250;
          queryParams.max_price = 500;
        } else if (priceRange === "500_1000") {
          queryParams.min_price = 500;
          queryParams.max_price = 1000;
        } else if (priceRange === "above_1000") {
          queryParams.min_price = 1000;
        } else if (priceRange === "custom" && customMaxPrice < 2000) {
          queryParams.max_price = customMaxPrice;
        }

        if (discountOnly) {
          queryParams.discount_only = true;
        }

        if (inStockOnly) {
          queryParams.in_stock = true;
        }

        const res = await getProducts(queryParams);
        setProducts(res.data?.products || []);
        setTotalPages(res.data?.totalPages || 1);
      } catch (err) {
        console.error("Error fetching buy products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [searchText, category, priceRange, customMaxPrice, sort, discountOnly, inStockOnly, page, limit]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setPage(1);
  };

  const clearSearch = () => {
    setSearchText("");
    setPage(1);
  };

  const resetAllFilters = () => {
    setSearchText("");
    setCategory("");
    setPriceRange("all");
    setCustomMaxPrice(1000);
    setShowPriceSlider(false);
    setSort("featured");
    setDiscountOnly(false);
    setInStockOnly(false);
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchText.trim() || 
    category || 
    priceRange !== "all" || 
    sort !== "featured" || 
    discountOnly || 
    inStockOnly
  );

  // Cart Handlers
  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      toast.success(`${product.title} added to cart!`, "Cart Updated");
    } catch (err) {
      console.error(err);
      toast.error("Could not add to cart. Please try again.");
    }
  };

  const handleIncreaseQty = async (product) => {
    const current = getProductQuantity(product.id);
    await updateQuantity(product.id, current + 1);
  };

  const handleDecreaseQty = async (product) => {
    const current = getProductQuantity(product.id);
    if (current > 1) {
      await updateQuantity(product.id, current - 1);
    } else {
      await updateQuantity(product.id, 0);
    }
  };

  // Helper label for price range
  const getPriceRangeLabel = (val) => {
    switch (val) {
      case "under_100": return "Under ₹100";
      case "100_250": return "₹100 - ₹250";
      case "250_500": return "₹250 - ₹500";
      case "500_1000": return "₹500 - ₹1,000";
      case "above_1000": return "Above ₹1,000";
      case "custom": return `Up to ₹${customMaxPrice}`;
      default: return "All Budgets";
    }
  };

  const selectedCategoryName = categories.find((c) => String(c.id) === String(category))?.name;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-12">

      {/* ================= 1. CLEAN HEADER (DUAL-COLOR TITLE) ================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary mb-2">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Direct Farm & Pantry Catalog</span>
            </div>
            
            {/* Dual Color Heading */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              <span className="text-slate-900">Buy Clean </span>
              <span className="text-primary">Groceries</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Explore freshly sourced cold-pressed oils, millets, dry fruits, and kitchen staples. Delivered direct to your doorstep.
            </p>
          </div>

          {/* Quick Cart Pill */}
          <button
            onClick={() => navigate("/customer/cart")}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-50 border border-orange-200/90 text-primary font-bold text-xs sm:text-sm hover:bg-orange-100 transition shadow-2xs cursor-pointer active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>View Shopping Cart</span>
          </button>
        </div>
      </div>

      {/* ================= 2. SEARCH & ENHANCED FILTERS BAR ================= */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        
        {/* Top Controls: Search Bar + Budget Dropdown + Sort + Toggles */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
              placeholder="Search groceries (e.g. cold-pressed oil, millets, almonds, spices)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900 transition"
            />
            {searchText && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Action Filters Strip */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Price / Budget Dropdown */}
            <div className="relative">
              <select
                value={priceRange}
                onChange={(e) => {
                  setPriceRange(e.target.value);
                  setPage(1);
                  if (e.target.value === "custom") {
                    setShowPriceSlider(true);
                  } else {
                    setShowPriceSlider(false);
                  }
                }}
                className={`px-3 py-2.5 rounded-2xl border text-xs font-semibold focus:outline-none transition cursor-pointer appearance-none pr-8 bg-no-repeat bg-[right_10px_center] ${
                  priceRange !== "all"
                    ? "bg-primary text-white border-primary shadow-xs font-bold"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")` }}
              >
                <option value="all">Budget: Any Price</option>
                <option value="under_100">Under ₹100</option>
                <option value="100_250">₹100 - ₹250</option>
                <option value="250_500">₹250 - ₹500</option>
                <option value="500_1000">₹500 - ₹1,000</option>
                <option value="above_1000">Above ₹1,000</option>
                <option value="custom">Custom Slider</option>
              </select>

              {/* Custom Slider Popover */}
              {showPriceSlider && priceRange === "custom" && (
                <div className="absolute right-0 top-12 z-20 w-64 p-4 bg-white rounded-2xl shadow-xl border border-slate-200 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>Max Price</span>
                    <span className="text-primary font-mono font-black">₹{customMaxPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="50"
                    value={customMaxPrice}
                    onChange={(e) => {
                      setCustomMaxPrice(Number(e.target.value));
                      setPage(1);
                    }}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>₹50</span>
                    <span>₹2,000+</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPriceSlider(false)}
                    className="w-full py-1.5 text-center text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:border-primary transition cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="discount">Highest Discount (% Off)</option>
              <option value="title_asc">Name: A to Z</option>
            </select>

            {/* Toggle: Deals / Offers Only */}
            <button
              type="button"
              onClick={() => {
                setDiscountOnly(!discountOnly);
                setPage(1);
              }}
              className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                discountOnly
                  ? "bg-red-50 text-red-600 border-red-300 shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>On Sale</span>
              {discountOnly && <Check className="w-3 h-3 text-red-600" />}
            </button>

            {/* Toggle: In Stock Only */}
            <button
              type="button"
              onClick={() => {
                setInStockOnly(!inStockOnly);
                setPage(1);
              }}
              className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                inStockOnly
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>In Stock</span>
              {inStockOnly && <Check className="w-3 h-3 text-emerald-700" />}
            </button>

            {/* Reset All Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-3 py-2 rounded-2xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                title="Reset all active filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

          </div>

        </div>

        {/* Category Pills Strip */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setCategory("");
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
              category === ""
                ? "bg-primary text-white shadow-xs font-bold"
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-primary/40 hover:text-primary"
            }`}
          >
            All Categories
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategory(cat.id === category ? "" : cat.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
                String(category) === String(cat.id)
                  ? "bg-primary text-white shadow-xs font-bold"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-primary/40 hover:text-primary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* ACTIVE FILTERS SUMMARY CHIPS */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span className="font-semibold text-slate-400">Active Filters:</span>

            {searchText.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-primary border border-orange-200 font-medium">
                Keyword: "{searchText.trim()}"
                <X className="w-3 h-3 cursor-pointer hover:text-orange-700" onClick={clearSearch} />
              </span>
            )}

            {selectedCategoryName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                {selectedCategoryName}
                <X className="w-3 h-3 cursor-pointer hover:text-slate-900" onClick={() => { setCategory(""); setPage(1); }} />
              </span>
            )}

            {priceRange !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-medium">
                {getPriceRangeLabel(priceRange)}
                <X className="w-3 h-3 cursor-pointer hover:text-slate-900" onClick={() => { setPriceRange("all"); setPage(1); }} />
              </span>
            )}

            {discountOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 font-medium">
                On Sale
                <X className="w-3 h-3 cursor-pointer hover:text-red-700" onClick={() => { setDiscountOnly(false); setPage(1); }} />
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                In Stock
                <X className="w-3 h-3 cursor-pointer hover:text-emerald-800" onClick={() => { setInStockOnly(false); setPage(1); }} />
              </span>
            )}

            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs font-bold text-primary hover:underline ml-1 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

      </div>

      {/* ================= 3. PRODUCT CATALOG GRID ================= */}
      {loading ? (
        <div className="py-24 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Loading verified groceries...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 px-6 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-primary flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">No products found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            We couldn't find any products matching your search criteria. Try adjusting keywords or resetting filters.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs shadow hover:bg-orange-600 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing <strong className="text-slate-900">{products.length}</strong> products</span>
            <span>Page <strong className="text-slate-900">{page}</strong> of <strong className="text-slate-900">{totalPages}</strong></span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {products.map((product) => {
              const quantity = getProductQuantity(product.id);
              const discount = Number(product.discount_percent) || 0;
              const finalPrice = discount > 0
                ? Math.round(Number(product.price) * (1 - discount / 100))
                : Number(product.price);

              const imageSrc =
                product.image_url ||
                (product.images && product.images[0]) ||
                "https://res.cloudinary.com/dsn1q7hyk/image/upload/q_auto/f_auto/v1774419499/Clinton-Foodmart_ktkl3m.jpg";

              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white border border-slate-200/90 hover:border-primary/40 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer relative"
                >
                  <div>
                    {/* PRODUCT IMAGE CONTAINER */}
                    <div className="relative aspect-square sm:aspect-4/3 w-full bg-slate-50/80 rounded-xl sm:rounded-2xl mb-3 flex items-center justify-center p-3 overflow-hidden border border-slate-100 group-hover:bg-orange-50/20 transition-colors">
                      
                      {/* DISCOUNT BADGE */}
                      {discount > 0 && (
                        <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-xs z-10">
                          {discount}% OFF
                        </span>
                      )}

                      {/* IMAGE */}
                      <img
                        src={imageSrc}
                        alt={product.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80";
                        }}
                        className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-300 ease-out"
                        loading="lazy"
                      />
                    </div>

                    {/* CATEGORY & UNIT */}
                    <div className="flex items-center justify-between gap-1 text-[11px] font-medium">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-primary truncate">
                        {product.category_name || "Groceries"}
                      </span>
                      {product.size && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          {product.size}
                        </span>
                      )}
                    </div>

                    {/* TITLE */}
                    <h3
                      className="font-primary text-xs sm:text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 mt-1 leading-snug"
                      title={product.title}
                    >
                      {product.title}
                    </h3>

                    {/* SHORT DESCRIPTION */}
                    <p className="text-slate-500 text-[11px] mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                      {product.description || "Farm-fresh, quality-checked pantry staple."}
                    </p>

                    {/* PRICE BLOCK */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-black text-slate-900 font-mono leading-none">
                          ₹{finalPrice}
                        </span>
                        {discount > 0 && (
                          <span className="text-xs text-slate-400 line-through font-mono">
                            ₹{product.price}
                          </span>
                        )}
                      </div>

                      {discount > 0 && (
                        <span className="text-[11px] font-bold text-emerald-600">
                          Save ₹{Number(product.price) - finalPrice}
                        </span>
                      )}
                    </div>

                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    {/* VIEW DETAILS */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`);
                      }}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 transition cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* ADD TO CART / QTY STEPPER */}
                    <div className="flex-1 min-w-0">
                      {quantity === 0 ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          className="w-full h-9 sm:h-10 bg-primary hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs active:scale-95 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Add to Cart</span>
                        </button>
                      ) : (
                        <div className="w-full h-9 sm:h-10 flex items-center justify-between border border-primary/30 rounded-xl px-1.5 bg-orange-50/70 shadow-2xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecreaseQty(product);
                            }}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-600 flex items-center justify-center font-bold text-xs shadow-2xs transition active:scale-90 cursor-pointer shrink-0"
                          >
                            -
                          </button>
                          <span className="font-extrabold text-[11px] text-primary px-1 truncate font-mono">
                            {quantity} in cart
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIncreaseQty(product);
                            }}
                            className="w-7 h-7 rounded-lg bg-primary text-white hover:bg-orange-600 flex items-center justify-center font-bold text-xs shadow-2xs transition active:scale-90 cursor-pointer shrink-0"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= 4. PAGINATION CONTROLS ================= */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer ${
                  page === p
                    ? "bg-primary text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
