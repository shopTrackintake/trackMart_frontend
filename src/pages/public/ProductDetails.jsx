import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import { updateCartItem, getCart } from "../../services/cartService";
import { ArrowLeft } from "lucide-react";

export default function ProductDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {

    const fetchData = async () => {
      try {

        const productRes = await getProducts();
        const found = productRes.data.find(p => p.id === id);
        setProduct(found);

        const token = localStorage.getItem("token");

        if(token){

          const cartRes = await getCart();

          const cartItem = cartRes.data.find(
            item => (item.product_id?.id || item.product_id) === id
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

  }, [id]);


  /* ================= ADD TO CART ================= */

  const handleAddToCart = async () => {

    const token = localStorage.getItem("token");

    if(!token){
      navigate("/register");
      return;
    }

    try {

      await updateCartItem(product.id, 1);

      setIsAdded(true);
      setQuantity(1);
      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
      }, 3000);

    } catch (err) {
      console.log(err);
    }

  };


  /* ================= UPDATE QUANTITY ================= */

  const updateQuantity = async (newQty) => {

    if (newQty < 1) return;

    const token = localStorage.getItem("token");

    if(!token){
      navigate("/register");
      return;
    }

    try {

      setQuantity(newQty);

      await updateCartItem(product.id, newQty);

    } catch (err) {
      console.log(err);
    }

  };


  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!product) return <p className="text-center mt-10">Product not found</p>;

return (
  <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">

    {/* BACK ARROW */}
    <button
      onClick={() => navigate(-1)}
      className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition"
    >
      <ArrowLeft className="w-6 h-6 text-gray-700" />
    </button>


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


      {/* RIGHT SIDE */}
      <div className="space-y-5">

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-primary font-bold text-primary">
          {product.title}
        </h1>

        <div className="text-2xl sm:text-3xl font-semibold text-green-600">
          ₹{product.price}
        </div>

        <div className="text-sm sm:text-base text-textMuted">
          Weight: <span className="font-semibold text-textStrong">{product.size}</span>
        </div>

        {product.stock === 0 ? (
          <span className="inline-block bg-red-100 text-dangerText px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
            Out of Stock
          </span>
        ) : (
          <span className="inline-block bg-green-100 text-successText px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
            In Stock ({product.stock})
          </span>
        )}


        {/* ADD TO CART */}

        {product.stock > 0 && (

          <div className="pt-3">

            {!isAdded ? (

              <button
                onClick={handleAddToCart}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition"
              >
                Add to Cart
              </button>

            ) : (

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


{/* NUTRITION */}

<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

  <div className="rounded-xl p-4 text-center"
       style={{background:"var(--color-stat-1-bg)"}}>
    <p className="text-sm text-textMuted">Calories</p>
    <p className="text-xl font-bold text-textStrong">{product.calories}</p>
  </div>

  <div className="rounded-xl p-4 text-center"
       style={{background:"var(--color-stat-2-bg)"}}>
    <p className="text-sm text-textMuted">Protein</p>
    <p className="text-xl font-bold text-textStrong">{product.protein} g</p>
  </div>

  <div className="rounded-xl p-4 text-center"
       style={{background:"var(--color-stat-4-bg)"}}>
    <p className="text-sm text-textMuted">Fat</p>
    <p className="text-xl font-bold text-textStrong">{product.fat} g</p>
  </div>

  <div className="rounded-xl p-4 text-center"
       style={{background:"var(--color-stat-3-bg)"}}>
    <p className="text-sm text-textMuted">Sugar</p>
    <p className="text-xl font-bold text-textStrong">{product.sugar} g</p>
  </div>

</div>


        {/* DESCRIPTION */}

        <div className="bg-bgSurface border border-borderDefault rounded-xl p-4 sm:p-5 shadow-card">

          <h2 className="text-base sm:text-lg font-semibold text-black mb-2">
            Description
          </h2>

          <p className="text-sm sm:text-base text-textStrong leading-relaxed">
            {product.description}
          </p>

        </div>

      </div>
    </div>


{/* VIEW CART POPUP */}

{showPopup && (

<div className="fixed bottom-6 right-6 bg-white border border-borderDefault shadow-lg rounded-xl p-4 flex items-center gap-4 z-50">

  <p className="text-sm font-medium">
    Item added to cart
  </p>

  <button
    onClick={() => navigate("/cart")}
    className="bg-primary text-white px-4 py-1 rounded"
  >
    View Cart
  </button>

  <button
    onClick={() => setShowPopup(false)}
    className="text-gray-500"
  >
    ✕
  </button>

</div>

)}

  </div>
);
}