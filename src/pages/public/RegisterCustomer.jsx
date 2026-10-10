import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { useToast } from "../../context/ToastContext";
import PhoneInputWithCountry from "../../components/PhoneInputWithCountry";
import { 
  User, Mail, Lock, Eye, EyeOff, 
  ArrowRight, ShieldCheck, CheckCircle2, Store
} from "lucide-react";

export default function RegisterCustomer() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!form.name.trim()) {
      toast.warning("Please enter your full name.", "Missing Name");
      return;
    }

    if (!form.email.trim()) {
      toast.warning("Please enter a valid email address.", "Missing Email");
      return;
    }

    const cleanCountryCode = countryCode.trim();
    if (!cleanCountryCode || cleanCountryCode === "+" || cleanCountryCode.length < 2) {
      toast.warning("Please specify a valid country calling code (e.g. +91, +1, +44).", "Invalid Country Code");
      return;
    }

    if (!phoneNumber.trim()) {
      toast.warning("Please enter your mobile phone number.", "Missing Phone");
      return;
    }

    if (phoneNumber.length < 7) {
      toast.warning("Please enter a valid mobile number with at least 7 digits.", "Invalid Phone");
      return;
    }

    if (!form.password || form.password.length < 6) {
      toast.warning("Password must be at least 6 characters long.", "Weak Password");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("The passwords do not match. Please verify and re-enter.", "Password Mismatch");
      return;
    }

    try {
      setLoading(true);

      const fullPhone = `${countryCode} ${phoneNumber.trim()}`;

      await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: fullPhone,
        role: "customer"
      });

      toast.success(
        "Your account has been created successfully. You can now sign in.",
        "Account Created! 🎉"
      );

      navigate("/login", { state: { email: form.email.trim() } });
    } catch (err) {
      console.error("Customer registration error:", err);
      const msg = err.response?.data?.message || "Registration failed. Please check your details and try again.";
      toast.error(msg, "Registration Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-8 px-4 sm:px-6 animate-fadeIn">
      <div className="w-full max-w-md">

        {/* MAIN REGISTRATION CARD */}
        <div className="bg-white border border-borderDefault shadow-card rounded-3xl p-6 sm:p-9 space-y-6">

          {/* HEADER */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
              Buyer Membership
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-textStrong tracking-tight">
              Create Account
            </h1>
            <p className="text-xs sm:text-sm text-textMuted max-w-xs mx-auto">
              Join TrackMart to enjoy clean, organic groceries and verified nutritional insights.
            </p>
          </div>

          {/* REGISTRATION FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* FULL NAME */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-textStrong uppercase tracking-wider">
                Full Name <span className="text-primary">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-textMuted absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Patel"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong placeholder:text-textMuted/60 focus:outline-none focus:border-primary focus:bg-white transition font-medium"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-textStrong uppercase tracking-wider">
                Email Address <span className="text-primary">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-textMuted absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong placeholder:text-textMuted/60 focus:outline-none focus:border-primary focus:bg-white transition font-medium"
                />
              </div>
            </div>

            {/* PHONE WITH COUNTRY CODE SELECTOR */}
            <PhoneInputWithCountry
              id="customer-register-phone"
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
              required={true}
              label="Mobile Number"
              placeholder="98765 43210"
            />

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-textStrong uppercase tracking-wider">
                Password <span className="text-primary">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-textMuted absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong placeholder:text-textMuted/60 focus:outline-none focus:border-primary focus:bg-white transition font-mono"
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

            {/* CONFIRM PASSWORD */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-textStrong uppercase tracking-wider">
                Confirm Password <span className="text-primary">*</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-textMuted absolute left-3.5 pointer-events-none" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong placeholder:text-textMuted/60 focus:outline-none focus:border-primary focus:bg-white transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-textMuted hover:text-textStrong p-1 transition"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-xs sm:text-sm font-bold py-3 sm:py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* DIVIDER & LINKS */}
          <div className="pt-2 border-t border-borderDefault/80 space-y-3 text-center text-xs">
            <p className="text-textMuted">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-bold hover:underline"
              >
                Sign In
              </Link>
            </p>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-textMuted">
              <Store className="w-3.5 h-3.5 text-primary" />
              <span>Are you an organic vendor?</span>
              <Link
                to="/apply-vendor"
                className="text-primary font-semibold hover:underline"
              >
                Apply as Seller
              </Link>
            </div>
          </div>

        </div>

        {/* SECURITY & PRIVACY */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-textMuted">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your contact info is encrypted and never shared with third parties</span>
        </div>

      </div>
    </div>
  );
}