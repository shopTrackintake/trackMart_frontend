import { useEffect, useState } from "react";
import api from "../../services/api";
import { 
  IndianRupee, TrendingUp, ShoppingBag, 
  CheckCircle2, Clock, Calendar, ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";

export default function VendorEarnings() {
  const [earnings, setEarnings] = useState({
    total: 0,
    orders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const res = await api.get("/vendor/earnings");
        setEarnings({
          total: Number(res.data.total || 0),
          orders: Array.isArray(res.data.orders) ? res.data.orders : []
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const totalItemsSold = earnings.orders.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0);
  const avgEarningPerOrder = earnings.orders.length > 0 
    ? Math.round(earnings.total / earnings.orders.length) 
    : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-primary">
            Store Earnings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Complete record of your product earnings, itemized breakdowns, and sales volume.
          </p>
        </div>

        <Link
          to="/vendor/payments"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-xs shrink-0"
        >
          <span>View Payout Statements</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Earnings */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Earnings
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
            {loading ? "..." : `₹${earnings.total.toLocaleString()}`}
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>Accumulated earnings</span>
          </div>
        </div>

        {/* Total Items Sold */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Items Sold
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
            {loading ? "..." : totalItemsSold}
          </div>
          <div className="mt-1 text-xs text-blue-600 font-medium">
            <span>Total units fulfilled</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Earning / Order
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
            {loading ? "..." : `₹${avgEarningPerOrder.toLocaleString()}`}
          </div>
          <div className="mt-1 text-xs text-purple-600 font-medium">
            <span>Average revenue per order</span>
          </div>
        </div>
      </div>

      {/* 3. ITEM-BY-ITEM EARNINGS LIST */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 font-primary">
            Earnings Ledger
          </h2>
          <span className="text-xs text-slate-500">
            {earnings.orders.length} transactions
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Loading earnings ledger...
          </div>
        ) : earnings.orders.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-sm">
            No sales or earnings recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {earnings.orders.map((order, i) => (
              <div
                key={order.id || i}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 -mx-2 px-2 rounded-xl transition"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900 text-sm sm:text-base">
                    {order.product_title || "Product Purchase"}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Qty: <strong className="text-slate-700">{order.quantity || 1}</strong></span>
                    {order.created_at && (
                      <>
                        <span>•</span>
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="sm:text-right">
                    <span className="text-xs text-slate-400 block">Earning</span>
                    <span className="text-base sm:text-lg font-extrabold text-emerald-600">
                      ₹{order.vendor_earning || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}