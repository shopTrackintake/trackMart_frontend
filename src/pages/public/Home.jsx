import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { getWishlist, toggleWishlist } from "../../services/wishlistService";
import { AuthContext } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { 
  Heart, ChevronLeft, ChevronRight, 
  Search, X, Truck, 
  Leaf, HeartPulse, BadgeCheck, ArrowRight, ChevronDown,
  Sparkles, CheckCircle2, Star, ShieldCheck
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const { role, loading: authLoading } = useContext(AuthContext);
  const { addToCart, updateQuantity: cartUpdateQuantity, getProductQuantity } = useCart();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const isFirstLoad = useRef(true);
  const [wishlistIds, setWishlistIds] = useState([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(window.innerWidth < 768 ? 6 : 8);
  const [totalPages, setTotalPages] = useState(1);

  const [category, setCategory] = useState("");
  const [care, setCare] = useState("");
  const [concern, setConcern] = useState("");
  const [price, setPrice] = useState(1000);
  const [showPricePopup, setShowPricePopup] = useState(false);
  const [sort, setSort] = useState("featured");

  const [searchText, setSearchText] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const canAddToCart = role === null || role === "customer";

  /* ================= 1. HERO SLIDES DATA ================= */
  const heroData = [
    {
      title: "Pure, Nutrient-Dense Groceries.",
      highlight: "Delivered Fresh To Your Door.",
      desc: "Clean, whole foods sourced directly from certified organic farmers. Every batch is verified for zero harmful pesticides, zero hidden chemicals, and uncompromised freshness.",
      cta: "Shop Fresh Produce",
      link: "products-section",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80",
      tag: "Fresh Harvest • 100% Traceable"
    },
    {
      title: "Science-Backed Whole Foods.",
      highlight: "Crafted For Natural Vitality.",
      desc: "Nourish your body with cold-pressed pure oils, ancient millets, and gut-friendly probiotics formulated for balanced immunity, sustained energy, and whole-body wellness.",
      cta: "Explore Healthy Essentials",
      link: "products-section",
      image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=1200&q=80",
      tag: "100% Raw • Zero Chemical Additives"
    },
    {
      title: "Honest Food Labeling.",
      highlight: "Zero Deceptive Marketing.",
      desc: "We screen every ingredient against laboratory nutrition benchmarks and calculate automated health grades, giving your family complete clarity and peace of mind.",
      cta: "Browse Verified Catalog",
      link: "products-section",
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&q=80",
      tag: "Grade A Health Score • Lab Tested"
    }
  ];

  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroData.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroData.length]);

  const handleHeroCta = (link) => {
    if (link === "login") {
      if (!role) { navigate("/login"); return; }
      const section = document.getElementById("products-section");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const section = document.getElementById(link);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate(link);
  };

  /* ================= AUTO SCROLL ON PAGE CHANGE ================= */
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    const section = document.getElementById("products-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page]);

  /* ================= RESPONSIVE LIMIT ================= */
  useEffect(() => {
    const handleResize = () => {
      setLimit(window.innerWidth < 768 ? 6 : 8);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await getProducts({
          search: searchQuery,
          category,
          care,
          concern,
          price,
          sort,
          page,
          limit
        });
        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery, category, care, concern, price, sort, page, limit]);

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  /* ================= FETCH WISHLIST ================= */
  useEffect(() => {
    if (authLoading || role !== "customer") return;
    const fetchWishlist = async () => {
      try {
        const res = await getWishlist();
        setWishlistIds((res.data || []).map((i) => String(i.product_id)));
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      }
    };
    fetchWishlist();
  }, [authLoading, role]);

  const handleSearch = (e) => {
    e?.preventDefault();
    setPage(1);
    if (searchText.trim()) {
      setSearchParams({ search: searchText.trim() });
    } else {
      setSearchParams({});
    }
    const section = document.getElementById("products-section");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearSearch = () => {
    setSearchText("");
    setSearchParams({});
    setPage(1);
  };

  const resetFilters = () => {
    setCategory("");
    setCare("");
    setConcern("");
    setPrice(1000);
    setSort("featured");
    setSearchText("");
    setSearchParams({});
    setPage(1);
    setShowPricePopup(false);
  };

  const getQuantity = (productId) => {
    return getProductQuantity(productId);
  };

  const toggleWishlistItem = async (productId) => {
    if (!role) {
      navigate("/login");
      return;
    }
    try {
      await toggleWishlist(productId);
      const res = await getWishlist();
      setWishlistIds((res.data || []).map((i) => String(i.product_id)));
    } catch (err) {
      console.error("Error updating wishlist:", err);
    }
  };

  const increaseQty = async (product) => {
    try {
      await addToCart(product, 1);
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  const decreaseQty = async (product) => {
    try {
      const cur = getProductQuantity(product.id);
      await cartUpdateQuantity(product.id, cur - 1);
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  const hasActiveFilters = Boolean(category || care || concern || price !== 1000 || searchQuery || sort !== "featured");
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="w-full overflow-x-clip flex flex-col">

      {/* ================= 1. HERO SECTION (EXPANSIVE, AIRY & ELEGANT) ================= */}
      <section className="relative w-full bg-gradient-to-b from-[#FFF8F2] via-[#FFFDF9] to-white border-b border-borderDefault/80 overflow-hidden">
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-emerald-50/50 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-16 lg:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT — EDITORIAL CONTENT */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-4 sm:space-y-6">
              
              {/* Majestic Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18]">
                {heroData[heroIndex].title}{" "}
                <span className="text-primary block sm:inline">
                  {heroData[heroIndex].highlight}
                </span>
              </h1>

              {/* Subhead / Description */}
              <p className="text-sm sm:text-base text-textDefault leading-relaxed max-w-xl">
                {heroData[heroIndex].desc}
              </p>

              {/* CTA BUTTON & SLIDE DOTS */}
              <div className="pt-2 flex flex-wrap items-center gap-5">
                <button
                  onClick={() => handleHeroCta(heroData[heroIndex].link)}
                  className="btn-primary text-sm px-8 py-3.5 rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-95 font-bold flex items-center justify-center gap-2.5"
                >
                  <span>{heroData[heroIndex].cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Slide Navigation Dots */}
                <div className="flex items-center gap-2">
                  {heroData.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      aria-label={`View slide ${i + 1}`}
                      className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        i === heroIndex
                          ? "w-8 bg-primary"
                          : "w-2.5 bg-slate-200 hover:bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* BLENDED TRUST HIGHLIGHTS (SEAMLESS IN HERO) */}
              <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-textDefault">
                <div className="inline-flex items-center gap-2 font-medium">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-textStrong font-semibold">Verified Quality</span>
                </div>

                <div className="inline-flex items-center gap-2 font-medium">
                  <div className="w-6 h-6 rounded-full bg-orange-50 text-primary flex items-center justify-center shrink-0">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-textStrong font-semibold">Safe Express Delivery</span>
                </div>

                <div className="inline-flex items-center gap-2 font-medium">
                  <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <BadgeCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-textStrong font-semibold">FSSAI Certified</span>
                </div>
              </div>

            </div>

            {/* RIGHT — SPACIOUS HERO IMAGE SHOWCASE */}
            <div className="lg:col-span-5 relative w-full">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-100 aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 group">
                <img
                  key={heroIndex}
                  src={heroData[heroIndex].image}
                  alt={heroData[heroIndex].title}
                  className="w-full h-full object-cover transition-opacity duration-700"
                />

                {/* Subtle Farm-Fresh Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-white/80 rounded-xl px-3.5 py-1.5 shadow-sm z-10 flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{heroData[heroIndex].tag}</span>
                </div>

                {/* Subtle Prev/Next Navigation Controls */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
                  <button
                    onClick={() => setHeroIndex((heroIndex - 1 + heroData.length) % heroData.length)}
                    aria-label="Previous slide"
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs border border-white/60 transition-all active:scale-90 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setHeroIndex((heroIndex + 1) % heroData.length)}
                    aria-label="Next slide"
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs border border-white/60 transition-all active:scale-90 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= 2. STOREFRONT & PRODUCT CATALOG (BG: bgApp, DISTINCT BAND) ================= */}
      <section id="products-section" className="w-full bg-bgApp py-10 sm:py-14 border-b border-borderDefault scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* SECTION TITLE */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                <span className="text-slate-900">Organic Catalog &amp; </span>
                <span className="text-primary">Fresh Finds</span>
              </h2>
              <p className="text-xs sm:text-sm text-textDefault mt-1.5">
                Lab-screened, transparent whole foods delivered straight to your door
              </p>
            </div>
            <div className="text-xs text-textMuted font-medium">
              Showing {products.length} products &bull; Page {page} of {totalPages}
            </div>
          </div>

          {/* SEARCH & FILTERS TOOLBAR */}
          <div className="bg-white border border-borderDefault rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">

              {/* Search Input Bar */}
              <form onSubmit={handleSearch} className="flex-1 flex items-center">
                <div className="relative flex-1 flex items-center">
                  <Search className="w-4 h-4 text-textMuted absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search organic fruits, almond milk, supplements, grains..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-10 pr-20 py-2.5 text-xs sm:text-sm bg-bgApp border border-borderDefault rounded-xl focus:outline-none focus:border-primary transition"
                  />
                  {searchText && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-16 text-textMuted hover:text-textStrong p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    className="absolute right-1.5 px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primaryHover transition"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">

                {/* Category Dropdown alongside Search */}
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="text-xs font-semibold bg-bgApp border border-borderDefault rounded-xl px-3 py-2 text-textStrong focus:outline-none focus:border-primary"
                >
                  <option value="">All Products</option>
                  {sortedCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Care Dropdown */}
                <select
                  value={care}
                  onChange={(e) => { setCare(e.target.value); setPage(1); }}
                  className="text-xs font-medium bg-bgApp border border-borderDefault rounded-xl px-3 py-2 text-textStrong focus:outline-none focus:border-primary"
                >
                  <option value="">Care Category</option>
                  <option value="Skin Care">Skin Care</option>
                  <option value="Hair Care">Hair Care</option>
                  <option value="Digestive Care">Digestive Care</option>
                  <option value="Immunity Care">Immunity Care</option>
                </select>

                {/* Concern Dropdown */}
                <select
                  value={concern}
                  onChange={(e) => { setConcern(e.target.value); setPage(1); }}
                  className="text-xs font-medium bg-bgApp border border-borderDefault rounded-xl px-3 py-2 text-textStrong focus:outline-none focus:border-primary"
                >
                  <option value="">Health Concern</option>
                  <option value="Immunity">Immunity</option>
                  <option value="Digestion">Digestion</option>
                  <option value="Skin Health">Skin Health</option>
                  <option value="Weight Loss">Weight Loss</option>
                </select>

                {/* Custom Budget Filter with Slider & Exact Input */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPricePopup(!showPricePopup)}
                    className={`flex items-center gap-1.5 text-xs font-medium border rounded-xl px-3 py-2 transition ${
                      price !== 1000
                        ? "bg-orange-50 text-primary border-orange-200 font-semibold"
                        : "bg-bgApp text-textStrong border-borderDefault hover:border-primary/40"
                    }`}
                  >
                    <span>{price !== 1000 ? `Max: ₹${price}` : "Budget: Any"}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {showPricePopup && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowPricePopup(false)} />
                      <div className="absolute right-0 sm:left-0 mt-2 w-64 bg-white border border-borderDefault rounded-2xl p-4 shadow-xl z-40 space-y-3 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-textStrong">Custom Budget</span>
                          <span className="text-xs font-bold text-primary">₹{price}</span>
                        </div>

                        {/* Slider */}
                        <input
                          type="range"
                          min="50"
                          max="2000"
                          step="25"
                          value={price}
                          onChange={(e) => { setPrice(Number(e.target.value)); setPage(1); }}
                          className="w-full accent-primary h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                        />

                        {/* Custom Price Input */}
                        <div>
                          <label className="text-[11px] text-textMuted font-medium block mb-1">Custom Amount</label>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-textMuted font-bold">₹</span>
                              <input
                                type="number"
                                min="1"
                                placeholder="e.g. 350"
                                value={price === 1000 ? "" : price}
                                onChange={(e) => {
                                  const val = e.target.value === "" ? 1000 : Number(e.target.value);
                                  setPrice(val);
                                  setPage(1);
                                }}
                                className="w-full pl-7 pr-3 py-1.5 text-xs font-semibold bg-bgApp border border-borderDefault rounded-xl focus:outline-none focus:border-primary"
                              />
                            </div>
                            {price !== 1000 && (
                              <button
                                type="button"
                                onClick={() => { setPrice(1000); setPage(1); }}
                                className="text-xs text-textMuted hover:text-dangerText font-semibold px-2 py-1.5 rounded-lg hover:bg-red-50 transition"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-borderDefault">
                          {[150, 300, 500, 800].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => { setPrice(preset); setPage(1); }}
                              className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                                price === preset
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 text-textDefault hover:bg-orange-50 hover:text-primary"
                              }`}
                            >
                              ₹{preset}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => { setPrice(1000); setPage(1); setShowPricePopup(false); }}
                            className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 text-textDefault hover:bg-gray-200 transition"
                          >
                            Any
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  className="text-xs font-medium bg-bgApp border border-borderDefault rounded-xl px-3 py-2 text-textStrong focus:outline-none focus:border-primary"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>

                {/* Reset Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-dangerText bg-red-50 hover:bg-red-100 rounded-xl transition"
                    title="Clear all filters"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}

              </div>

            </div>

            {/* CATEGORY LIST PILLS NEAR SEARCH BAR */}
            {categories.length > 0 && (
              <div className="pt-2.5 border-t border-borderDefault flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => { setCategory(""); setPage(1); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    category === ""
                      ? "bg-primary text-white shadow-xs"
                      : "bg-bgApp text-textDefault border border-borderDefault hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  All Products
                </button>

                {sortedCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id === category ? "" : cat.id);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                      category == cat.id
                        ? "bg-primary text-white shadow-xs"
                        : "bg-bgApp text-textDefault border border-borderDefault hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* ACTIVE FILTER CHIPS */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-borderDefault text-xs">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-primary border border-orange-200 rounded-lg">
                    "{searchQuery}"
                    <button onClick={clearSearch}><X className="w-3 h-3" /></button>
                  </span>
                )}

                {category && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-textStrong rounded-lg">
                    {categories.find((c) => c.id == category)?.name || category}
                    <button onClick={() => { setCategory(""); setPage(1); }}><X className="w-3 h-3" /></button>
                  </span>
                )}

                {care && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-textStrong rounded-lg">
                    {care}
                    <button onClick={() => { setCare(""); setPage(1); }}><X className="w-3 h-3" /></button>
                  </span>
                )}

                {concern && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-textStrong rounded-lg">
                    {concern}
                    <button onClick={() => { setConcern(""); setPage(1); }}><X className="w-3 h-3" /></button>
                  </span>
                )}

                {price !== 1000 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-textStrong rounded-lg">
                    Max: ₹{price}
                    <button onClick={() => { setPrice(1000); setPage(1); }}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* FULL-WIDTH RESPONSIVE PRODUCTS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">

            {loading ? (
              <div className="col-span-full text-center py-20 text-textDefault text-base">
                Loading catalog products...
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white border border-borderDefault rounded-2xl p-8">
                <p className="text-textDefault text-base font-semibold">No products found</p>
                <p className="text-xs text-textMuted mt-1">Try resetting your category or budget filters</p>
                <button
                  onClick={resetFilters}
                  className="mt-3 btn-primary text-xs px-4 py-2 rounded-xl"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              products.map((product) => {
                const quantity = getQuantity(product.id);
                const discount = Number(product.discount_percent) || 0;
                const finalPrice = discount > 0
                  ? Math.round(Number(product.price) * (1 - discount / 100))
                  : Number(product.price);
                const isWishlisted = wishlistIds.includes(String(product.id));

                return (
                  <div
                    key={product.id}
                    className="bg-white border border-borderDefault rounded-2xl p-3 sm:p-4 shadow-xs hover:shadow-card transition flex flex-col justify-between group"
                  >
                    <div>
                      {/* PRODUCT IMAGE CONTAINER */}
                      <div className="relative h-32 sm:h-36 md:h-44 bg-bgApp rounded-xl mb-3 flex items-center justify-center p-2 overflow-hidden border border-borderDefault/60">
                        {discount > 0 && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs z-10">
                            {discount}% OFF
                          </span>
                        )}

                        <img
                          src={product.image_url || "https://res.cloudinary.com/dsn1q7hyk/image/upload/q_auto/f_auto/v1774419499/Clinton-Foodmart_ktkl3m.jpg"}
                          alt={product.title}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />

                        {role === "customer" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlistItem(product.id);
                            }}
                            className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full shadow-xs z-10 hover:scale-110 transition"
                            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* TITLE */}
                      <h3
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="font-primary text-xs sm:text-sm font-semibold text-textStrong line-clamp-1 hover:text-primary transition cursor-pointer"
                        title={product.title}
                      >
                        {product.title}
                      </h3>

                      {/* DESCRIPTION */}
                      <p className="text-textMuted text-[11px] sm:text-xs mt-1 line-clamp-2 leading-relaxed">
                        {product.description || "Fresh, naturally curated whole food."}
                      </p>

                      {/* PRICE & HEALTH RATING BADGE */}
                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-primary font-bold text-sm sm:text-base">
                            ₹{finalPrice}
                          </span>
                          {discount > 0 && (
                            <span className="text-[10px] text-textMuted line-through">
                              ₹{product.price}
                            </span>
                          )}
                        </div>

                        {product.health_rating && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              product.health_rating.toLowerCase().includes("healthy")
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-red-100 text-red-700 border border-red-200"
                            }`}
                          >
                            {product.health_rating}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-3.5 space-y-1.5">
                      {canAddToCart && (
                        <div>
                          {quantity === 0 ? (
                            <button
                              onClick={() => increaseQty(product)}
                              className="bg-primary hover:bg-primaryHover text-white w-full py-1.5 rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 text-center"
                            >
                              Add to Cart
                            </button>
                          ) : (
                            <div className="flex items-center justify-center gap-2 border border-borderDefault rounded-xl py-1 bg-bgApp">
                              <button
                                onClick={() => decreaseQty(product)}
                                className="font-bold text-sm px-2 text-textStrong hover:text-red-500"
                              >
                                -
                              </button>
                              <span className="font-bold text-xs text-textStrong">{quantity}</span>
                              <button
                                onClick={() => increaseQty(product)}
                                className="font-bold text-sm px-2 text-textStrong hover:text-primary"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="border border-primary text-primary hover:bg-primary hover:text-white w-full py-1.5 rounded-xl text-xs font-semibold transition"
                      >
                        View Details
                      </button>
                    </div>

                  </div>
                );
              })
            )}

          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8 pt-6 border-t border-borderDefault">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-borderDefault bg-white text-textStrong disabled:opacity-30 transition hover:bg-gray-50"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      page === p
                        ? "bg-primary text-white shadow-xs"
                        : "text-textDefault hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-borderDefault bg-white text-textStrong disabled:opacity-30 transition hover:bg-gray-50"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </section>

      {/* ================= 3. DIRECT FARM FRESHNESS SHOWCASE (BG: Orange/Amber Warm Gradient Band) ================= */}
      <section className="w-full bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100/60 border-b border-orange-200/60 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-extrabold text-textStrong">
                Peak Freshness Delivered Straight to Your Kitchen
              </h3>
              <p className="text-xs sm:text-sm text-textDefault leading-relaxed">
                By eliminating multi-tiered middlemen, TrackMart delivers unpolished grains, farm-harvested greens, and cold-pressed elixirs within hours of packaging.
              </p>
            </div>

            <button
              onClick={() => {
                const section = document.getElementById("products-section");
                if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="btn-primary text-xs sm:text-sm px-6 py-3 rounded-xl shrink-0 shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer font-semibold"
            >
              Explore Farm Harvest
            </button>
          </div>
        </div>
      </section>

      {/* ================= 4. THE SCIENCE OF TRACKMART (BG: bgSurfaceAlt, DISTINCT BAND) ================= */}
      <section id="about-section" className="w-full bg-bgSurfaceAlt border-b border-borderDefault py-16 sm:py-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* EDITORIAL HEADER */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-textStrong">
              Why Conscious Households Choose <span className="text-primary">TrackMart</span>
            </h2>
            <p className="text-textDefault text-xs sm:text-sm mt-3 leading-relaxed">
              Most commercial grocery aisles conceal harmful artificial additives, refined sugars, and inflated claims. TrackMart empowers you with radical ingredient transparency and verified clinical nutritional grades.
            </p>
          </div>

          {/* 3 VISUAL FEATURE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">

            {/* CARD 1 */}
            <div className="bg-white rounded-3xl border border-borderDefault overflow-hidden shadow-xs hover:shadow-card transition-all duration-300 flex flex-col group">
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=80"
                  alt="Nutritional Intelligence"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-textStrong">
                    Nutritional Health Scoring
                  </h3>
                  <p className="text-textDefault text-xs mt-2 leading-relaxed">
                    Every food item is screened for glycemic impact, artificial binders, and micronutrient balance, generating an objective grade before you purchase.
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 2 */}
            <div className="bg-white rounded-3xl border border-borderDefault overflow-hidden shadow-xs hover:shadow-card transition-all duration-300 flex flex-col group">
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80"
                  alt="Direct Farm Procurement"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-textStrong">
                    Direct-from-Farm Procurement
                  </h3>
                  <p className="text-textDefault text-xs mt-2 leading-relaxed">
                    Connect directly with certified organic farmers and wellness artisans. Eliminating middlemen ensures both peak freshness and equitable grower pricing.
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 3 */}
            <div className="bg-white rounded-3xl border border-borderDefault overflow-hidden shadow-xs hover:shadow-card transition-all duration-300 flex flex-col group">
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80"
                  alt="Targeted Wellness Diets"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-textStrong">
                    Targeted Wellness Categorization
                  </h3>
                  <p className="text-textDefault text-xs mt-2 leading-relaxed">
                    Filter by physiological objectives including digestive health, glycemic control, gut microbiota vitality, and clean athletic recovery.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 5. MERCHANT RECRUITMENT CALLOUT (BG: bgSurface/White, DISTINCT BAND) ================= */}
      <section className="w-full bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-borderDefault shadow-card bg-gradient-to-br from-orange-50/70 via-white to-amber-50/50">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              
              {/* LEFT CONTENT */}
              <div className="p-8 sm:p-10 lg:p-12 max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  Grow With TrackMart
                </span>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-textStrong tracking-tight leading-tight">
                  Are You an Organic Food Grower or Health Brand?
                </h3>

                <p className="text-xs sm:text-sm text-textDefault leading-relaxed">
                  Reach thousands of health-conscious customers across the country. Our certified marketplace offers seamless onboarding, verified customer trust, and automated payouts.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-semibold text-textStrong">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Zero Hidden Fees
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    FSSAI Verified Audience
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Weekly Automated Payouts
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate("/apply-vendor")}
                    className="btn-primary text-xs sm:text-sm px-7 py-3 rounded-xl shadow-sm hover:shadow-md transition active:scale-95 cursor-pointer font-bold inline-flex items-center gap-2"
                  >
                    <span>Apply as a Merchant</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* RIGHT IMAGE */}
              <div className="w-full lg:w-[42%] h-64 sm:h-72 lg:h-auto relative overflow-hidden self-stretch min-h-[280px]">
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&q=80"
                  alt="Organic Food Grower"
                  className="w-full h-full object-cover"
                />
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
