import { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { loginUser } from "../../services/authService";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShoppingCart, Store, ShieldCheck } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const { cartCount, syncGuestCartToUser } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e?.preventDefault();

    if (!email.trim() || !password) {
      toast.warning("Please enter your email and password to proceed.", "Missing Credentials");
      return;
    }

    try {
      setLoading(true);

      const res = await loginUser({ email: email.trim(), password });
      const token = res.data.token;

      login(token);

      // Merge guest cart items into customer's account in backend
      await syncGuestCartToUser();

      const decoded = jwtDecode(token);

      toast.success(
        `Welcome back, ${res.data.user?.name || "Shopper"}!`,
        "Login Successful"
      );

      if (decoded.role === "admin") {
        navigate("/admin");
      } else if (decoded.role === "vendor") {
        navigate("/vendor");
      } else {
        // If coming from checkout or cart, or guest had items in cart, take them there
        const fromPath = location.state?.from;
        if (fromPath) {
          navigate(fromPath);
        } else if (cartCount > 0) {
          navigate("/cart");
        } else {
          navigate("/customer");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      const errMsg = err.response?.data?.message || "Invalid email or password. Please try again.";
      toast.error(errMsg, "Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[75vh] py-8 px-4 sm:px-6 animate-fadeIn">
      <div className="w-full max-w-md">

        {/* GUEST CART BANNER IF SHOPPING FIRST */}
        {cartCount > 0 && (
          <div className="mb-5 p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 flex items-center gap-3 text-xs shadow-xs animate-slideDown">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-primary flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold">
                {cartCount} {cartCount === 1 ? "item" : "items"} in your cart!
              </p>
              <p className="text-orange-700 text-[11px]">
                Sign in to save them to your account and proceed to checkout.
              </p>
            </div>
          </div>
        )}

        {/* MAIN CARD */}
        <div className="bg-white border border-borderDefault shadow-card rounded-3xl p-6 sm:p-9 space-y-6">

          {/* BRAND HEADER */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
              Secure Access
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-textStrong tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-textMuted max-w-xs mx-auto">
              Sign in to manage your orders, fresh groceries, and wellness items.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-4">

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-bgApp border border-borderDefault rounded-xl text-xs sm:text-sm text-textStrong placeholder:text-textMuted/60 focus:outline-none focus:border-primary focus:bg-white transition"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-textStrong uppercase tracking-wider">
                  Password <span className="text-primary">*</span>
                </label>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-textMuted absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-xs sm:text-sm font-bold py-3 sm:py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* DIVIDER & SWITCH ROLES */}
          <div className="pt-2 border-t border-borderDefault/80 space-y-3 text-center text-xs">
            <p className="text-textMuted">
              Don&apos;t have an account yet?{" "}
              <Link
                to="/register"
                className="text-primary font-bold hover:underline"
              >
                Create a Buyer Account
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

        {/* SECURITY FOOTER */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-textMuted">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted with bank-grade 256-bit SSL</span>
        </div>

      </div>
    </div>
  );
}