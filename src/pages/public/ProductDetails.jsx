import { useParams, useNavigate } from "react";
import { useEffect, useState, useContext } from "react";
import { getProductById } from "../../services/productService";
import { updateCartItem, getCart } from "../../services/cartService";
import { 
  ArrowLeft, Award, Flame, Scale, Calendar, Building, 
  ShieldCheck, Activity, Check, Info, FileText, CheckCircle2 
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { role } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const canAddToCart = role === null || role === "customer";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await getProductById(id);
        setProduct(productRes.data);

        if (role === "customer") {
          const cartRes = await getCart();
          const cartItem = cartRes.data.find(
            item => String(item.product_id?.id || item.product_id) === String(id)
          );

          if (cartItem) {
            setIsAdded(true);
            setQuantity(cartItem.quantity);
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, role]);

  const handleAddToCart = async () => {
    if (!role) {
      navigate("/login");
      return;
    }

    try {
      await updateCartItem(product.id, 1);
      setIsAdded(true);
      setQuantity(1);
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    } catch (err) {
      console.log(err);
    }
  };

  const updateQuantity = async (newQty) => {
    if (newQty < 1) return;
    try {
      setQuantity(newQty);
      await updateCartItem(product.id, newQty);
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <p className="text-center mt-10 text-slate-500 font-semibold">Loading product details...</p>;
  if (!product) return <p className="text-center mt-10 text-slate-500 font-semibold">Product not found</p>;

  const ingredientImages = product.ingredients_image_url
    ? product.ingredients_image_url.split(",")
    : [];
  const ingredientList = product.ingredients
    ? product.ingredients.split("\n")
    : [];

  const dietaryBadges = product.dietary_type
    ? product.dietary_type.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fadeIn">
      {/* NAVIGATION BAR & BREADCRUMBS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <nav className="text-xs sm:text-sm text-slate-500 truncate max-w-[240px] sm:max-w-md">
            <span>{role === "vendor" ? "Vendor Hub" : "Store"}</span>
            <span className="mx-1.5">/</span>
            <span className="font-semibold text-slate-900 truncate">{product.title}</span>
          </nav>
        </div>

        {/* VENDOR QUICK EDIT ACTION */}
        {role === "vendor" && (
          <button
            onClick={() => navigate(`/vendor/edit-product/${product.id}`)}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition shadow-xs shrink-0 self-start sm:self-auto"
          >
            ✏️ Edit Product
          </button>
        )}
      </div>

      {/* TOP SECTION */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* IMAGE */}
        <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-4 sm:p-6 flex items-center justify-center relative overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url.startsWith("http") ? product.image_url : `http://localhost:5000/uploads/${product.image_url}`}
              alt={product.title}
              className="max-h-[280px] sm:max-h-[420px] object-contain transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="text-textMuted text-sm font-semibold py-20">No Image Available</div>
          )}
        </div>

        {/* RIGHT DETAILS */}
        <div className="space-y-5">
          {/* BRAND & DIETARY BADGES */}
          <div className="flex flex-wrap items-center gap-2">
            {product.brand_name && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-white">
                {product.brand_name}
              </span>
            )}

            {dietaryBadges.map((badge) => (
              <span key={badge} className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                🌿 {badge}
              </span>
            ))}

            {product.category_name && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {product.category_name}
              </span>
            )}
          </div>

          {/* TITLE */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-primary font-bold text-slate-900 leading-tight">
            {product.title}
          </h1>

          {/* PRICE */}
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-primary">
              ₹{Number(product.discount_percent) > 0
                ? Math.round(Number(product.price) * (1 - Number(product.discount_percent) / 100))
                : product.price}
            </span>
            {Number(product.discount_percent) > 0 && (
              <>
                <span className="text-lg text-slate-400 line-through font-semibold">
                  ₹{product.price}
                </span>
                <span className="bg-red-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full uppercase">
                  {product.discount_percent}% OFF
                </span>
              </>
            )}
          </div>

          {/* KEY SPECS (Flavour, Serving Size, Net Weight) */}
          <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-slate-600 pt-1">
            <div>Net Quantity: <strong className="font-bold text-slate-900">{product.size}</strong></div>
            {product.flavour && (
              <div>Flavour: <strong className="font-bold text-slate-900">{product.flavour}</strong></div>
            )}
            {product.serving_size && (
              <div>Serving Size: <strong className="font-bold text-slate-900">{product.serving_size}</strong></div>
            )}
            {product.servings_per_container && (
              <div>Servings / Tub: <strong className="font-bold text-slate-900">{product.servings_per_container}</strong></div>
            )}
          </div>

          {/* STOCK */}
          <div>
            {product.stock === 0 ? (
              <span className="inline-block bg-red-100 text-red-700 px-3.5 py-1 rounded-full text-xs font-bold">
                Out of Stock
              </span>
            ) : (
              <span className="inline-block bg-emerald-100 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-bold">
                In Stock ({product.stock} available)
              </span>
            )}
          </div>

          {/* ADD TO CART */}
          {canAddToCart && product.stock > 0 && (
            <div className="pt-2">
              {!isAdded ? (
                <button
                  onClick={handleAddToCart}
                  className="bg-primary text-white font-bold text-sm px-8 py-3 rounded-xl hover:bg-primaryHover transition shadow-md active:scale-95"
                >
                  Add to Cart
                </button>
              ) : (
                <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden w-fit shadow-xs">
                  <button
                    onClick={() => updateQuantity(quantity - 1)}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
                  >
                    -
                  </button>
                  <span className="px-5 font-bold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(quantity + 1)}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          )}

          {/* NUTRITION STATS */}
          {(product.calories || product.protein || product.fat || product.sugar) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {product.calories && (
                <div className="rounded-xl p-3 text-center bg-amber-50 border border-amber-100">
                  <p className="text-xs text-slate-500 font-semibold">Calories</p>
                  <p className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{product.calories} kcal</p>
                </div>
              )}
              {product.protein && (
                <div className="rounded-xl p-3 text-center bg-blue-50 border border-blue-100">
                  <p className="text-xs text-slate-500 font-semibold">Protein</p>
                  <p className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{product.protein} g</p>
                </div>
              )}
              {product.fat && (
                <div className="rounded-xl p-3 text-center bg-purple-50 border border-purple-100">
                  <p className="text-xs text-slate-500 font-semibold">Total Fat</p>
                  <p className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{product.fat} g</p>
                </div>
              )}
              {product.sugar && (
                <div className="rounded-xl p-3 text-center bg-pink-50 border border-pink-100">
                  <p className="text-xs text-slate-500 font-semibold">Sugar</p>
                  <p className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{product.sugar} g</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DETAILED NUTRITION FACTS PER 100G / PER SERVING */}
      {(product.nutrition_per_serving || product.nutrition_per_100g) && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-primary flex items-center gap-2 border-b border-slate-100 pb-3">
            <Flame className="w-4.5 h-4.5 text-primary" />
            Nutritional Facts Breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.nutrition_per_serving && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Per Serving Facts</h3>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-mono whitespace-pre-line">
                  {product.nutrition_per_serving}
                </p>
              </div>
            )}

            {product.nutrition_per_100g && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Per 100g Facts</h3>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-mono whitespace-pre-line">
                  {product.nutrition_per_100g}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANUFACTURER & COMPLIANCE SPECIFICATIONS */}
      {(product.manufacturer_name || product.batch_number || product.fssai_license || product.sku) && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-primary flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4.5 h-4.5 text-primary" />
            Manufacturer, Batch & Regulatory Information
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
            {product.manufacturer_name && (
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Manufacturer</span>
                <strong className="text-slate-900 font-bold block">{product.manufacturer_name}</strong>
              </div>
            )}

            {product.batch_number && (
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Batch Number</span>
                <strong className="text-slate-900 font-mono font-bold block">{product.batch_number}</strong>
              </div>
            )}

            {product.mfg_date && (
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Manufacturing Date</span>
                <strong className="text-slate-900 font-medium block">{new Date(product.mfg_date).toLocaleDateString()}</strong>
              </div>
            )}

            {product.expiry_date && (
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Expiry / Best Before</span>
                <strong className="text-slate-900 font-medium block">{new Date(product.expiry_date).toLocaleDateString()}</strong>
              </div>
            )}

            {product.fssai_license && (
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">FSSAI License No</span>
                <strong className="text-slate-900 font-mono font-bold block">{product.fssai_license}</strong>
              </div>
            )}

            {product.sku && (
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">SKU Code</span>
                <strong className="text-slate-900 font-mono font-bold block">{product.sku}</strong>
              </div>
            )}

            {product.barcode && (
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Barcode / EAN</span>
                <strong className="text-slate-900 font-mono font-bold block">{product.barcode}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DESCRIPTION */}
      {product.description && (
        <div className="bg-bgSurface border border-borderDefault rounded-2xl p-5 shadow-card space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-primary">
            Description
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {/* HOW TO USE */}
      {product.how_to_use && (
        <div className="bg-bgSurface border border-borderDefault rounded-2xl p-5 shadow-card space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-primary">
            Directions for Use
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
            {product.how_to_use.split("\n").map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* INGREDIENTS LIST */}
      {ingredientList.length > 0 && (
        <div className="bg-bgSurface border border-borderDefault rounded-2xl p-5 shadow-card space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-primary">
            Ingredients Formula
          </h2>
          <div className="flex flex-wrap gap-2">
            {ingredientList.map((item, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs bg-slate-100 border border-slate-200 rounded-full text-slate-800 font-semibold"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* POPUP */}
      {showPopup && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 z-50 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <p className="text-sm font-bold">Item added to your cart!</p>
          <button onClick={() => navigate("/cart")} className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-xl hover:bg-primaryHover transition">
            View Cart
          </button>
        </div>
      )}
    </div>
  );
}