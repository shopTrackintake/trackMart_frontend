import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { CreditCard, DollarSign, Send, Store, Phone, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminVendorPayments() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [reference, setReference] = useState("");
  const [clearing, setClearing] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/vendor-earnings");
      setVendors(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClearPayment = async () => {
    if (!selectedVendor) return;
    try {
      setClearing(true);
      const ref = reference || `PAY-${Date.now()}`;
      const res = await api.post(`/admin/vendor-payout/${selectedVendor.vendor_id}`, { reference: ref });
      alert(res.data.message || "Payout cleared successfully!");
      setSelectedVendor(null);
      setReference("");
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to clear payout");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-2 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-primary font-bold text-slate-900">
          Vendor Payouts & Settlement Hub
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Review pending vendor earnings, bank details, UPI IDs, and disburse weekly payouts.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-medium">
          Loading vendor payouts...
        </div>
      ) : vendors.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 shadow-2xs">
          No pending vendor payouts found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendors.map((v) => {
            const amount = Number(v.total_earning || 0);

            return (
              <div
                key={v.vendor_id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 
                      onClick={() => navigate(`/admin/vendors/${v.vendor_id}`)}
                      className="font-bold text-lg text-slate-900 hover:text-primary transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Store className="w-5 h-5 text-primary shrink-0" />
                      {v.business_name}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Owner: <strong className="text-slate-700">{v.owner_name || "N/A"}</strong>
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    amount > 0 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}>
                    {amount > 0 ? "Pending Settlement" : "Settled"}
                  </span>
                </div>

                {/* Amount */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold block">Pending Earning</span>
                    <span className="text-2xl font-extrabold text-primary">₹{amount.toLocaleString()}</span>
                  </div>

                  {v.upi_id && (
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-medium block">UPI ID</span>
                      <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded-lg border border-slate-200">
                        {v.upi_id}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bank Info */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Bank Account</span>
                    <span className="font-mono font-semibold text-slate-800">{v.bank_account_number || "Not Provided"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">IFSC Code</span>
                    <span className="font-mono font-semibold text-slate-800">{v.bank_ifsc || "Not Provided"}</span>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setSelectedVendor(v);
                      setReference(`PAY-${Date.now().toString().slice(-6)}`);
                    }}
                    className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Clear & Disburse Payout
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAYOUT REFERENCE MODAL */}
      {selectedVendor && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Confirm Payout Disbursal
              </h3>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 bg-orange-50/80 p-4 rounded-2xl border border-orange-200">
              <p>Vendor Store: <strong className="text-slate-900 font-bold">{selectedVendor.business_name}</strong></p>
              <p>Payout Amount: <strong className="text-primary font-extrabold text-base">₹{Number(selectedVendor.total_earning || 0).toLocaleString()}</strong></p>
              {selectedVendor.upi_id && <p>UPI ID: <strong className="text-slate-900 font-mono">{selectedVendor.upi_id}</strong></p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                Transaction Reference ID (UTR / Txn ID)
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. UTR98218932 or BANK-REF-1092"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This reference ID will be visible to the vendor on their Earnings & Payments dashboard.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedVendor(null)}
                disabled={clearing}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleClearPayment}
                disabled={clearing}
                className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                {clearing ? "Processing..." : "Disburse & Send Notification"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}