import { useEffect, useState } from "react";
import { getCart, updateCartItem } from "../../services/cartService";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await getCart();
      const validItems = res.data.filter(item => item.quantity > 0);
      setItems(validItems);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

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

  const removeItem = async (item) => {
    await updateCartItem(item.id, -item.quantity);
    setItems(prev => prev.filter(p => p.id !== item.id));
  };

  const getItemPrice = (item) => {
    const disc = Number(item.discount_percent) || 0;
    return disc > 0
      ? Math.round(Number(item.price) * (1 - disc / 100))
      : Number(item.price);
  };

  const total = items.reduce(
    (acc, item) => acc + (getItemPrice(item) * item.quantity),
    0
  );

  return (
    <div className="space-y-8 md:space-y-10">

      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold text-textStrong">
        Your Cart
      </h1>

      {/* EMPTY */}
      {items.length === 0 && (
        <div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-6 md:p-8 text-center text-textMuted">
          Your cart is empty.
        </div>
      )}

      {/* ITEMS */}
      {items.length > 0 && (
        <div className="space-y-4 md:space-y-6">

          {items.map((item) => {
            const unitPrice = getItemPrice(item);
            const itemTotal = unitPrice * item.quantity;
            const hasDiscount = Number(item.discount_percent) > 0;

            return (
              <div
                key={item.id}
                className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-4 md:p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4"
              >

                {/* LEFT */}
                <div className="space-y-2">

                  <h3 className="font-semibold text-base md:text-lg text-textStrong">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-textMuted">
                    <span>₹{unitPrice} each</span>
                    {hasDiscount && (
                      <>
                        <span className="line-through text-xs text-gray-400">₹{item.price}</span>
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.discount_percent}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* CONTROLS */}
                  <div className="flex flex-wrap items-center gap-3 mt-3">

                    <button
                      onClick={() => decreaseQty(item)}
                      className="w-8 h-8 flex items-center justify-center border rounded-lg font-bold hover:bg-gray-100"
                    >
                      -
                    </button>

                    <span className="font-semibold text-base md:text-lg">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increaseQty(item)}
                      className="w-8 h-8 flex items-center justify-center border rounded-lg font-bold hover:bg-gray-100"
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeItem(item)}
                      className="text-red-500 text-sm font-semibold ml-2 hover:underline"
                    >
                      Remove
                    </button>

                  </div>

                </div>

                {/* RIGHT TOTAL */}
                <div className="text-lg md:text-xl font-bold text-primary md:text-right">
                  ₹{itemTotal}
                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* TOTAL */}
      {items.length > 0 && total > 0 && (

        <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-4 md:p-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">

          <div>
            <p className="text-textMuted text-sm">
              Total Amount
            </p>
            <p className="text-2xl md:text-3xl font-bold text-textStrong">
              ₹{total}
            </p>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full md:w-auto h-12 px-6 md:px-8 flex items-center justify-center bg-primary text-white rounded-xl font-semibold hover:bg-primaryHover transition"
          >
            Proceed to Checkout
          </button>

        </div>

      )}

    </div>
  );
}