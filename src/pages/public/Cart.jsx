import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useCart, getItemEffectivePrice } from "../../context/CartContext";
import { 
  Trash2, Plus, Minus, ArrowLeft, ShoppingBag, 
  ShieldCheck, Truck, Sparkles, CheckCircle2, Lock, 
  Store, Tag, ArrowRight, AlertCircle
} from "lucide-react";

export default function Cart() {
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const { 
    cartItems, 
    cartCount, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    subtotal, 
    originalSubtotal, 
    discountSavings, 
    estimatedDelivery, 
    grandTotal 
  } = useCart();

  const handleCheckout = () => {
    if (role === "customer") {
      navigate("/checkout");
    } else {
      navigate("/login", { state: { from: "/checkout" } });
    }
  };

  const deliveryThreshold = 499;
  const isFreeDeliveryUnlocked = subtotal >= deliveryThreshold;
  const amountNeededForFreeDelivery = Math.max(0, deliveryThreshold - subtotal);
  const deliveryProgressPercent = Math.min(100, Math.round((subtotal / deliveryThreshold) * 100));

  if (loading) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-semibold text-textDefault">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-fadeIn">

      {/* 1. BREADCRUMBS & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-borderDefault">
        <div>
          <nav className="flex items-center gap-2 text-xs text-textMuted mb-2">
            <Link to="/" className="hover:text-primary transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>
            <span>/</span>
            <span className="text-textStrong font-semibold">Shopping Cart</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-textStrong tracking-tight">
              Shopping Cart
            </h1>
            {cartCount > 0 && (
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="self-start sm:self-auto text-xs text-textMuted hover:text-dangerText font-semibold flex items-center gap-1.5 transition py-1 px-2.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Cart</span>
          </button>
        )}
      </div>

      {/* 2. EMPTY STATE */}
      {cartItems.length === 0 ? (
        <div className="bg-white border border-borderDefault rounded-3xl p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-card space-y-6">
          <div className="w-20 h-20 rounded-full bg-orange-50 border border-orange-200/60 flex items-center justify-center mx-auto text-primary">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-textStrong">Your Cart is Empty</h2>
            <p className="text-xs sm:text-sm text-textMuted max-w-md mx-auto leading-relaxed">
              Explore our curated selection of verified nutrient-rich foods, fresh organic groceries, and guilt-free healthy essentials.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="btn-primary text-xs sm:text-sm font-bold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <span>Explore Healthy Groceries</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* 3. ACTIVE CART: TWO COLUMN GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: ITEMS LIST & PROGRESS (7 cols or 8 cols) */}
          <div className="lg:col-span-8 space-y-5">

            {/* FREE DELIVERY PROGRESS BANNER */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition ${
              isFreeDeliveryUnlocked
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                : "bg-orange-50/60 border-orange-200 text-orange-900"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isFreeDeliveryUnlocked ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-primary"
                }`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  {isFreeDeliveryUnlocked ? (
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-emerald-800">
                        🎉 Free Express Delivery Unlocked!
                      </p>
                      <span className="text-[11px] bg-emerald-200/80 text-emerald-800 px-2 py-0.2 rounded-full font-bold">
                        Applied
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        Add <strong className="text-primary font-extrabold">₹{amountNeededForFreeDelivery}</strong> more to unlock <span className="underline decoration-primary">Free Express Delivery</span>!
                      </p>
                      {/* PROGRESS BAR */}
                      <div className="w-full bg-slate-200/70 h-2 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${deliveryProgressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ITEMS LIST */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const effectivePrice = getItemEffectivePrice(item);
                const originalPrice = Number(item.price) || 0;
                const discount = Number(item.discount_percent) || 0;
                const itemTotal = effectivePrice * (Number(item.quantity) || 1);
                const productId = item.id || item.product_id;

                return (
                  <div
                    key={productId}
                    className="bg-white border border-borderDefault rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-card hover:shadow-cardHover transition duration-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative"
                  >
                    {/* PRODUCT THUMBNAIL */}
                    <Link
                      to={`/product/${productId}`}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-bgApp border border-borderDefault overflow-hidden shrink-0 flex items-center justify-center p-2 group"
                    >
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-textMuted/40" />
                      )}
                    </Link>

                    {/* PRODUCT DETAILS */}
                    <div className="flex-1 min-w-0 space-y-1.5 w-full sm:w-auto">
                      {/* BADGES */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {discount > 0 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-100 text-red-700">
                            {discount}% OFF
                          </span>
                        )}
                        {item.health_rating && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {item.health_rating}
                          </span>
                        )}
                        {item.size && (
                          <span className="text-[11px] text-textMuted">
                            • Net: {item.size}
                          </span>
                        )}
                      </div>

                      {/* TITLE */}
                      <Link
                        to={`/product/${productId}`}
                        className="block text-sm sm:text-base font-bold text-textStrong hover:text-primary transition line-clamp-2 leading-snug"
                      >
                        {item.title}
                      </Link>

                      {/* VENDOR ATTRIBUTION */}
                      {item.business_name && (
                        <div className="flex items-center gap-1.5 text-[11px] text-textMuted">
                          <Store className="w-3 h-3 text-primary" />
                          <span>Sold by:</span>
                          <span className="font-semibold text-textDefault">{item.business_name}</span>
                        </div>
                      )}

                      {/* UNIT PRICING */}
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-base sm:text-lg font-black text-primary font-mono">
                          ₹{effectivePrice}
                        </span>
                        {discount > 0 && (
                          <span className="text-xs text-textMuted line-through font-semibold">
                            ₹{originalPrice}
                          </span>
                        )}
                        <span className="text-[11px] text-textMuted">each</span>
                      </div>
                    </div>

                    {/* QUANTITY CONTROLS & SUB-TOTAL (RIGHT / BOTTOM) */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-borderDefault">
                      {/* LINE ITEM TOTAL */}
                      <div className="text-left sm:text-right">
                        <span className="text-xs text-textMuted block sm:hidden">Total:</span>
                        <span className="text-base sm:text-xl font-black text-textStrong font-mono">
                          ₹{itemTotal}
                        </span>
                      </div>

                      {/* QUANTITY PICKER & REMOVE BUTTON */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-borderDefault rounded-xl overflow-hidden bg-bgApp shadow-xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(productId, (Number(item.quantity) || 1) - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-100 text-textStrong transition active:scale-95 text-xs font-bold"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center font-bold text-xs sm:text-sm text-textStrong">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(productId, (Number(item.quantity) || 1) + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-100 text-textStrong transition active:scale-95 text-xs font-bold"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(productId)}
                          className="p-2 text-textMuted hover:text-dangerText rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 transition active:scale-95"
                          title="Remove item from cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CONTINUE SHOPPING LINK */}
            <div className="pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Add more farm-fresh items to your cart</span>
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: STICKY ORDER SUMMARY (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-borderDefault rounded-3xl p-6 sm:p-7 shadow-card space-y-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-borderDefault">
                <h2 className="text-base sm:text-lg font-bold text-textStrong tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-primary" />
                  <span>Order Summary</span>
                </h2>
                <span className="text-xs text-textMuted font-semibold">
                  {cartCount} {cartCount === 1 ? "Item" : "Items"}
                </span>
              </div>

              {/* COST BREAKDOWN */}
              <div className="space-y-3 text-xs sm:text-sm">
                
                {/* ITEMS ORIGINAL VALUE */}
                <div className="flex justify-between text-textMuted">
                  <span>Items Original Total</span>
                  <span className="font-mono font-semibold">₹{originalSubtotal}</span>
                </div>

                {/* PROMOTIONAL SAVINGS */}
                {discountSavings > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Promotional Discount</span>
                    </span>
                    <span className="font-mono">- ₹{discountSavings}</span>
                  </div>
                )}

                {/* ITEMS DISCOUNTED SUBTOTAL */}
                <div className="flex justify-between text-textStrong font-semibold">
                  <span>Subtotal</span>
                  <span className="font-mono">₹{subtotal}</span>
                </div>

                {/* DELIVERY CHARGE */}
                <div className="flex justify-between items-center text-textDefault">
                  <span>Express Delivery</span>
                  {estimatedDelivery === 0 ? (
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">
                      FREE
                    </span>
                  ) : (
                    <span className="font-mono font-semibold">₹{estimatedDelivery}</span>
                  )}
                </div>

                {/* TAX INCLUSION */}
                <div className="flex justify-between text-[11px] text-textMuted">
                  <span>Applicable GST / Taxes</span>
                  <span className="italic">Included in prices</span>
                </div>

              </div>

              {/* TOTAL SEPARATOR */}
              <div className="pt-4 border-t border-borderDefault space-y-2">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-bold text-textStrong block">Grand Total</span>
                    <span className="text-[11px] text-textMuted block">Final payable amount</span>
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-primary font-mono">
                    ₹{grandTotal}
                  </span>
                </div>

                {/* SAVINGS HIGHLIGHT PILL */}
                {discountSavings > 0 && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <p className="text-xs font-bold text-emerald-800">
                      🌿 Total Savings on this order: ₹{discountSavings}
                    </p>
                  </div>
                )}
              </div>

              {/* CHECKOUT ACTION BUTTON */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full btn-primary text-sm font-bold py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>{role === "customer" ? "Proceed to Checkout" : "Sign In to Checkout"}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                {!role && (
                  <p className="text-[11px] text-center text-textMuted leading-relaxed flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Your items will automatically sync to your account upon signing in.</span>
                  </p>
                )}
              </div>

              {/* TRUST & GUARANTEES */}
              <div className="pt-4 border-t border-borderDefault/80 space-y-2.5 text-xs text-textMuted">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Genuine &amp; FSSAI Audited Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary shrink-0" />
                  <span>Free Express Delivery on orders over ₹499</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>256-bit Bank Grade Encrypted Checkout</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}