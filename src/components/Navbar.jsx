import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import { getWishlist } from "../services/wishlistService";
import { 
  Menu, X, LayoutDashboard, Package, ShoppingBag, 
  Wallet, User, LogOut, Store 
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const { role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [wishlistCount, setWishlistCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (role !== "customer") return;
      try {
        const res = await getWishlist();
        setWishlistCount(res.data.length);
      } catch (err) {
        console.log(err);
      }
    };
    fetchWishlist();
  }, [role]);

  // Auto-close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 relative z-50 shadow-xs">
      <div className="flex items-center justify-between max-w-7xl mx-auto">

        {/* 1. LEFT: LOGO */}
        <div className="flex items-center min-w-[140px]">
          <Link to="/" className="text-xl md:text-2xl font-bold flex items-center gap-1.5" onClick={() => setIsOpen(false)}>
            <span className="text-primary">Track</span>
            <span className="text-strong">Mart</span>
          </Link>
        </div>

        {/* 2. MIDDLE: NAVIGATION LINKS (CENTERED) */}
        <div className="hidden md:flex items-center justify-center flex-1 space-x-1 sm:space-x-2 font-medium">

          {!role && (
            <div className="flex items-center space-x-2">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname === "/"
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Shop
              </Link>
              <Link
                to="/apply-vendor"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname === "/apply-vendor"
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Become Seller
              </Link>
            </div>
          )}

          {role === "customer" && (
            <div className="flex items-center space-x-2">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname === "/" ? "bg-primary text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Shop
              </Link>
              <Link
                to="/customer/wishlist"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname === "/customer/wishlist" ? "bg-primary text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                ❤️ Wishlist
                {wishlistCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link
                to="/customer/cart"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname === "/customer/cart" ? "bg-primary text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Cart
              </Link>
              <Link
                to="/customer/orders"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname === "/customer/orders" ? "bg-primary text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Orders
              </Link>
              <Link
                to="/profile"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname === "/profile" ? "bg-primary text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
            </div>
          )}

          {/* VENDOR CENTERED NAV */}
          {role === "vendor" && (
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Link
                to="/vendor"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname === "/vendor"
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                to="/vendor/products"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname === "/vendor/products" ||
                  location.pathname.startsWith("/vendor/add-product") ||
                  location.pathname.startsWith("/vendor/edit-product")
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                }`}
              >
                <Package className="w-4 h-4" />
                My Products
              </Link>

              <Link
                to="/vendor/orders"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname.startsWith("/vendor/orders")
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Orders
              </Link>

              <Link
                to="/vendor/payments"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname === "/vendor/payments" ||
                  location.pathname === "/vendor/earnings"
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                }`}
              >
                <Wallet className="w-4 h-4" />
                Earnings & Payments
              </Link>

              <Link
                to="/vendor/profile"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname === "/profile" || location.pathname === "/vendor/profile"
                    ? "bg-primary text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
            </div>
          )}

          {role === "admin" && (
            <div className="flex items-center space-x-2">
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname === "/admin" ? "bg-primary text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Admin Panel
              </Link>
              <Link
                to="/profile"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                  location.pathname === "/profile" ? "bg-primary text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
            </div>
          )}

        </div>

        {/* 3. RIGHT: USER ACTIONS (DESKTOP) */}
        <div className="hidden md:flex items-center justify-end space-x-3 min-w-[140px]">
          {!role ? (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-xl transition">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm px-4 py-2 rounded-xl">
                Register
              </Link>
            </>
          ) : (
            <>
              <NotificationBell />

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>

        {/* MOBILE CONTROLS (BELL + HAMBURGER) */}
        <div className="flex md:hidden items-center gap-1.5">
          {role && <NotificationBell />}

          <button
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition active:scale-95"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU DRAWER ================= */}
      {isOpen && (
        <>
          {/* 1. Backdrop */}
          <div
            className="fixed inset-0 top-[57px] sm:top-[61px] bg-slate-900/60 z-[998] md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* 2. Menu Card Panel */}
          <div className="fixed top-[61px] sm:top-[65px] left-0 right-0 z-[999] px-3 sm:px-4 md:hidden">
            <div
              className="bg-white rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col gap-2 border border-slate-200 max-h-[calc(100vh-80px)] overflow-y-auto animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* PUBLIC / GUEST */}
              {!role && (
                <div className="space-y-1">
                  <Link 
                    to="/" 
                    onClick={() => setIsOpen(false)} 
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition ${location.pathname === "/" ? "bg-primary text-white font-semibold shadow-xs" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    <Store className="w-5 h-5" /> Shop Storefront
                  </Link>
                  <Link 
                    to="/apply-vendor" 
                    onClick={() => setIsOpen(false)} 
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition ${location.pathname === "/apply-vendor" ? "bg-primary text-white font-semibold shadow-xs" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    <Package className="w-5 h-5" /> Become a Seller
                  </Link>
                  <div className="pt-3 mt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <Link to="/login" onClick={() => setIsOpen(false)} className="p-2.5 text-center font-semibold text-primary border border-primary/20 rounded-xl hover:bg-primary/5 transition">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)} className="p-2.5 text-center font-semibold bg-primary text-white rounded-xl shadow-xs transition">
                      Register
                    </Link>
                  </div>
                </div>
              )}

              {/* CUSTOMER */}
              {role === "customer" && (
                <div className="space-y-1">
                  <Link 
                    to="/" 
                    onClick={() => setIsOpen(false)} 
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition ${location.pathname === "/" ? "bg-primary text-white font-semibold shadow-xs" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    <Store className="w-5 h-5" /> Shop
                  </Link>
                  <Link 
                    to="/customer/wishlist" 
                    onClick={() => setIsOpen(false)} 
                    className={`flex items-center justify-between p-3 rounded-xl font-medium transition ${location.pathname === "/customer/wishlist" ? "bg-primary text-white font-semibold shadow-xs" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    <span className="flex items-center gap-3">❤️ Wishlist</span>
                    {wishlistCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  <Link 
                    to="/customer/cart" 
                    onClick={() => setIsOpen(false)} 
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition ${location.pathname === "/customer/cart" ? "bg-primary text-white font-semibold shadow-xs" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    <ShoppingBag className="w-5 h-5" /> Cart
                  </Link>
                  <Link 
                    to="/customer/orders" 
                    onClick={() => setIsOpen(false)} 
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition ${location.pathname === "/customer/orders" ? "bg-primary text-white font-semibold shadow-xs" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    <Package className="w-5 h-5" /> My Orders
                  </Link>
                  <Link 
                    to="/profile" 
                    onClick={() => setIsOpen(false)} 
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition ${location.pathname === "/profile" ? "bg-primary text-white font-semibold shadow-xs" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    <User className="w-5 h-5" /> Profile Settings
                  </Link>
                  <div className="pt-3 mt-2 border-t border-slate-100">
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-red-600 font-semibold bg-red-50 hover:bg-red-100 transition"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}

              {/* VENDOR */}
              {role === "vendor" && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Merchant Navigation
                  </div>
                  
                  <Link
                    to="/vendor"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition ${
                      location.pathname === "/vendor" ? "bg-primary text-white font-semibold shadow-xs" : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" /> Dashboard
                  </Link>

                  <Link
                    to="/vendor/products"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition ${
                      location.pathname === "/vendor/products" ||
                      location.pathname.startsWith("/vendor/add-product") ||
                      location.pathname.startsWith("/vendor/edit-product")
                        ? "bg-primary text-white font-semibold shadow-xs"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Package className="w-5 h-5" /> My Products
                  </Link>

                  <Link
                    to="/vendor/orders"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition ${
                      location.pathname.startsWith("/vendor/orders") ? "bg-primary text-white font-semibold shadow-xs" : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" /> Orders
                  </Link>

                  <Link
                    to="/vendor/payments"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition ${
                      location.pathname === "/vendor/payments" ||
                      location.pathname === "/vendor/earnings"
                        ? "bg-primary text-white font-semibold shadow-xs"
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <Wallet className="w-5 h-5" /> Earnings & Payments
                  </Link>

                  <Link
                    to="/vendor/profile"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition ${
                      location.pathname === "/profile" || location.pathname === "/vendor/profile" ? "bg-primary text-white font-semibold shadow-xs" : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <User className="w-5 h-5" /> Profile Settings
                  </Link>

                  <div className="pt-3 mt-2 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 text-red-600 font-semibold p-2.5 bg-red-50 hover:bg-red-100 rounded-xl transition"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}

              {/* ADMIN */}
              {role === "admin" && (
                <div className="space-y-1">
                  <Link 
                    to="/admin" 
                    onClick={() => setIsOpen(false)} 
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition ${location.pathname === "/admin" ? "bg-primary text-white font-semibold shadow-xs" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    <LayoutDashboard className="w-5 h-5" /> Admin Panel
                  </Link>
                  <Link 
                    to="/profile" 
                    onClick={() => setIsOpen(false)} 
                    className={`flex items-center gap-3 p-3 rounded-xl font-medium transition ${location.pathname === "/profile" ? "bg-primary text-white font-semibold shadow-xs" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    <User className="w-5 h-5" /> Profile Settings
                  </Link>
                  <div className="pt-3 mt-2 border-t border-slate-100">
                    <button 
                      onClick={handleLogout} 
                      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-red-600 font-semibold bg-red-50 hover:bg-red-100 transition"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
