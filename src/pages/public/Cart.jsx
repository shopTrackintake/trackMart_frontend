import { useEffect, useState } from "react";
import { getCart, updateCartItem } from "../../services/cartService";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  /* ================= FETCH CART ================= */
  const fetchCart = async () => {
    try {
      const res = await getCart();
      
      // Only keep items with quantity > 0
      const validItems = res.data.filter(item => item.quantity > 0);
      setItems(validItems);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* ================= INCREASE ================= */
  const increaseQty = async (item) => {
    await updateCartItem(item.id, 1);

    setItems(prev =>
      prev.map(p =>
        p.id === item.id
          ? { ...p, quantity: p.quantity + 1 }
          : p
      )
    );
  };

  /* ================= DECREASE ================= */
  const decreaseQty = async (item) => {
    await updateCartItem(item.id, -1);

    setItems(prev =>
      prev
        .map(p =>
          p.id === item.id
            ? { ...p, quantity: p.quantity - 1 }
            : p
        )
        .filter(p => p.quantity > 0)
    );
  };

  /* ================= REMOVE COMPLETELY ================= */
  const removeItem = async (item) => {
    await updateCartItem(item.id, -item.quantity);

    setItems(prev =>
      prev.filter(p => p.id !== item.id)
    );
  };

  /* ================= TOTAL WITH DELIVERY ================= */
  const total = items.reduce(
    (acc, item) =>
      acc +
      (Number(item.price) * item.quantity) +
      Number(item.delivery_charge || 0),
    0
  );

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-textStrong">
          Your Cart
        </h1>
      </div>

      {/* EMPTY STATE */}
      {items.length === 0 && (
        <div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-8 text-center text-textMuted">
          Your cart is empty.
        </div>
      )}

      {/* CART ITEMS */}
      {items.length > 0 && (
        <div className="space-y-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-6 flex justify-between items-center"
            >

              <div>
                <h3 className="font-semibold text-lg text-textStrong">
                  {item.title}
                </h3>

                <p className="text-sm text-textMuted mt-1">
                  ₹{item.price} each
                </p>

                <div className="flex items-center gap-4 mt-4">

                  <button
                    onClick={() => decreaseQty(item)}
                    className="px-3 py-1 border rounded-lg font-bold"
                  >
                    -
                  </button>

                  <span className="font-semibold text-lg">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => increaseQty(item)}
                    className="px-3 py-1 border rounded-lg font-bold"
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeItem(item)}
                    className="ml-6 text-red-500 text-sm font-semibold"
                  >
                    Remove
                  </button>

                </div>
              </div>

              {/* ITEM TOTAL WITH DELIVERY */}
              <div className="text-xl font-bold text-primary">
                ₹{
                  (Number(item.price) * item.quantity) +
                  Number(item.delivery_charge || 0)
                }
              </div>

            </div>
          ))}
        </div>
      )}

      {/* TOTAL + CHECKOUT */}
      {items.length > 0 && total > 0 && (
        <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-8 flex justify-between items-center">

          <div>
            <p className="text-textMuted text-sm">
              Total Amount
            </p>
            <p className="text-3xl font-bold text-textStrong">
              ₹{total}
            </p>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primaryHover transition"
          >
            Proceed to Checkout
          </button>

        </div>
      )}

    </div>
  );
}