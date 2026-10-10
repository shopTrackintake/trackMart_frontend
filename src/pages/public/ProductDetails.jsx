import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { getProductById } from "../../services/productService";
import { getWishlist, toggleWishlist } from "../../services/wishlistService";
import { 
  ArrowLeft, Award, Flame, Scale, Calendar, Building, 
  ShieldCheck, Activity, Check, Info, FileText, CheckCircle2,
  Heart, Truck, Sparkles, Eye, X, ZoomIn, 
  Store, CheckCircle, Clock, MapPin, Package
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const { addToCart, updateQuantity: cartUpdateQuantity, getProductQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showLabelModal, setShowLabelModal] = useState(false);

  const cartQty = getProductQuantity(id);
  const isAdded = cartQty > 0;
  const quantity = cartQty > 0 ? cartQty : 1;
  const canAddToCart = role === null || role === "customer";

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const productRes = await getProductById(id);
        if (isMounted) {
          const p = productRes.data;
          setProduct(p);
          setActiveImage(p?.image_url || null);
        }

        if (role === "customer") {
          try {
            const wishRes = await getWishlist();
            if (isMounted && Array.isArray(wishRes?.data)) {
              const exists = wishRes.data.some(
                (item) => String(item.product_id || item.id) === String(id)
              );
              setIsWishlisted(exists);
            }
          } catch (err) {
            console.error("Error fetching wishlist status:", err);
          }
        }
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [id, role]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCart(product, 1);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const updateQuantity = async (newQty) => {
    if (!product) return;
    try {
      await cartUpdateQuantity(product.id, newQty);
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const handleToggleWishlist = async () => {
    if (!role) {
      navigate("/login");
      return;
    }
    try {
      await toggleWishlist(product.id);
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-semibold text-textDefault">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-textStrong">Product Not Found</h2>
        <p className="text-xs text-textMuted mt-1">This product may be archived or unavailable.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 btn-primary text-xs px-5 py-2.5 rounded-xl font-semibold"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  // Parse calculations
  const discount = Number(product.discount_percent) || 0;
  const originalPrice = Number(product.price) || 0;
  const finalPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;
  const savings = originalPrice - finalPrice;
  const deliveryCharge = Number(product.delivery_charge) || 0;

  // Parse lists and images
  const dietaryBadges = typeof product.dietary_type === "string"
    ? product.dietary_type.split(",").map(s => s.trim()).filter(Boolean)
    : Array.isArray(product.dietary_type) ? product.dietary_type : [];

  const ingredientList = typeof product.ingredients === "string"
    ? product.ingredients.split("\n").map(s => s.trim()).filter(Boolean)
    : Array.isArray(product.ingredients) ? product.ingredients : [];

  const howToUseList = typeof product.how_to_use === "string"
    ? product.how_to_use.split("\n").map(s => s.trim()).filter(Boolean)
    : Array.isArray(product.how_to_use) ? product.how_to_use : [];

  const makingProcessList = typeof product.making_process === "string"
    ? product.making_process.split("\n").map(s => s.trim()).filter(Boolean)
    : Array.isArray(product.making_process) ? product.making_process : [];

  let categoryBenefits = [];
  if (product.benefits) {
    try {
      categoryBenefits = typeof product.benefits === "string" ? JSON.parse(product.benefits) : product.benefits;
      if (!Array.isArray(categoryBenefits)) categoryBenefits = [];
    } catch {
      categoryBenefits = [];
    }
  }

  const galleryImages = [
    product.image_url,
    ...(Array.isArray(product.images) ? product.images : []),
    ...(typeof product.ingredients_image_url === "string" ? product.ingredients_image_url.split(",").map(s => s.trim()) : [])
  ].filter(Boolean);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fadeIn pb-24 md:pb-8">

      {/* 1. BREADCRUMBS & TOP NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-borderDefault">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-borderDefault hover:bg-bgSurfaceAlt text-textStrong text-xs font-semibold transition active:scale-95 cursor-pointer bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <nav className="text-xs text-textDefault truncate max-w-xs sm:max-w-md flex items-center gap-1.5">
            <span className="hover:text-primary cursor-pointer" onClick={() => navigate("/")}>Store</span>
            <span className="text-textMuted">/</span>
            {product.category_name && (
              <>
                <span className="text-textDefault truncate">{product.category_name}</span>
                <span className="text-textMuted">/</span>
              </>
            )}
            <span className="font-semibold text-textStrong truncate">{product.title}</span>
          </nav>
        </div>

        {/* VENDOR QUICK EDIT ACTION */}
        {role === "vendor" && (
          <button
            onClick={() => navigate(`/vendor/edit-product/${product.id}`)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>Edit Product</span>
          </button>
        )}
      </div>

      {/* 2. TOP HERO CARD (IMAGE GALLERY + CORE PURCHASE SPECS) */}
      <div className="bg-white border border-borderDefault rounded-3xl p-5 sm:p-7 md:p-9 shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* LEFT: IMAGE SHOWCASE & GALLERY (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* MAIN IMAGE DISPLAY */}
            <div className="relative w-full h-72 sm:h-96 bg-bgApp rounded-2xl p-4 flex items-center justify-center overflow-hidden border border-borderDefault/80 group">
              
              {/* DISCOUNT BADGE */}
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-xs z-10">
                  {discount}% OFF
                </span>
              )}

              {/* HEALTH RATING BADGE */}
              {product.health_rating && (
                <span
                  className={`absolute top-3 right-12 text-[11px] font-bold px-2.5 py-0.5 rounded-full z-10 border ${
                    product.health_rating.toLowerCase().includes("healthy")
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {product.health_rating}
                </span>
              )}

              {/* WISHLIST BUTTON */}
              {role === "customer" && (
                <button
                  onClick={handleToggleWishlist}
                  className="absolute top-3 right-3 bg-white/95 p-2 rounded-full shadow-xs z-10 hover:scale-110 transition cursor-pointer border border-borderDefault/60"
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                </button>
              )}

              {activeImage ? (
                <img
                  src={activeImage.startsWith("http") ? activeImage : `http://localhost:5000/uploads/${activeImage}`}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="text-textMuted text-xs font-semibold">No Image Available</div>
              )}
            </div>

            {/* THUMBNAIL SELECTOR STRIP */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border p-1 bg-bgApp transition shrink-0 cursor-pointer ${
                      activeImage === img ? "border-primary ring-2 ring-primary/20" : "border-borderDefault hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={img.startsWith("http") ? img : `http://localhost:5000/uploads/${img}`}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* INGREDIENTS LABEL PREVIEW BUTTON (IF AVAILABLE) */}
            {product.ingredients_image_url && (
              <button
                onClick={() => setShowLabelModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-surface-alt border border-borderDefault rounded-xl text-xs font-bold text-textStrong hover:border-primary/40 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-primary" />
                <span>Inspect Packaging &amp; Nutrition Label</span>
              </button>
            )}

          </div>

          {/* RIGHT: OVERVIEW, PRICING & PURCHASE (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            <div>

              {/* BADGES ROW: BRAND, CATEGORY, CARE, CONCERN, DIETARY */}
              <div className="flex flex-wrap items-center gap-2">
                {product.brand_name && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-white">
                    {product.brand_name}
                  </span>
                )}

                {product.category_name && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-primary border border-orange-200">
                    {product.category_name}
                  </span>
                )}

                {dietaryBadges.map((badge) => (
                  <span key={badge} className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {badge}
                  </span>
                ))}

                {product.care_type && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                    {product.care_type}
                  </span>
                )}

                {product.concern_type && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                    {product.concern_type}
                  </span>
                )}
              </div>

              {/* TITLE */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-textStrong tracking-tight mt-3 leading-tight">
                {product.title}
              </h1>

              {/* VENDOR SELLER ATTRIBUTION */}
              <div className="flex items-center gap-2 mt-2 text-xs text-textMuted">
                <Store className="w-3.5 h-3.5 text-primary" />
                <span>Sold by:</span>
                <strong className="font-semibold text-textStrong">
                  {product.business_name || "Verified Farm Merchant"}
                </strong>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                  <CheckCircle className="w-3 h-3" /> FSSAI Audited
                </span>
              </div>

              {/* PRICING BLOCK */}
              <div className="mt-4 p-4 rounded-2xl bg-bgApp border border-borderDefault/70 flex flex-wrap items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-primary font-mono">
                  ₹{finalPrice}
                </span>

                {discount > 0 && (
                  <>
                    <span className="text-base text-textMuted line-through font-semibold">
                      ₹{originalPrice}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Save ₹{savings} ({discount}% OFF)
                    </span>
                  </>
                )}

                <span className="w-full text-[11px] text-textMuted">
                  Inclusive of all applicable taxes
                </span>
              </div>

              {/* DELIVERY & SHIPPING INFO */}
              <div className="mt-3 flex items-center gap-2 text-xs text-textDefault">
                <Truck className="w-4 h-4 text-primary shrink-0" />
                {deliveryCharge === 0 ? (
                  <span className="font-bold text-emerald-700">Free Express Delivery on this item</span>
                ) : (
                  <span>
                    Standard Delivery: <strong>₹{deliveryCharge}</strong> (Free on orders over ₹499)
                  </span>
                )}
              </div>

              {/* KEY SPECIFICATIONS GRID */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {product.size && (
                  <div className="p-2.5 rounded-xl bg-white border border-borderDefault">
                    <span className="text-[11px] text-textMuted block">Net Quantity</span>
                    <strong className="text-textStrong font-semibold">{product.size}</strong>
                  </div>
                )}

                {product.net_weight && (
                  <div className="p-2.5 rounded-xl bg-white border border-borderDefault">
                    <span className="text-[11px] text-textMuted block">Net Weight</span>
                    <strong className="text-textStrong font-semibold">{product.net_weight}</strong>
                  </div>
                )}

                {product.flavour && (
                  <div className="p-2.5 rounded-xl bg-white border border-borderDefault">
                    <span className="text-[11px] text-textMuted block">Flavour</span>
                    <strong className="text-textStrong font-semibold">{product.flavour}</strong>
                  </div>
                )}

                {product.serving_size && (
                  <div className="p-2.5 rounded-xl bg-white border border-borderDefault">
                    <span className="text-[11px] text-textMuted block">Serving Size</span>
                    <strong className="text-textStrong font-semibold">{product.serving_size}</strong>
                  </div>
                )}

                {product.servings_per_container && (
                  <div className="p-2.5 rounded-xl bg-white border border-borderDefault">
                    <span className="text-[11px] text-textMuted block">Servings / Pack</span>
                    <strong className="text-textStrong font-semibold">{product.servings_per_container}</strong>
                  </div>
                )}

                {product.stock !== undefined && (
                  <div className="p-2.5 rounded-xl bg-white border border-borderDefault">
                    <span className="text-[11px] text-textMuted block">Availability</span>
                    <strong className={product.stock > 0 ? "text-emerald-700 font-semibold" : "text-dangerText font-semibold"}>
                      {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                    </strong>
                  </div>
                )}
              </div>

              {/* 4 MACRO NUTRIENTS HIGHLIGHT (CALORIES, PROTEIN, FAT, SUGAR) */}
              {(product.calories || product.protein || product.fat || product.sugar) && (
                <div className="mt-4 pt-3 border-t border-borderDefault">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-textMuted block mb-2">
                    Core Nutrition Indicators
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {product.calories && (
                      <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-100">
                        <span className="text-[10px] text-amber-800 font-medium block">Energy</span>
                        <strong className="text-textStrong font-bold block">{product.calories} kcal</strong>
                      </div>
                    )}
                    {product.protein && (
                      <div className="p-2 rounded-xl bg-blue-50/80 border border-blue-100">
                        <span className="text-[10px] text-blue-800 font-medium block">Protein</span>
                        <strong className="text-textStrong font-bold block">{product.protein}g</strong>
                      </div>
                    )}
                    {product.fat && (
                      <div className="p-2 rounded-xl bg-purple-50/80 border border-purple-100">
                        <span className="text-[10px] text-purple-800 font-medium block">Total Fat</span>
                        <strong className="text-textStrong font-bold block">{product.fat}g</strong>
                      </div>
                    )}
                    {product.sugar && (
                      <div className="p-2 rounded-xl bg-pink-50/80 border border-pink-100">
                        <span className="text-[10px] text-pink-800 font-medium block">Sugar</span>
                        <strong className="text-textStrong font-bold block">{product.sugar}g</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* ADD TO CART ACTION (DESKTOP) */}
            {canAddToCart && product.stock > 0 && (
              <div className="pt-4 border-t border-borderDefault flex items-center gap-3">
                {!isAdded ? (
                  <button
                    onClick={handleAddToCart}
                    className="btn-primary text-sm px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition active:scale-95 font-bold cursor-pointer flex-1 text-center"
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-borderDefault rounded-xl overflow-hidden bg-bgApp shadow-xs">
                      <button
                        onClick={() => updateQuantity(quantity - 1)}
                        className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-textStrong font-bold transition"
                      >
                        -
                      </button>
                      <span className="px-5 font-bold text-textStrong text-sm">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(quantity + 1)}
                        className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-textStrong font-bold transition"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => navigate("/cart")}
                      className="btn-primary text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs"
                    >
                      Go to Cart
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>

      {/* 3. PRODUCT STORY & DESCRIPTION */}
      {product.description && (
        <div className="bg-white border border-borderDefault rounded-3xl p-6 sm:p-8 shadow-card space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-textStrong tracking-tight flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-primary" />
            <span>Product Description &amp; Origin</span>
          </h2>
          <p className="text-xs sm:text-sm text-textDefault leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {/* 4. HEALTH & NUTRITIONAL BENEFITS (FROM CATEGORY & PRODUCT) */}
      {categoryBenefits.length > 0 && (
        <div className="bg-white border border-borderDefault rounded-3xl p-6 sm:p-8 shadow-card space-y-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-textStrong tracking-tight flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
              <span>Verified Health &amp; Wellness Benefits</span>
            </h2>
            <p className="text-xs text-textMuted mt-1">
              Physiological and dietary benefits associated with {product.category_name || "this nutritional category"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryBenefits.map((benefit, i) => (
              <div
                key={i}
                className="bg-bgApp border border-borderDefault rounded-2xl overflow-hidden p-3.5 flex flex-col justify-between hover:shadow-sm transition"
              >
                {benefit.image && (
                  <div className="h-28 w-full rounded-xl overflow-hidden mb-3 bg-slate-100">
                    <img
                      src={benefit.image}
                      alt={benefit.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-textStrong leading-snug">
                    {benefit.title}
                  </h3>
                  <p className="text-[11px] text-textDefault mt-1 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ARTISAN MAKING PROCESS & DIRECTIONS FOR USE */}
      {(makingProcessList.length > 0 || howToUseList.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* MAKING PROCESS */}
          {makingProcessList.length > 0 && (
            <div className="bg-white border border-borderDefault rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-textStrong tracking-tight flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-primary" />
                <span>Artisan Preparation &amp; Controlled Crafting</span>
              </h2>
              <div className="space-y-3">
                {makingProcessList.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-textDefault leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOW TO USE */}
          {howToUseList.length > 0 && (
            <div className="bg-white border border-borderDefault rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-textStrong tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                <span>Recommended Directions for Use</span>
              </h2>
              <div className="space-y-3">
                {howToUseList.map((direction, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <p className="text-textDefault leading-relaxed">{direction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 6. INGREDIENTS LIST & NUTRITION FACTS BREAKDOWN */}
      {(ingredientList.length > 0 || product.nutrition_per_serving || product.nutrition_per_100g) && (
        <div className="bg-white border border-borderDefault rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-textStrong tracking-tight flex items-center gap-2">
              <Flame className="w-4.5 h-4.5 text-primary" />
              <span>Complete Ingredients &amp; Nutritional Facts</span>
            </h2>
            <p className="text-xs text-textMuted mt-1">
              Radical ingredient disclosure with zero concealed binders, sugars, or preservatives
            </p>
          </div>

          {/* INGREDIENTS TAGS */}
          {ingredientList.length > 0 && (
            <div>
              <span className="text-xs font-bold text-textStrong uppercase tracking-wider block mb-2">
                Formula Components ({ingredientList.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {ingredientList.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 text-xs bg-bgApp border border-borderDefault rounded-xl text-textStrong font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* NUTRITION FACTS PER SERVING & PER 100G */}
          {(product.nutrition_per_serving || product.nutrition_per_100g) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-borderDefault">
              {product.nutrition_per_serving && (
                <div className="p-4 rounded-2xl bg-bgApp border border-borderDefault space-y-2">
                  <h3 className="text-xs font-bold text-textStrong uppercase tracking-wider">Per Serving Facts</h3>
                  <p className="text-xs text-textDefault leading-relaxed font-mono whitespace-pre-line">
                    {product.nutrition_per_serving}
                  </p>
                </div>
              )}

              {product.nutrition_per_100g && (
                <div className="p-4 rounded-2xl bg-bgApp border border-borderDefault space-y-2">
                  <h3 className="text-xs font-bold text-textStrong uppercase tracking-wider">Per 100g Standard Facts</h3>
                  <p className="text-xs text-textDefault leading-relaxed font-mono whitespace-pre-line">
                    {product.nutrition_per_100g}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 7. REGULATORY, MANUFACTURER & TRACEABILITY */}
      {(product.manufacturer_name || product.manufacturer_address || product.fssai_license || product.batch_number || product.sku || product.barcode) && (
        <div className="bg-white border border-borderDefault rounded-3xl p-6 sm:p-8 shadow-card space-y-5">
          <h2 className="text-base sm:text-lg font-bold text-textStrong tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-primary" />
            <span>Traceability, Compliance &amp; Manufacturer Information</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            {product.fssai_license && (
              <div className="p-3 rounded-xl bg-bgApp border border-borderDefault">
                <span className="text-[11px] text-textMuted block">FSSAI License</span>
                <strong className="text-textStrong font-mono font-bold block mt-0.5">{product.fssai_license}</strong>
              </div>
            )}

            {product.batch_number && (
              <div className="p-3 rounded-xl bg-bgApp border border-borderDefault">
                <span className="text-[11px] text-textMuted block">Batch Number</span>
                <strong className="text-textStrong font-mono font-bold block mt-0.5">{product.batch_number}</strong>
              </div>
            )}

            {product.mfg_date && !isNaN(new Date(product.mfg_date).getTime()) && (
              <div className="p-3 rounded-xl bg-bgApp border border-borderDefault">
                <span className="text-[11px] text-textMuted block">Manufacturing Date</span>
                <strong className="text-textStrong font-semibold block mt-0.5">{new Date(product.mfg_date).toLocaleDateString()}</strong>
              </div>
            )}

            {product.expiry_date && !isNaN(new Date(product.expiry_date).getTime()) && (
              <div className="p-3 rounded-xl bg-bgApp border border-borderDefault">
                <span className="text-[11px] text-textMuted block">Expiry / Best Before</span>
                <strong className="text-textStrong font-semibold block mt-0.5">{new Date(product.expiry_date).toLocaleDateString()}</strong>
              </div>
            )}

            {product.sku && (
              <div className="p-3 rounded-xl bg-bgApp border border-borderDefault">
                <span className="text-[11px] text-textMuted block">SKU Code</span>
                <strong className="text-textStrong font-mono font-bold block mt-0.5">{product.sku}</strong>
              </div>
            )}

            {product.barcode && (
              <div className="p-3 rounded-xl bg-bgApp border border-borderDefault">
                <span className="text-[11px] text-textMuted block">Barcode / EAN</span>
                <strong className="text-textStrong font-mono font-bold block mt-0.5">{product.barcode}</strong>
              </div>
            )}

            {product.manufacturer_name && (
              <div className="col-span-2 p-3 rounded-xl bg-bgApp border border-borderDefault">
                <span className="text-[11px] text-textMuted block">Manufacturer &amp; Packer</span>
                <strong className="text-textStrong font-bold block mt-0.5">{product.manufacturer_name}</strong>
                {product.manufacturer_address && (
                  <p className="text-[11px] text-textDefault mt-1 leading-relaxed">{product.manufacturer_address}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. MOBILE STICKY BOTTOM ACTION BAR */}
      {canAddToCart && product.stock > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-borderDefault p-3.5 z-40 flex items-center justify-between shadow-2xl">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-primary font-mono">₹{finalPrice}</span>
              {discount > 0 && (
                <span className="text-xs text-textMuted line-through">₹{originalPrice}</span>
              )}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">
              {deliveryCharge === 0 ? "Free Delivery" : `+₹${deliveryCharge} delivery`}
            </span>
          </div>

          {!isAdded ? (
            <button
              onClick={handleAddToCart}
              className="btn-primary text-xs font-bold px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-borderDefault rounded-xl overflow-hidden bg-bgApp">
                <button
                  onClick={() => updateQuantity(quantity - 1)}
                  className="px-3 py-1.5 bg-white font-bold text-xs"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => updateQuantity(quantity + 1)}
                  className="px-3 py-1.5 bg-white font-bold text-xs"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => navigate("/cart")}
                className="btn-primary text-xs font-bold px-3 py-1.5 rounded-xl"
              >
                Cart
              </button>
            </div>
          )}
        </div>
      )}

      {/* 9. PACKAGING LABEL MODAL */}
      {showLabelModal && product.ingredients_image_url && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 animate-fadeIn max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-borderDefault pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-textStrong">Packaging &amp; Nutrition Label</h3>
              </div>
              <button
                onClick={() => setShowLabelModal(false)}
                className="p-1 rounded-lg text-textMuted hover:text-textStrong cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto rounded-xl bg-bgApp p-2 flex items-center justify-center">
              <img
                src={product.ingredients_image_url.startsWith("http") ? product.ingredients_image_url : `http://localhost:5000/uploads/${product.ingredients_image_url}`}
                alt="Product Label"
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-xs"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-textMuted pt-2">
              <span>Authentic label supplied directly by certified merchant</span>
              <button
                onClick={() => setShowLabelModal(false)}
                className="btn-outline text-xs px-4 py-1.5 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. SUCCESS POPUP */}
      {showPopup && (
        <div className="fixed bottom-20 md:bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold">Item added to your cart!</p>
            <p className="text-[11px] text-slate-300">Ready to proceed to checkout</p>
          </div>
          <button
            onClick={() => navigate("/cart")}
            className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-xl hover:bg-primaryHover transition ml-2 cursor-pointer"
          >
            View Cart
          </button>
        </div>
      )}

    </div>
  );
}