import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Percent, Settings, ShieldCheck, CheckCircle2, AlertCircle, 
  RefreshCw, Save, Store, Calculator, ArrowRight, HelpCircle,
  Sliders, Search, Sparkles, TrendingUp, Info, Check, RotateCcw
} from "lucide-react";

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [globalCommission, setGlobalCommission] = useState("5");
  const [applyToAll, setApplyToAll] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [vendorSearch, setVendorSearch] = useState("");
  const [updatingVendorId, setUpdatingVendorId] = useState(null);
  const [vendorCommissionInputs, setVendorCommissionInputs] = useState({});

  // Toast State
  const [toast, setToast] = useState(null);

  // Simulation Calculator State
  const [simAmount, setSimAmount] = useState(1000);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/settings");
      if (res.data?.settings?.platform_commission_percent !== undefined) {
        setGlobalCommission(res.data.settings.platform_commission_percent);
      }
      const vendorList = res.data?.vendors || [];
      setVendors(vendorList);

      const inputs = {};
      vendorList.forEach((v) => {
        inputs[v.id] = v.commission_percent !== null && v.commission_percent !== undefined 
          ? String(v.commission_percent) 
          : String(res.data.settings.platform_commission_percent || "5");
      });
      setVendorCommissionInputs(inputs);
    } catch (err) {
      console.error("Failed to load platform settings:", err);
      showToast(err.response?.data?.message || "Failed to load platform settings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  /* ================= UPDATE GLOBAL COMMISSION ================= */
  const handleSaveGlobal = async (e) => {
    e?.preventDefault();
    const val = parseFloat(globalCommission);
    if (isNaN(val) || val < 0 || val > 100) {
      showToast("Commission rate must be between 0% and 100%", "error");
      return;
    }

    try {
      setSavingGlobal(true);
      const res = await api.put("/admin/settings", {
        platform_commission_percent: val,
        apply_to_all_vendors: applyToAll
      });

      showToast(res.data?.message || "Platform commission settings saved successfully!");
      if (applyToAll) {
        // Update all local vendor inputs
        const updated = {};
        vendors.forEach((v) => {
          updated[v.id] = String(val);
        });
        setVendorCommissionInputs(updated);
        setVendors((prev) =>
          prev.map((v) => ({ ...v, commission_percent: val }))
        );
      }
    } catch (err) {
      console.error("Save global settings error:", err);
      showToast(err.response?.data?.message || "Failed to update platform settings", "error");
    } finally {
      setSavingGlobal(false);
    }
  };

  /* ================= UPDATE SINGLE VENDOR COMMISSION ================= */
  const handleUpdateVendorCommission = async (vendorId) => {
    const val = parseFloat(vendorCommissionInputs[vendorId]);
    if (isNaN(val) || val < 0 || val > 100) {
      showToast("Vendor commission rate must be between 0% and 100%", "error");
      return;
    }

    try {
      setUpdatingVendorId(vendorId);
      const res = await api.put(`/admin/vendors/${vendorId}/commission`, {
        commission_percent: val
      });

      showToast(res.data?.message || `Commission for vendor set to ${val}%!`);
      setVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, commission_percent: val } : v))
      );
    } catch (err) {
      console.error("Update vendor commission error:", err);
      showToast(err.response?.data?.message || "Failed to update vendor commission", "error");
    } finally {
      setUpdatingVendorId(null);
    }
  };

  /* Quick Preset Handler */
  const handleQuickPreset = (preset) => {
    setGlobalCommission(String(preset));
  };

  const filteredVendors = vendors.filter((v) => {
    if (!vendorSearch.trim()) return true;
    const q = vendorSearch.toLowerCase();
    return (
      (v.business_name && v.business_name.toLowerCase().includes(q)) ||
      (v.owner_name && v.owner_name.toLowerCase().includes(q)) ||
      (v.phone && v.phone.includes(q))
    );
  });

  const parsedComm = parseFloat(globalCommission) || 0;
  const simFee = (simAmount * parsedComm) / 100;
  const simNet = simAmount - simFee;

  return (
    <div className="space-y-7 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* TOAST ALERT */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[9999] px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border text-sm font-semibold transition-all transform animate-slideIn ${
            toast.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              <span>Platform Administration</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary mt-1.5">
            Platform Settings &amp; Marketplace Fees
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Configure dynamic platform commission percentages, global fee rules, and merchant-specific fee overrides.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition shadow-2xs self-start md:self-auto cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Settings</span>
        </button>
      </div>

      {/* MAIN TOP SECTION: GLOBAL COMMISSION + SIMULATION CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GLOBAL COMMISSION CARD (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Global Marketplace Commission
                </h2>
                <p className="text-xs text-slate-500">
                  Default fee automatically deducted from every order placed on TrackMart.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Active</span>
            </span>
          </div>

          <form onSubmit={handleSaveGlobal} className="space-y-6">
            {/* Input & Quick Presets */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Default Commission Percentage (%)
              </label>
              
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={globalCommission}
                    onChange={(e) => setGlobalCommission(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full text-2xl font-black text-slate-900 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-primary"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
                    %
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={savingGlobal}
                  className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingGlobal ? "Saving..." : "Save Settings"}</span>
                </button>
              </div>

              {/* QUICK PRESETS */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-400 mr-1">Quick Presets:</span>
                {[0, 2.5, 5, 7.5, 10, 12, 15].map((preset) => {
                  const isCurrent = parseFloat(globalCommission) === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickPreset(preset)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer border ${
                        isCurrent
                          ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      {preset}% {preset === 0 ? "(Free)" : preset === 5 ? "(Default)" : ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SYNC TO ALL MERCHANTS CHECKBOX */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-primary rounded-md border-slate-300 focus:ring-primary"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Synchronize &amp; Apply to all active vendors
                  </span>
                  <span className="text-[11px] text-slate-500 leading-normal block mt-0.5">
                    When checked, saving this rate will automatically override individual custom commission percentages for all {vendors.length} approved merchants.
                  </span>
                </div>
              </label>
            </div>

            {/* POLICY NOTES */}
            <div className="flex items-start gap-3 text-xs text-slate-500 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/70">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Order Processing Rule:</strong> Whenever a buyer checks out, each order item calculates its platform fee as <code className="text-amber-900 font-mono font-bold">(price * qty) * commission%</code> and credits the remaining net payout directly to the merchant's settlement balance.
              </p>
            </div>
          </form>
        </div>

        {/* LIVE SIMULATOR / CALCULATOR (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm sm:text-base tracking-wide text-white font-primary">
                  Live Commission Calculator
                </h3>
              </div>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                {parsedComm}% Active Fee
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <label className="text-xs font-semibold text-slate-300">
                Simulate Order Item Value (₹):
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="1"
                  value={simAmount}
                  onChange={(e) => setSimAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white font-mono font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>

              {/* Simulation Quick Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSimAmount(amt)}
                    className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition"
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SIMULATION BREAKDOWN BOX */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Gross Sale Price:</span>
              <span className="font-mono font-bold text-white">₹{simAmount.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-amber-400">
              <span className="flex items-center gap-1 font-semibold">
                Platform Retained Fee ({parsedComm}%):
              </span>
              <span className="font-mono font-black text-sm">
                -₹{simFee.toFixed(2)}
              </span>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 block">Vendor Net Payout:</span>
                <span className="text-[10px] text-slate-400">Credited to vendor wallet</span>
              </div>
              <span className="font-mono font-extrabold text-xl text-emerald-300">
                ₹{simNet.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Vendors see this exact breakdown transparently in their order fulfillment dashboard.</span>
          </div>
        </div>

      </div>

      {/* SECTION 2: VENDOR-SPECIFIC COMMISSION OVERRIDES */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden space-y-5 p-6 sm:p-7">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Vendor-Specific Commission Overrides
              </h2>
              <p className="text-xs text-slate-500">
                Customize commission percentage for individual merchants (e.g. VIP sellers, negotiated rates).
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={vendorSearch}
              onChange={(e) => setVendorSearch(e.target.value)}
              placeholder="Search vendor store..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* VENDORS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="py-3 px-4 rounded-l-xl">Merchant &amp; Store</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-center">Listed Products</th>
                <th className="py-3 px-4 text-center">Current Rate</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Custom Percentage &amp; Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No approved merchants found matching your search.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => {
                  const inputVal = vendorCommissionInputs[vendor.id] !== undefined
                    ? vendorCommissionInputs[vendor.id]
                    : String(vendor.commission_percent ?? globalCommission);
                  const isUpdating = updatingVendorId === vendor.id;
                  const currentRate = vendor.commission_percent !== null && vendor.commission_percent !== undefined
                    ? `${vendor.commission_percent}%`
                    : `${globalCommission}% (Global)`;

                  return (
                    <tr key={vendor.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {vendor.business_name ? vendor.business_name.charAt(0).toUpperCase() : "V"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{vendor.business_name || "Unnamed Store"}</p>
                            <p className="text-[11px] text-slate-400">Owner: {vendor.owner_name || "N/A"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <p>{vendor.phone || "No phone"}</p>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {vendor.product_count || 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          vendor.commission_percent !== null && vendor.commission_percent !== undefined
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {currentRate}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="relative w-24">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              value={inputVal}
                              onChange={(e) =>
                                setVendorCommissionInputs((prev) => ({
                                  ...prev,
                                  [vendor.id]: e.target.value
                                }))
                              }
                              className="w-full text-xs pr-6 pl-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-900"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                              %
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleUpdateVendorCommission(vendor.id)}
                            disabled={isUpdating}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer"
                          >
                            {isUpdating ? "Saving..." : "Update"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setVendorCommissionInputs((prev) => ({
                                ...prev,
                                [vendor.id]: String(globalCommission)
                              }));
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                            title="Reset input to default rate"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* SECTION 3: SYSTEM INTEGRATION OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Dynamic Calculation</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            All customer checkout operations dynamically query active commission percentage and store exact platform fees into <code>order_items.commission_amount</code>.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Store className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Vendor Transparency</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Merchants view gross sales, platform fee deductions, and net payouts on their order fulfillment screens without discrepancies.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Dynamic Payouts &amp; Refunds</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Admins can disburse custom dynamic amounts on the Payouts &amp; Dues page for partial settlements or customer refunds.
          </p>
        </div>
      </div>
    </div>
  );
}
