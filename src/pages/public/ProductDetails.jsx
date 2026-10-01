import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { getProducts,getProductById  } from "../../services/productService";
import { updateCartItem, getCart } from "../../services/cartService";
import { ArrowLeft } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function ProductDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  // Get role from AuthContext to control button visibility
  const { role } = useContext(AuthContext);

  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [quantity, setQuantity]   = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [isAdded, setIsAdded]     = useState(false);
const [selectedImage, setSelectedImage] = useState(null);
  // Button should show only when:
  // 1. Not logged in (role === null)  → show button, clicking redirects to login
  // 2. Logged in as customer          → show button, clicking adds to cart
  // 3. Logged in as vendor or admin   → hide button completely
  const canAddToCart = role === null || role === "customer";

 useEffect(() => {
  const fetchData = async () => {
    try {
      const productRes = await getProductById(id);
      setProduct(productRes.data);

      if (role === "customer") {
        const cartRes = await getCart();
        const cartItem = cartRes.data.find(
          item =>
            String(item.product_id?.id || item.product_id) === String(id)
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

    // If not logged in → redirect to login page
    if (!role) {
      navigate("/login");
      return;
    }

    // If customer → add to cart normally
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


  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!product) return <p className="text-center mt-10">Product not found</p>;
const ingredientImages = product.ingredients_image_url
  ? product.ingredients_image_url.split(",")
  : [];
  const ingredientList = product.ingredients
  ? product.ingredients.split("\n")
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
        <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-4 sm:p-6 flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="max-h-[280px] sm:max-h-[420px] object-contain"
            />
          ) : (
            <div className="text-textMuted">No Image</div>
          )}
        </div>


        {/* RIGHT DETAILS */}
        <div className="space-y-5">

          {/* TITLE */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-primary font-bold text-primary">
            {product.title}
          </h1>

          {/* PRICE */}
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-semibold text-green-600">
              ₹{Number(product.discount_percent) > 0
                ? Math.round(Number(product.price) * (1 - Number(product.discount_percent) / 100))
                : product.price}
            </span>
            {Number(product.discount_percent) > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  ₹{product.price}
                </span>
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {product.discount_percent}% OFF
                </span>
              </>
            )}
          </div>

          {/* SIZE */}
          <div className="text-sm sm:text-base text-textMuted">
            Weight: <span className="font-semibold text-textStrong">{product.size}</span>
          </div>

          {/* STOCK */}
          {product.stock === 0 ? (
            <span className="inline-block bg-red-100 text-dangerText px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
              Out of Stock
            </span>
          ) : (
            <span className="inline-block bg-green-100 text-successText px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
              In Stock ({product.stock})
            </span>
          )}


          {/* ADD TO CART — only shown to guests and customers, hidden for vendor/admin */}
          {canAddToCart && product.stock > 0 && (

            <div className="pt-3">

              {/* Guest (not logged in) OR customer who hasn't added yet */}
              {!isAdded ? (
                <button
                  onClick={handleAddToCart}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition"
                >
                  Add to Cart
                </button>

              ) : (
                /* Customer who already added — show qty controls */
                <div className="flex items-center border border-borderDefault rounded-lg overflow-hidden w-fit">
                  <button
                    onClick={() => updateQuantity(quantity - 1)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <span className="px-4">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(quantity + 1)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              )}

            </div>

          )}


          {/* NUTRITION STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

            <div className="rounded-xl p-4 text-center" style={{ background: "var(--color-stat-1-bg)" }}>
              <p className="text-sm text-textMuted">Calories</p>
              <p className="text-xl font-bold text-textStrong">{product.calories}</p>
            </div>

            <div className="rounded-xl p-4 text-center" style={{ background: "var(--color-stat-2-bg)" }}>
              <p className="text-sm text-textMuted">Protein</p>
              <p className="text-xl font-bold text-textStrong">{product.protein} g</p>
            </div>

            <div className="rounded-xl p-4 text-center" style={{ background: "var(--color-stat-4-bg)" }}>
              <p className="text-sm text-textMuted">Fat</p>
              <p className="text-xl font-bold text-textStrong">{product.fat} g</p>
            </div>

            <div className="rounded-xl p-4 text-center" style={{ background: "var(--color-stat-3-bg)" }}>
              <p className="text-sm text-textMuted">Sugar</p>
              <p className="text-xl font-bold text-textStrong">{product.sugar} g</p>
            </div>

          </div>
{/* INGREDIENT IMAGES */}

{ingredientImages.length > 0 && (

  <div className="mt-5">

    <h3 className="text-sm font-semibold mb-2 text-textMuted">
     Ingredients Overview
    </h3>

    <div className="flex gap-2 overflow-x-auto">

      {ingredientImages.map((img, index) => (

        <div
          key={index}
          className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:scale-110 transition"
          onClick={() => setSelectedImage(img.trim())}
        >
          <img
            src={img.trim()}
            alt="ingredient"
            className="w-full h-full object-cover"
          />
        </div>

      ))}

    </div>
{/* INGREDIENT LIST (COMPACT) */}

{ingredientList.length > 0 && (

  <div className="mt-4">

    <h3 className="text-sm font-semibold mb-2 text-textMuted">
      Key Ingredients
    </h3>

    <div className="flex flex-wrap gap-2">

      {ingredientList.map((item, index) => (
        <span
          key={index}
          className="px-3 py-1 text-xs sm:text-sm bg-gray-100 border border-gray-200 rounded-full text-textStrong"
        >
          {item}
        </span>
      ))}

    </div>

  </div>

)}
  </div>

)}
      </div>
        </div>
       {/* DESCRIPTION */}

<div className="bg-bgSurface border border-borderDefault rounded-xl p-4 sm:p-5 shadow-card w-full">
  <h2 className="text-base sm:text-lg font-semibold text-black mb-2">
    Description
  </h2>
  <p className="text-sm sm:text-base text-textStrong leading-relaxed">
    {product.description}
  </p>
</div>

        
{/* HOW TO USE */}

{product.how_to_use && (
  <div className="bg-bgSurface border border-borderDefault rounded-xl p-4 sm:p-5 shadow-card">
    
    <h2 className="text-base sm:text-lg font-semibold text-black mb-2">
      How to Use
    </h2>

    <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base text-textStrong">
      {product.how_to_use.split("\n").map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>

  </div>
)}
{/* MAKING PROCESS */}

{product.making_process && (
  <div className="bg-bgSurface border border-borderDefault rounded-xl p-4 sm:p-6 shadow-card">

    <h2 className="text-base sm:text-lg font-semibold text-black mb-3">
      Making Process
    </h2>

    <ul className="list-disc pl-5 sm:pl-6 space-y-2 text-sm sm:text-base text-textStrong">
      {product.making_process.split("\n").map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>

  </div>
)}{/* BENEFITS */}

{product.benefits && product.benefits.length > 0 && (

  <div className="space-y-8">

    <h2 className="text-2xl sm:text-3xl font-bold text-center">
      Benefits
    </h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

      {product.benefits.map((benefit, index) => (

        <div
          key={index}
          className="bg-bgSurface border border-borderDefault rounded-xl shadow-card overflow-hidden hover:shadow-lg transition"
        >

          <img
            src={benefit.image}
            alt={benefit.title}
            className="w-full h-44 sm:h-52 object-cover"
          />

          <div className="p-4 sm:p-6 space-y-2">

            <h3 className="text-base sm:text-lg font-semibold text-textStrong">
              {benefit.title}
            </h3>

            <p className="text-sm text-textStrong leading-relaxed">
              {benefit.description}
            </p>

          </div>

        </div>

      ))}

    </div>

  </div>

)}
     {/* POPUP */}
      {showPopup && (
        <div className="fixed bottom-6 right-6 bg-white p-4 shadow rounded">
          <p>Item added to cart</p>
          <button onClick={() => navigate("/cart")}>View Cart</button>
        </div>
      )}

      {/* ✅ FLOATING IMAGE VIEW (FIXED) */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative bg-white p-4 rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="full"
              className="max-h-[80vh] max-w-[90vw]"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-white px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}