import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getVendorStats, getVendorOrders } from "../../services/vendorService";
import api from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { 
  Package, ShoppingBag, IndianRupee, PlusCircle, 
  Clock, CheckCircle2, Wallet, Headphones, 
  AlertCircle, ChevronRight, Store, ArrowUpRight,
  TrendingUp, Percent, Sparkles, HelpCircle, Eye
} from "lucide-react";

export default function VendorDashboard() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    earnings: 0
  });

  const [payments, setPayments] = useState({
    received: 0,
    pending: 0,
    dues: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [statsRes, ordersRes, paymentsRes] = await Promise.allSettled([
          getVendorStats(token),
          getVendorOrders(),
          api.get("/vendor/payments")
        ]);

        if (statsRes.status === "fulfilled" && statsRes.value?.data) {
          setStats(statsRes.value.data);
        }

        if (ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value?.data)) {
          setRecentOrders(ordersRes.value.data.slice(0, 5));
        }

        if (paymentsRes.status === "fulfilled" && paymentsRes.value?.data) {
          setPayments({
            received: paymentsRes.value.data.received || 0,
            pending: paymentsRes.value.data.pending || 0,
            dues: paymentsRes.value.data.dues || 0
          });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" /> Confirmed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. CLEAN TOP HEADER WITH STATUS & ACTIONS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold font-primary">
              <span className="text-primary">Vendor</span>{" "}
              <span className="text-slate-900">Dashboard</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Store Active
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            Welcome, <span className="font-semibold text-slate-800">{user?.name || "Merchant"}</span>. Here is your daily store summary, sales activity, and quick management actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/vendor/add-product"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primaryHover text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition text-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Add Product
          </Link>

          <Link
            to="/vendor/products"
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl transition text-sm"
          >
            <Package className="w-4 h-4" />
            Manage Items
          </Link>
        </div>
      </div>

      {/* 2. STATS KPI CARDS (Solid White, Clean Border, Rich Content) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div 
          onClick={() => navigate("/vendor/payments")}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-emerald-400 hover:shadow-sm cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
              {loading ? "..." : `₹${Number(stats.earnings || 0).toLocaleString()}`}
            </div>
            <div className="mt-1 flex items-center text-xs text-emerald-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>Direct merchant earnings</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div 
          onClick={() => navigate("/vendor/orders")}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-blue-400 hover:shadow-sm cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
              {loading ? "..." : stats.orders}
            </div>
            <div className="mt-1 flex items-center text-xs text-blue-600 font-medium">
              <Clock className="w-3.5 h-3.5 mr-1" />
              <span>Customer purchases</span>
            </div>
          </div>
        </div>

        {/* Active Products */}
        <div 
          onClick={() => navigate("/vendor/products")}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-purple-400 hover:shadow-sm cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Products
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
              {loading ? "..." : stats.products}
            </div>
            <div className="mt-1 flex items-center text-xs text-purple-600 font-medium">
              <Percent className="w-3.5 h-3.5 mr-1" />
              <span>With discount support</span>
            </div>
          </div>
        </div>

        {/* Pending Settlements */}
        <div 
          onClick={() => navigate("/vendor/payments")}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:border-amber-400 hover:shadow-sm cursor-pointer transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Payouts
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
              {loading ? "..." : `₹${Number(payments.pending || 0).toLocaleString()}`}
            </div>
            <div className="mt-1 flex items-center text-xs text-amber-600 font-medium">
              <Clock className="w-3.5 h-3.5 mr-1" />
              <span>Next settlement cycle</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MANAGEMENT TOOLS / QUICK NAVIGATION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Products Card */}
        <Link
          to="/vendor/products"
          className="bg-white border border-slate-200/90 hover:border-emerald-500 rounded-2xl p-5 shadow-xs hover:shadow-sm transition group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition flex items-center justify-between">
                <span>Product Catalog</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Add items, update pricing, stock, and set promotional discount percentages.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>Manage Products</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>

        {/* Orders Card */}
        <Link
          to="/vendor/orders"
          className="bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl p-5 shadow-xs hover:shadow-sm transition group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition flex items-center justify-between">
                <span>Orders & Dispatch</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                View real-time customer purchases, check delivery addresses, and verify OTPs.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
            <span>Fulfill Orders</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>

        {/* Payments Card */}
        <Link
          to="/vendor/payments"
          className="bg-white border border-slate-200/90 hover:border-purple-500 rounded-2xl p-5 shadow-xs hover:shadow-sm transition group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base group-hover:text-purple-700 transition flex items-center justify-between">
                <span>Payouts & Finances</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Check settlement history, online earnings, and 100% payout statements.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
            <span>View Statements</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>

        {/* Support Card */}
        <Link
          to="/contact"
          className="bg-white border border-slate-200/90 hover:border-amber-500 rounded-2xl p-5 shadow-xs hover:shadow-sm transition group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base group-hover:text-amber-700 transition flex items-center justify-between">
                <span>Merchant Help</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Contact the TrackMart vendor desk for assistance, listings, and queries.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700">
            <span>Contact Support</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </div>
        </Link>
      </div>

      {/* 4. ACTIVITY & HELPFUL INSIGHTS 2-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-primary">
                Recent Orders
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Incoming orders requiring fulfillment and dispatch
              </p>
            </div>
            <Link
              to="/vendor/orders"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              View all orders <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mb-2" />
              <div>Loading recent orders...</div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="py-10 text-center rounded-xl bg-slate-50/70 border border-slate-100 p-6 space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No orders yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Customer purchases will appear here in real-time as soon as orders are placed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold text-slate-500 border-b border-slate-100 pb-2">
                    <th className="pb-3 px-2">Product</th>
                    <th className="pb-3 px-2">Order ID</th>
                    <th className="pb-3 px-2">Qty</th>
                    <th className="pb-3 px-2">Earning</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order, idx) => (
                    <tr key={order.item_id || order.order_id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-2 font-medium text-slate-900 max-w-[200px] truncate">
                        {order.product_title || "Product Item"}
                      </td>
                      <td className="py-3.5 px-2 text-slate-500 text-xs">
                        #{String(order.order_id || "").slice(0, 8)}
                      </td>
                      <td className="py-3.5 px-2 text-slate-700 font-medium">
                        {order.quantity || 1}
                      </td>
                      <td className="py-3.5 px-2 font-bold text-slate-900">
                        ₹{order.vendor_earning || 0}
                      </td>
                      <td className="py-3.5 px-2">
                        {getStatusBadge(order.item_status)}
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <Link
                          to={`/vendor/orders/${order.order_id}`}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Practical Vendor Tips & Operations (1 col) */}
        <div className="space-y-4">
          {/* Tip 1: Discounts Booster */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Percent className="w-4 h-4 text-primary" />
              <span>Drive Sales With Discounts</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Adding an optional <strong>Discount %</strong> when adding or editing products highlights them with a red discount badge and strikethrough price on the storefront.
            </p>
            <Link
              to="/vendor/products"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              Update product discounts <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tip 2: Fulfillment Checklist */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Fulfillment Best Practices</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Confirm pending orders promptly to notify delivery partners.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Verify OTP during customer handover to mark items delivered.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Keep stock numbers updated to avoid out-of-stock cancellations.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}