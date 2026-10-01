import { useState } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { 
  Building2, User, Mail, Phone, MapPin, 
  CreditCard, ShieldCheck, Lock, ArrowRight,
  FileText, CheckCircle2, AlertCircle
} from "lucide-react";

export default function ApplyVendor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    owner_name: "",
    business_name: "",
    email: "",
    phone: "",
    shop_address: "",
    pincode: "",
    password: "",
    bank_holder_name: "",
    bank_account_number: "",
    bank_ifsc: "",
    upi_id: "",
    pan_number: "",
    gst_number: "",
    fssai_number: ""
  });

  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      // Keep name and owner_name synchronized if owner_name is typed
      if (field === "owner_name") {
        updated.name = value;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.business_name || !form.owner_name || !form.email || !form.phone || !form.password) {
      setError("Please fill in all required basic business details.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/register", {
        ...form,
        name: form.owner_name || form.name,
        role: "vendor"
      });

      alert("🎉 Vendor registration submitted successfully! Your account is pending admin verification. You will be able to log in once approved.");
      navigate("/login");
    } catch (err) {
      console.error("Vendor registration error:", err);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fadeIn">
      {/* HEADER */}
      <div className="text-center mb-8 space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider">
          Merchant Onboarding
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-primary">
          Register as a TrackMart Vendor
        </h1>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Join TrackMart's verified health & wellness marketplace. Reach thousands of local health-conscious buyers.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Registration Issue</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: BUSINESS & OWNER DETAILS */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-primary">
                Store & Owner Information
              </h2>
              <p className="text-xs text-slate-500">Contact and location details for customer discovery and pickups</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Business / Store Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Nature Organics Store"
                  value={form.business_name}
                  onChange={(e) => handleChange("business_name", e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Owner Full Name <span className="text-red-500">*</span></label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Rajesh Sharma"
                  value={form.owner_name}
                  onChange={(e) => handleChange("owner_name", e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Address (Login ID) <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  required
                  type="email"
                  placeholder="vendor@business.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Business Phone Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  required
                  type="tel"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Store / Pickup Address <span className="text-red-500">*</span></label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <textarea
                  required
                  rows={2}
                  placeholder="Complete shop address (Shop number, market, road/street, area)..."
                  value={form.shop_address}
                  onChange={(e) => handleChange("shop_address", e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Pincode / Postal Code <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                placeholder="e.g. 400001"
                value={form.pincode}
                onChange={(e) => handleChange("pincode", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Create Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  required
                  type="password"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: BANK & SETTLEMENT DETAILS */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-primary">
                Bank & Settlement Details
              </h2>
              <p className="text-xs text-slate-500">Earnings from online & customer orders will be deposited to this account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Account Holder Name</label>
              <input
                type="text"
                placeholder="Name as printed on passbook / cheque"
                value={form.bank_holder_name}
                onChange={(e) => handleChange("bank_holder_name", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Bank Account Number</label>
              <input
                type="text"
                placeholder="e.g. 01234567890123"
                value={form.bank_account_number}
                onChange={(e) => handleChange("bank_account_number", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Bank IFSC Code</label>
              <input
                type="text"
                placeholder="e.g. HDFC0001234"
                value={form.bank_ifsc}
                onChange={(e) => handleChange("bank_ifsc", e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Settlement UPI ID <span className="text-slate-400 font-normal">(Instant Settlement)</span></label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. yourname@okicici / upi"
                  value={form.upi_id}
                  onChange={(e) => handleChange("upi_id", e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: LEGAL, TAX & COMPLIANCE */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-primary">
                Tax & Regulatory Compliance
              </h2>
              <p className="text-xs text-slate-500">Government identification & licenses for seller authenticity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">PAN Card Number</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  value={form.pan_number}
                  onChange={(e) => handleChange("pan_number", e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">GSTIN (Optional)</label>
              <input
                type="text"
                placeholder="22AAAAA0000A1Z5"
                value={form.gst_number}
                onChange={(e) => handleChange("gst_number", e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">FSSAI License No (Optional)</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="14-digit FSSAI No"
                  value={form.fssai_number}
                  onChange={(e) => handleChange("fssai_number", e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primaryHover text-white py-3.5 px-6 rounded-xl font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-base active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span>Submitting Registration...</span>
            ) : (
              <>
                <span>Submit Vendor Application</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2">
          Already have an approved vendor account?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Log in here
          </Link>
        </div>

      </form>
    </div>
  );
}