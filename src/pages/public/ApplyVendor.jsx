import { useState } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import PhoneInputWithCountry from "../../components/PhoneInputWithCountry";
import { 
  Building2, User, Mail, MapPin, 
  CreditCard, ShieldCheck, Lock, ArrowRight,
  FileText, CheckCircle2, AlertCircle, Eye, EyeOff, Store, Sparkles
} from "lucide-react";

export default function ApplyVendor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    owner_name: "",
    business_name: "",
    email: "",
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

  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleChange = (field, value) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "owner_name") {
        updated.name = value;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.business_name.trim() || !form.owner_name.trim()) {
      toast.warning("Please provide your store name and owner name.", "Missing Business Info");
      return;
    }

    if (!form.email.trim()) {
      toast.warning("Please enter your official business email.", "Missing Email");
      return;
    }

    const cleanCountryCode = countryCode.trim();
    if (!cleanCountryCode || cleanCountryCode === "+" || cleanCountryCode.length < 2) {
      toast.warning("Please specify a valid country calling code (e.g. +91, +1, +44).", "Invalid Country Code");
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.length < 7) {
      toast.warning("Please enter a valid phone number with at least 7 digits.", "Missing Phone");
      return;
    }

    if (!form.shop_address.trim() || !form.pincode.trim()) {
      toast.warning("Please provide your store pickup address and pincode.", "Missing Address");
      return;
    }

    if (!form.password || form.password.length < 6) {
      toast.warning("Password must be at least 6 characters.", "Weak Password");
      return;
    }

    try {
      setLoading(true);

      const fullPhone = `${countryCode} ${phoneNumber.trim()}`;

      await api.post("/auth/register", {
        ...form,
        phone: fullPhone,
        name: form.owner_name || form.name,
        role: "vendor"
      });

      toast.success(
        "🎉 Application submitted! Your vendor account is under review by our compliance team. You will be able to log in once approved.",
        "Application Received"
      );

      navigate("/login", { state: { email: form.email.trim() } });
    } catch (err) {
      console.error("Vendor registration error:", err);
      const msg = err.response?.data?.message || "Registration failed. Please review your entries and try again.";
      toast.error(msg, "Submission Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fadeIn">
      
      {/* HEADER */}
      <div className="text-center mb-8 space-y-2.5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider">
          <Store className="w-3.5 h-3.5" />
          <span>Merchant Onboarding Portal</span>
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-textStrong font-primary tracking-tight">
          Partner with TrackMart
        </h1>
        <p className="text-textMuted text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          Sell your certified organic groceries, health foods, and farm-fresh produce to thousands of conscious customers across the network.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        
        {/* SECTION 1: BUSINESS & OWNER DETAILS */}
        <div className="bg-white border border-borderDefault rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-borderDefault">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-primary flex items-center justify-center font-bold text-sm shadow-xs">
              1
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-textStrong font-primary">
                Store &amp; Contact Information
              </h2>
              <p className="text-xs text-textMuted">Contact details and registered pickup address for order fulfillment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* BUSINESS NAME */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textStrong uppercase tracking-wider">
                Store / Brand Name <span className="text-primary">*</span>
              </label>
              <div className="relative flex items-center">
                <Building2 className="w-4 h-4 text-textMuted absolute left-3.5 pointer-events-none" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Nature Organics Store"
                  value={form.business_name}
                  onChange={(e) => handleChange("business_name", e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
            </div>

            {/* OWNER FULL NAME */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textStrong uppercase tracking-wider">
                Authorized Owner Name <span className="text-primary">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-textMuted absolute left-3.5 pointer-events-none" />
                <input
                  required
                  type="text"
                  placeholder="e.g. Rajesh Sharma"
                  value={form.owner_name}
                  onChange={(e) => handleChange("owner_name", e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textStrong uppercase tracking-wider">
                Business Email (Login ID) <span className="text-primary">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-textMuted absolute left-3.5 pointer-events-none" />
                <input
                  required
                  type="email"
                  placeholder="vendor@business.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
            </div>

            {/* PHONE WITH COUNTRY CODE */}
            <PhoneInputWithCountry
              id="vendor-apply-phone"
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
              required={true}
              label="Business Mobile Number"
              placeholder="98765 43210"
            />

            {/* SHOP ADDRESS */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-textStrong uppercase tracking-wider">
                Store / Warehouse Pickup Address <span className="text-primary">*</span>
              </label>
              <div className="relative flex items-start">
                <MapPin className="w-4 h-4 text-textMuted absolute left-3.5 top-3.5 pointer-events-none" />
                <textarea
                  required
                  rows={2}
                  placeholder="Complete pickup address (Shop/Unit number, road/street, commercial market, city)..."
                  value={form.shop_address}
                  onChange={(e) => handleChange("shop_address", e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong focus:outline-none focus:border-primary focus:bg-white transition leading-relaxed"
                />
              </div>
            </div>

            {/* PINCODE */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textStrong uppercase tracking-wider">
                Pincode / Postal Code <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. 400001"
                value={form.pincode}
                onChange={(e) => handleChange("pincode", e.target.value)}
                className="w-full px-3.5 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textStrong uppercase tracking-wider">
                Vendor Portal Password <span className="text-primary">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-textMuted absolute left-3.5 pointer-events-none" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong focus:outline-none focus:border-primary focus:bg-white transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-textMuted hover:text-textStrong p-1 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: BANK & SETTLEMENT DETAILS */}
        <div className="bg-white border border-borderDefault rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-borderDefault">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-xs">
              2
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-textStrong font-primary">
                Bank &amp; Settlement Account
              </h2>
              <p className="text-xs text-textMuted">Disbursements from customer orders will be deposited automatically to this account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textStrong uppercase tracking-wider">Account Holder Name</label>
              <input
                type="text"
                placeholder="Name as printed on passbook"
                value={form.bank_holder_name}
                onChange={(e) => handleChange("bank_holder_name", e.target.value)}
                className="w-full px-3.5 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong focus:outline-none focus:border-primary focus:bg-white transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textStrong uppercase tracking-wider">Bank Account Number</label>
              <div className="relative flex items-center">
                <CreditCard className="w-4 h-4 text-textMuted absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="9 to 18 digit account number"
                  value={form.bank_account_number}
                  onChange={(e) => handleChange("bank_account_number", e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong focus:outline-none focus:border-primary focus:bg-white transition font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textStrong uppercase tracking-wider">Bank IFSC Code</label>
              <input
                type="text"
                placeholder="e.g. HDFC0001234"
                value={form.bank_ifsc}
                onChange={(e) => handleChange("bank_ifsc", e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textStrong uppercase tracking-wider">Instant UPI ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. merchant@okhdfcbank"
                value={form.upi_id}
                onChange={(e) => handleChange("upi_id", e.target.value)}
                className="w-full px-3.5 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong focus:outline-none focus:border-primary focus:bg-white transition font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: TAX & REGULATORY COMPLIANCE */}
        <div className="bg-white border border-borderDefault rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-borderDefault">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shadow-xs">
              3
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-textStrong font-primary">
                Tax &amp; Legal Compliance
              </h2>
              <p className="text-xs text-textMuted">Required for marketplace legal compliance and automated invoicing</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textStrong uppercase tracking-wider">PAN Number</label>
              <div className="relative flex items-center">
                <FileText className="w-4 h-4 text-textMuted absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="10-digit PAN"
                  value={form.pan_number}
                  onChange={(e) => handleChange("pan_number", e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong focus:outline-none focus:border-primary focus:bg-white transition font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textStrong uppercase tracking-wider">GSTIN Number</label>
              <input
                type="text"
                placeholder="15-digit GSTIN"
                value={form.gst_number}
                onChange={(e) => handleChange("gst_number", e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong focus:outline-none focus:border-primary focus:bg-white transition font-mono uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-textStrong uppercase tracking-wider">FSSAI License No</label>
              <div className="relative flex items-center">
                <ShieldCheck className="w-4 h-4 text-textMuted absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="14-digit FSSAI"
                  value={form.fssai_number}
                  onChange={(e) => handleChange("fssai_number", e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong focus:outline-none focus:border-primary focus:bg-white transition font-mono"
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
            className="w-full btn-primary py-4 px-6 rounded-2xl font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm sm:text-base active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting Merchant Application...</span>
              </>
            ) : (
              <>
                <span>Submit Merchant Application</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        <div className="text-center text-xs text-textMuted pt-1 pb-4">
          Already have an approved merchant account?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign In to Vendor Dashboard
          </Link>
        </div>

      </form>
    </div>
  );
}