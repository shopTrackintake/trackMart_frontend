import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { getCart, updateCartItem } from "../../services/cartService";
import { Heart } from "lucide-react";
import { getWishlist, toggleWishlist } from "../../services/wishlistService";

export default function Home() {

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCartPopup, setShowCartPopup] = useState(false);

  const navigate = useNavigate();

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts();
        setProducts(res.data);
      } catch (err) {
        console.log("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* ================= FETCH CART ================= */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await getCart();
        setCartItems(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchCart();
  }, []);

  /* ================= FETCH WISHLIST ================= */
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await getWishlist();
        setWishlistIds(res.data.map(i => String(i.product_id)));
      } catch (err) {
        console.log(err);
      }
    };

    fetchWishlist();
  }, []);

  /* ================= GET QUANTITY ================= */
  const getQuantity = (productId) => {
    const item = cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
  };

  /* ================= TOGGLE WISHLIST ================= */
  const toggleWishlistItem = async (productId) => {
    try {
      await toggleWishlist(productId);

      const res = await getWishlist();
      setWishlistIds(res.data.map(i => String(i.product_id)));

    } catch (err) {
      navigate("/login");
    }
  };

  /* ================= INCREASE ================= */
  const increaseQty = async (product) => {
    try {
      await updateCartItem(product.id, 1);

      setCartItems(prev => {
        const existing = prev.find(p => p.id === product.id);

        if (existing) {
          return prev.map(p =>
            p.id === product.id
              ? { ...p, quantity: p.quantity + 1 }
              : p
          );
        }

        return [...prev, { ...product, quantity: 1 }];
      });

      setShowCartPopup(true);

    } catch (err) {
      navigate("/login");
    }
  };

  /* ================= DECREASE ================= */
  const decreaseQty = async (product) => {
    try {
      await updateCartItem(product.id, -1);

      setCartItems(prev =>
        prev
          .map(p =>
            p.id === product.id
              ? { ...p, quantity: p.quantity - 1 }
              : p
          )
          .filter(p => p.quantity > 0)
      );

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="space-y-16">

      {/* HERO */}
      <section className="text-center py-20 bg-surface-alt rounded-2xl">
        <h1 className="text-5xl font-primary font-bold text-strong leading-tight">
          Discover Smarter
          <span className="text-primary"> Healthy Choices</span>
        </h1>

        <p className="text-muted mt-6 text-lg max-w-2xl mx-auto">
          Explore curated products with real nutrition insights.
        </p>
      </section>

      {/* PRODUCTS */}
      <section>
        <h2 className="text-2xl font-primary font-semibold text-strong mb-10">
          Featured Products
        </h2>

        {loading && (
          <div className="text-center py-10 text-gray-500 text-lg">
            Loading products...
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="bg-surface-alt border border-default rounded-2xl p-8 text-center text-muted">
            No products available
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

            {products.map(product => {

              const quantity = getQuantity(product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition"
                >

                  {/* IMAGE */}
                  {product.image_url && (
                    <div className="relative h-56 bg-gray-50 flex items-center justify-center rounded-xl mb-4">

                      <img
                        src={product.image_url}
                        alt={product.title}
                        loading="lazy"
                        className="max-h-full max-w-full object-contain"
                      />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlistItem(product.id);
                        }}
                        className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md"
                      >

                        <Heart
                          className={`w-5 h-5 transition ${
                            wishlistIds.includes(String(product.id))
                              ? "fill-red-500 text-red-500"
                              : "text-gray-400"
                          }`}
                        />

                      </button>

                    </div>
                  )}

                  {/* TITLE */}
                  <h3 className="font-primary text-lg font-semibold text-strong">
                    {product.title}
                  </h3>

                  {/* DESC */}
                  <p className="text-muted text-sm mt-2 line-clamp-2">
                    {product.description}
                  </p>

                  {/* PRICE + STOCK */}
                  <div className="mt-4 space-y-2">

                    <div className="flex justify-between items-center">
                      <span className="text-primary font-bold text-lg">
                        ₹{product.price}
                      </span>

                      {product.health_rating && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.health_rating === "Healthy"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.health_rating}
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-500">
                      Weight: {product.size}
                    </div>

                  </div>

                  {/* QTY BUTTONS */}
                  <div className="mt-6">

                    {quantity === 0 ? (
                      <button
                        onClick={() => increaseQty(product)}
                        className="bg-primary text-white w-full py-2 rounded-xl font-semibold hover:bg-primaryHover transition"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-6 border border-gray-300 rounded-xl py-2">
                        <button
                          onClick={() => decreaseQty(product)}
                          className="text-xl font-bold px-4"
                        >
                          -
                        </button>

                        <span className="font-semibold text-lg">
                          {quantity}
                        </span>

                        <button
                          onClick={() => increaseQty(product)}
                          className="text-xl font-bold px-4"
                        >
                          +
                        </button>
                      </div>
                    )}

                  </div>

                  {/* DETAILS */}
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="mt-3 border border-primary text-primary w-full py-2 rounded-xl font-semibold hover:bg-primary hover:text-white transition"
                  >
                    View Details
                  </button>

                </div>
              );

            })}

          </div>
        )}
      </section>

      {/* VIEW CART POPUP */}
      {showCartPopup && (
        <div className="fixed bottom-6 right-6 bg-white shadow-xl border rounded-xl p-4 flex items-center gap-4 z-50">

          <span className="text-sm font-medium">
            Product added to cart
          </span>

          <button
            onClick={() => navigate("/cart")}
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            View Cart
          </button>

          <button
            onClick={() => setShowCartPopup(false)}
            className="text-gray-500 text-lg"
          >
            ✕
          </button>

        </div>
      )}

    </div>
  );
}