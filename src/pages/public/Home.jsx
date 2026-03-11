import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { getCart, updateCartItem } from "../../services/cartService";

export default function Home() {

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts();
        setProducts(res.data);
      } catch (err) {
        console.log("Fetch error:", err);
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

  /* ================= GET QUANTITY ================= */
  const getQuantity = (productId) => {
    const item = cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;
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

    } catch (err) {
  navigate("/login"); // या "/login"
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

        {products.length === 0 && (
          <div className="bg-surface-alt border border-default rounded-2xl p-8 text-center text-muted">
            No products available
          </div>
        )}

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
                  <div className="h-56 bg-gray-50 flex items-center justify-center rounded-xl mb-4">
                    <img
  src={product.image_url}
  alt={product.title}
  className="max-h-full max-w-full object-contain"
/>
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
                    Available: {product.stock} gm
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
      </section>

    </div>
  );
}
