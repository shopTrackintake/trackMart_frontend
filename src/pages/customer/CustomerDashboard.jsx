import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { getUserOrders } from "../../services/orderService";
import { getAddresses } from "../../services/addressService";
import { getProducts } from "../../services/productService";
import TrackingModal from "../../components/TrackingModal";
import api from "../../services/api";
import { 
  Package, ShoppingBag, Truck, ShoppingCart, 
  MapPin, Headphones, User, ArrowRight, CheckCircle2, 
  Clock, ShieldCheck, Sparkles, Plus, AlertCircle, 
  ChevronRight, ExternalLink, Store
} from "lucide-react";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user: authUser } = useContext(AuthContext);
  const { cartCount, addToCart } = useCart();
  const { toast } = useToast();

  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [primaryAddress, setPrimaryAddress] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingItemId, setTrackingItemId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [profileRes, ordersRes, addressRes, productsRes] = await Promise.allSettled([
          api.get("/user/profile"),
          getUserOrders(),
          getAddresses(),
          getProducts({ limit: 4 })
        ]);

        if (!isMounted) return;

        // Profile
        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value.data || {});
        }

        // Orders
        if (ordersRes.status === "fulfilled") {
          setOrders(Array.isArray(ordersRes.value.data) ? ordersRes.value.data : []);
        }

        // Primary Address
        if (addressRes.status === "fulfilled") {
          const addrs = addressRes.value.data;
          if (Array.isArray(addrs) && addrs.length > 0) {
            setPrimaryAddress(addrs[0]);
          }
        }

        // Recommended Products
        if (productsRes.status === "fulfilled") {
          const prodData = productsRes.value.data;
          const prods = Array.isArray(prodData) ? prodData : (prodData?.products || []);
          setRecommendedProducts(prods.slice(0, 4));
        }

      } catch (err) {
        console.error("Error loading buyer dashboard data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute active orders, delivered orders & total orders
  const totalOrders = orders.length;
  const activeOrders = orders.filter((order) => {
    const isCancelled = String(order.order_status || "").toLowerCase() === "cancelled";
    if (isCancelled) return false;
    const allDelivered =
      order.items?.length > 0 &&
      order.items.every((i) => String(i.item_status || "").toLowerCase() === "delivered");
    return !allDelivered;
  }).length;

  const deliveredOrders = orders.filter((order) => {
    const isCancelled = String(order.order_status || "").toLowerCase() === "cancelled";
    if (isCancelled) return false;
    const allDelivered =
      order.items?.length > 0 &&
      order.items.every((i) => String(i.item_status || "").toLowerCase() === "delivered");
    return allDelivered || String(order.order_status || "").toLowerCase() === "delivered";
  }).length;

  const recentOrders = orders.slice(0, 3);
  const userName = profile?.name || profile?.full_name || authUser?.name || "Shopper";

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      toast.success(`${product.title} added to your cart!`, "Cart Updated");
    } catch (err) {
      console.error(err);
      toast.error("Could not add product to cart. Please try again.");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-10">

      {/* ================= 1. PERSONALIZED WELCOME BANNER ================= */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Verified Buyer Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-primary tracking-tight">
              Welcome back, {loading ? "..." : userName}! 👋
            </h1>
            <p className="text-orange-50 text-xs sm:text-sm md:text-base max-w-xl font-medium leading-relaxed">
              Track live deliveries, review past purchases, explore verified clean groceries, and manage delivery addresses.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <Link
              to="/buy"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-orange-600 font-bold text-sm shadow hover:bg-orange-50 transition active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buy Products</span>
            </Link>

            <Link
              to="/customer/orders"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm backdrop-blur-md border border-white/20 transition active:scale-95"
            >
              <Package className="w-4 h-4" />
              <span>My Orders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= 2. KEY METRICS STATS GRID ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        
        {/* Total Orders */}
        <div 
          onClick={() => navigate("/customer/orders")}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">Total Orders</span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {loading ? "..." : totalOrders}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>All-time purchases</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </p>
          </div>
        </div>

        {/* Active Shipments */}
        <div 
          onClick={() => navigate("/customer/orders")}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">Active Shipments</span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">
              {loading ? "..." : activeOrders}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>{activeOrders > 0 ? "On the way / Placed" : "No orders in transit"}</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </p>
          </div>
        </div>

        {/* Delivered Orders */}
        <div 
          onClick={() => navigate("/customer/orders")}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">Delivered Orders</span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              {loading ? "..." : deliveredOrders}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>Completed deliveries</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </p>
          </div>
        </div>

        {/* Cart Items */}
        <div 
          onClick={() => navigate("/customer/cart")}
          className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-slate-500">Shopping Cart</span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-primary font-mono">
              {cartCount}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>Ready for checkout</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </p>
          </div>
        </div>

      </div>

      {/* ================= 3. QUICK ACCESS HUB (4 USEFUL TILES) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Tile 1: Order History */}
        <Link 
          to="/customer/orders"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-primary hover:shadow-sm transition-all group flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-primary flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-slate-800 group-hover:text-primary transition">My Orders & Tracking</h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">Review purchases, check live shipment status, and re-order.</p>
          </div>
        </Link>

        {/* Tile 2: Buy Products */}
        <Link 
          to="/buy"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-primary hover:shadow-sm transition-all group flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-slate-800 group-hover:text-primary transition">Buy Products</h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">Direct access to clean groceries, whole foods & verified pantry staples.</p>
          </div>
        </Link>

        {/* Tile 3: Addresses */}
        <Link 
          to="/profile"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-primary hover:shadow-sm transition-all group flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-slate-800 group-hover:text-primary transition">Saved Addresses</h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">Manage delivery pins, shipping addresses, and personal contact.</p>
          </div>
        </Link>

        {/* Tile 4: Support */}
        <Link 
          to="/support"
          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-primary hover:shadow-sm transition-all group flex items-start gap-3.5"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-slate-800 group-hover:text-primary transition">Help & Support</h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">24/7 resolution for order status, payments, and refund queries.</p>
          </div>
        </Link>

      </div>

      {/* ================= 4. RECENT ORDERS & PRIMARY ADDRESS SPLIT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* LEFT 2 COLS: RECENT ORDERS */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-primary">
                Recent Orders
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Overview of your recent grocery and wellness purchases
              </p>
            </div>

            {orders.length > 0 && (
              <Link
                to="/customer/orders"
                className="text-xs sm:text-sm font-bold text-primary hover:text-orange-600 flex items-center gap-1 transition"
              >
                <span>View All ({orders.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent mx-auto"></div>
              <p className="text-xs sm:text-sm font-medium">Loading your orders...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-10 px-4 text-center space-y-3 bg-slate-50/70 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">No orders placed yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Discover fresh organic vegetables, nutrition-verified grains, and pure cold-pressed oils.
                </p>
              </div>
              <Link
                to="/buy"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow hover:bg-orange-600 transition"
              >
                <span>Buy Products Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const isCancelled = String(order.order_status || "").toLowerCase() === "cancelled";
                const allDelivered =
                  !isCancelled &&
                  order.items?.length > 0 &&
                  order.items.every((i) => String(i.item_status || "").toLowerCase() === "delivered");
                const anyInTransit =
                  !isCancelled &&
                  order.items?.some((i) =>
                    ["in_transit", "confirmed", "shipped"].includes(String(i.item_status || "").toLowerCase())
                  );

                // Tracking item if available
                const trackableItem = order.items?.find((i) => i.id) || order.items?.[0];

                return (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-slate-300 bg-white transition space-y-3"
                  >
                    {/* Header: Order ID + Status Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                          Order #{order.id?.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-slate-400 text-xs ml-2">
                          • {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          isCancelled
                            ? "bg-red-100 text-red-800"
                            : allDelivered
                            ? "bg-emerald-100 text-emerald-800"
                            : anyInTransit
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isCancelled
                          ? "Cancelled"
                          : allDelivered
                          ? "Delivered"
                          : anyInTransit
                          ? "In Transit"
                          : "Order Placed"}
                      </span>
                    </div>

                    {/* Items List Preview */}
                    <div className="space-y-1.5 py-1">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                          <span className="font-medium truncate max-w-[200px] sm:max-w-xs">
                            {item.product_title || item.title || "Product"}
                          </span>
                          <span className="text-slate-500 font-mono">
                            Qty: {item.quantity} • ₹{item.price_at_purchase || item.price || "--"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer: Amount & Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs text-slate-400">Total Paid: </span>
                        <span className="text-sm sm:text-base font-extrabold text-primary font-mono">
                          ₹{order.total_amount}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {trackableItem && !isCancelled && (
                          <button
                            onClick={() => setTrackingItemId(trackableItem.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition inline-flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Track Delivery</span>
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/customer/orders/${order.id}`)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT 1 COL: DEFAULT SHIPPING ADDRESS & ACCOUNT HEALTH */}
        <div className="space-y-6">
          
          {/* Default Address Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900 font-primary">
                  Primary Delivery Address
                </h3>
              </div>
              <Link
                to="/profile"
                className="text-xs font-bold text-primary hover:underline"
              >
                Manage
              </Link>
            </div>

            {primaryAddress ? (
              <div className="space-y-2 text-xs sm:text-sm text-slate-600 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                <p className="font-bold text-slate-900">
                  {primaryAddress.full_name || userName}
                </p>
                <p className="text-slate-500">
                  {primaryAddress.house_no} {primaryAddress.street}, {primaryAddress.locality}
                </p>
                <p className="text-slate-500">
                  {primaryAddress.city}, {primaryAddress.state} - <strong className="text-slate-800">{primaryAddress.pincode}</strong>
                </p>
                {primaryAddress.phone && (
                  <p className="text-slate-500 pt-1 font-mono text-xs">
                    📞 {primaryAddress.phone}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 px-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <p className="text-xs text-slate-500">No default shipping address saved yet.</p>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Delivery Address</span>
                </Link>
              </div>
            )}
          </div>

          {/* Clean Quality & Buyer Trust Badge */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>TrackMart Buyer Guarantee</span>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Every grocery batch is tested against chemical benchmarks. 100% genuine products, tamper-evident packaging, and zero hassle refunds if unsatisfied.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] font-bold text-emerald-900">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Lab Verified Nutrition Standards</span>
            </div>
          </div>

        </div>

      </div>

      {/* ================= 5. RECOMMENDED ORGANIC PICKS ================= */}
      {recommendedProducts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-primary flex items-center gap-2">
                <span>Recommended Clean Groceries</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-primary px-2 py-0.5 rounded-full">
                  Fresh
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Hand-picked healthy foods and certified pantry staples for your home
              </p>
            </div>

            <Link
              to="/buy"
              className="text-xs sm:text-sm font-bold text-primary hover:text-orange-600 flex items-center gap-1 transition self-start sm:self-auto"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {recommendedProducts.map((prod) => {
              const imageSrc = prod.images?.[0] || prod.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80";

              return (
                <div
                  key={prod.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition group"
                >
                  <div className="space-y-3">
                    {/* Image with Health Badge */}
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50">
                      <img
                        src={imageSrc}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                    </div>

                    {/* Title & Category */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        {prod.category || "Grocery"}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 truncate mt-0.5" title={prod.title}>
                        {prod.title}
                      </h4>
                    </div>
                  </div>

                  {/* Price & Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-base font-extrabold text-slate-900 font-mono">
                        ₹{prod.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => navigate(`/product/${prod.id}`)}
                        className="p-2 rounded-xl text-slate-600 hover:text-primary hover:bg-orange-50 border border-slate-200 transition"
                        title="View Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleAddToCart(prod)}
                        className="px-3 py-1.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-orange-600 shadow-2xs transition active:scale-95 inline-flex items-center gap-1"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TRACKING MODAL ================= */}
      {trackingItemId && (
        <TrackingModal
          itemId={trackingItemId}
          onClose={() => setTrackingItemId(null)}
        />
      )}

    </div>
  );
}