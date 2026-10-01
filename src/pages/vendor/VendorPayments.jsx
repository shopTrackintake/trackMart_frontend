import { useEffect, useState } from "react";
import api from "../../services/api";
import { 
  IndianRupee, Wallet, CheckCircle2, Clock, 
  Building2, Phone, MapPin, Hash, ArrowUpRight
} from "lucide-react";

export default function VendorPayments() {
  const [data, setData] = useState({
    received: 0,
    pending: 0,
    history: []
  });

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const [payRes, userRes] = await Promise.allSettled([
          api.get("/vendor/payments"),
          api.get("/user/profile")
        ]);

        if (payRes.status === "fulfilled" && payRes.value?.data) {
          setData(payRes.value.data);
        }

        if (userRes.status === "fulfilled" && userRes.value?.data) {
          setVendor(userRes.value.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-bold font-primary">
          <span className="text-primary">Payouts</span>{" "}
          <span className="text-slate-900">& Finances</span>
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Track received merchant earnings and pending weekly payout settlement cycles.
        </p>
      </div>

      {/* 2. STATS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Received */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Settled / Received Earnings
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
            {loading ? "..." : `₹${Number(data.received || 0).toLocaleString()}`}
          </div>
          <div className="mt-1.5 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span>Successfully deposited to registered bank/UPI</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Settlement
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
            {loading ? "..." : `₹${Number(data.pending || 0).toLocaleString()}`}
          </div>
          <div className="mt-1.5 text-xs text-amber-600 font-medium">
            <span>Scheduled for automated payout transfer</span>
          </div>
        </div>
      </div>

      {/* 3. SETTLEMENT BANKING / UPI DETAILS */}
      {vendor && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-primary">
            Payout Settlement Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium">Business Name</span>
              <p className="font-bold text-slate-800 text-sm truncate">{vendor.business_name || "Merchant Store"}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium">Settlement UPI ID</span>
              <p className="font-bold text-slate-800 text-sm truncate">{vendor.upi_id || "Not configured"}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium">Registered Phone</span>
              <p className="font-bold text-slate-800 text-sm truncate">{vendor.phone || "Not set"}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 font-medium">Shop Location</span>
              <p className="font-bold text-slate-800 text-sm truncate">{vendor.shop_address || "Not set"}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. TRANSACTION / PAYOUT HISTORY */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-primary">
            Payout History
          </h2>
          <span className="text-xs text-slate-500">
            {data.history?.length || 0} transactions
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Loading payout statements...
          </div>
        ) : !data.history || data.history.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-sm">
            No payout transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold text-slate-500 border-b border-slate-100 pb-2">
                  <th className="pb-3 px-2">Product Item</th>
                  <th className="pb-3 px-2">Date</th>
                  <th className="pb-3 px-2">Amount</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Reference ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.history.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-2 font-medium text-slate-900 max-w-[200px] truncate">
                      {p.product_title || "Product Item"}
                    </td>
                    <td className="py-3 px-2 text-slate-500 text-xs">
                      {p.created_at ? new Date(p.created_at).toLocaleDateString() : "Recent"}
                    </td>
                    <td className="py-3 px-2 font-bold text-slate-900">
                      ₹{p.vendor_earning || 0}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        p.payout_status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {p.payout_status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-xs text-slate-400 font-mono">
                      {p.payout_reference || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
