import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

import { getProducts } from "../../services/productService";
import { getCart, updateCartItem } from "../../services/cartService";
import { getWishlist, toggleWishlist } from "../../services/wishlistService";

export default function Home() {

  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* ================= FETCH PRODUCTS (PUBLIC) ================= */

  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const res = await getProducts();
        setProducts(res.data);

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);

      }

    };

    fetchProducts();

  }, []);


  /* ================= FETCH CART + WISHLIST (ONLY IF LOGGED IN) ================= */

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) return;

    const fetchUserData = async () => {

      try {

        const [cartRes, wishlistRes] = await Promise.all([
          getCart(),
          getWishlist()
        ]);

        setCartItems(cartRes.data);
        setWishlist(wishlistRes.data.map(w => w.product_id));

      } catch (err) {

        console.log(err);

      }

    };

    fetchUserData();

  }, []);



  /* ================= GET CART QUANTITY ================= */

  const getQuantity = (productId) => {

    const item = cartItems.find(i => i.id === productId);
    return item ? item.quantity : 0;

  };


  /* ================= HEART STATUS ================= */

  const isHeartActive = (productId) => {

    const inWishlist = wishlist.includes(productId);
    const inCart = cartItems.some(item => item.id === productId);

    return inWishlist || inCart;

  };


  /* ================= ADD TO CART ================= */

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

      navigate("/login");

    }

  };


  /* ================= REMOVE FROM CART ================= */

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


  /* ================= TOGGLE WISHLIST ================= */

  const handleWishlist = async (productId) => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {

      await toggleWishlist(productId);

      setWishlist(prev =>
        prev.includes(productId)
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );

    } catch (err) {

      console.log(err);

    }

  };


  if (loading) {

    return (
      <div className="text-center py-20 text-lg font-medium">
        Loading products...
      </div>
    );

  }


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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">

          {products.map(product => {

            const quantity = getQuantity(product.id);

            return (

              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 flex flex-col h-full hover:shadow-lg transition"
              >

                {/* IMAGE */}

                {product.image_url && (

                  <div className="relative h-56 bg-gray-50 flex items-center justify-center rounded-xl mb-4">

                    <img
                      src={product.image_url}
                      loading="lazy"
                      alt={product.title}
                      className="max-h-full max-w-full object-contain"
                    />

                    <button
                      onClick={() => handleWishlist(product.id)}
                      className="absolute top-3 right-3 bg-white p-2 rounded-full shadow"
                    >

                      <Heart
                        size={20}
                        className={
                          isHeartActive(product.id)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-400"
                        }
                      />

                    </button>

                  </div>

                )}



                {/* CONTENT */}

                <div className="flex-grow">

                  <h3 className="font-primary text-lg font-semibold text-strong">
                    {product.title}
                  </h3>

                  <p className="text-muted text-sm mt-2 line-clamp-2 min-h-[40px]">
                    {product.description}
                  </p>

                  <div className="mt-4 space-y-2">

                    <span className="text-primary font-bold text-lg">
                      ₹{product.price}
                    </span>

                  </div>

                </div>



                {/* CART BUTTONS */}

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
