import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import NotificationBell from "./NotificationBell";
import { getWishlist } from "../services/wishlistService";
import { 
  Menu, X, LayoutDashboard, Package, ShoppingBag, ShoppingCart,
  Wallet, User, LogOut, Store, Heart, Headphones, CheckCircle2,
  PlusCircle, ShieldCheck, ChevronRight, Info
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const { role, logout } = useContext(AuthContext);
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [wishlistCount, setWishlistCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch wishlist counts for customer
  useEffect(() => {
    if (role !== "customer") {
      setWishlistCount(0);
      return;
    }

    let isMounted = true;
    const fetchWishlistCount = async () => {
      try {
        const wishRes = await getWishlist();
        if (isMounted && Array.isArray(wishRes?.data)) {
          setWishlistCount(wishRes.data.length);
        }
      } catch (err) {
        console.error("Error fetching navbar wishlist count:", err);
      }
    };

    fetchWishlistCount();
    return () => {
      isMounted = false;
    };
  }, [role, location.pathname]);

  // Auto-close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

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

  const handleSectionScroll = (sectionId) => {
    setIsOpen(false);
    if (location.pathname === "/") {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(`/#${sectionId}`);
  };

  const isLinkActive = (path) => {
    if (path === "/") {
      return location.pathname === "/" && !location.hash;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* 1. LEFT: BRAND LOGO */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 transition hover:opacity-90"
              onClick={() => setIsOpen(false)}
            >
              Track<span className="text-primary">Mart</span>
            </Link>
          </div>

          {/* 2. MIDDLE: DESKTOP NAVIGATION LINKS */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-6">
            
            {/* PUBLIC / GUEST */}
            {!role && (
              <div className="flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    isLinkActive("/")
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  Shop
                </Link>
                <button
                  type="button"
                  onClick={() => handleSectionScroll("products-section")}
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-primary hover:bg-orange-50/60 transition"
                >
                  Products
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionScroll("about-section")}
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-primary hover:bg-orange-50/60 transition"
                >
                  About Us
                </button>
                <Link
                  to="/apply-vendor"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    isLinkActive("/apply-vendor")
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  Become a Seller
                </Link>
                <Link
                  to="/contact"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    isLinkActive("/contact")
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  Support
                </Link>
              </div>
            )}

            {/* CUSTOMER */}
            {role === "customer" && (
              <div className="flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    location.pathname === "/"
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  Shop
                </Link>
                <Link
                  to="/customer/wishlist"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    isLinkActive("/customer/wishlist")
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-red-500 text-white text-[11px] px-1.5 py-0.2 rounded-full font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/customer/orders"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    isLinkActive("/customer/orders")
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>My Orders</span>
                </Link>
                <Link
                  to="/support"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    isLinkActive("/support")
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  <Headphones className="w-4 h-4" />
                  <span>Support</span>
                </Link>
              </div>
            )}

            {/* VENDOR */}
            {role === "vendor" && (
              <div className="flex items-center gap-1">
                <Link
                  to="/vendor"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    location.pathname === "/vendor"
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/vendor/products"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    location.pathname.startsWith("/vendor/products") ||
                    location.pathname.startsWith("/vendor/add-product")
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Products</span>
                </Link>
                <Link
                  to="/vendor/orders"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    location.pathname.startsWith("/vendor/orders")
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders</span>
                </Link>
                <Link
                  to="/vendor/payments"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    location.pathname === "/vendor/payments" ||
                    location.pathname === "/vendor/earnings"
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Payouts</span>
                </Link>
              </div>
            )}

            {/* ADMIN */}
            {role === "admin" && (
              <div className="flex items-center gap-1">
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    location.pathname === "/admin"
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/admin/products"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    location.pathname.startsWith("/admin/products")
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Products</span>
                </Link>
                <Link
                  to="/admin/orders"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    location.pathname.startsWith("/admin/orders")
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders</span>
                </Link>
                <Link
                  to="/admin/vendors"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    location.pathname.startsWith("/admin/vendors") ||
                    location.pathname.startsWith("/admin/approve-vendors")
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Vendors</span>
                </Link>
                <Link
                  to="/admin/vendor-payments"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                    location.pathname.startsWith("/admin/vendor-payments")
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:text-primary hover:bg-orange-50/60"
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Payouts</span>
                </Link>
              </div>
            )}

          </div>

          {/* 3. RIGHT: DESKTOP AUTH & ACTIONS */}
          <div className="hidden md:flex items-center justify-end gap-3">
            
            {/* PUBLIC / GUEST */}
            {!role ? (
              <>
                <Link
                  to="/cart"
                  className="relative p-2.5 rounded-xl text-slate-600 hover:text-primary hover:bg-orange-50/60 transition"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-scaleIn">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary hover:bg-slate-100 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold bg-primary text-white hover:bg-orange-600 rounded-xl shadow-xs shadow-orange-500/25 transition active:scale-95"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {role === "customer" && (
                  <Link
                    to="/customer/cart"
                    className="relative p-2.5 rounded-xl text-slate-600 hover:text-primary hover:bg-orange-50/60 transition"
                    title="Shopping Cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    )}
                  </Link>
                )}

                <NotificationBell />

                <Link
                  to={role === "vendor" ? "/vendor/profile" : "/profile"}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                    location.pathname === "/profile" || location.pathname === "/vendor/profile"
                      ? "bg-slate-100 text-primary"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  title="My Profile"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition active:scale-95"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            )}

          </div>

          {/* 4. MOBILE CONTROLS (CART ICON + NOTIFICATION + HAMBURGER) */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Quick Cart on Mobile Header */}
            {(!role || role === "customer") && (
              <Link
                to={role === "customer" ? "/customer/cart" : "/cart"}
                className="relative p-2 text-slate-700 hover:text-primary rounded-xl hover:bg-slate-100 transition"
                aria-label="View Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-scaleIn">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Bell */}
            {role && <NotificationBell />}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* ================= MOBILE MENU DRAWER ================= */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-16 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Drawer Panel */}
          <div className="fixed top-16 left-0 right-0 z-50 px-3 sm:px-4 pt-2 pb-6 max-h-[calc(100vh-4rem)] overflow-y-auto md:hidden">
            <div
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 sm:p-5 flex flex-col gap-3 animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >

              {/* 1. USER STATUS BANNER */}
              {!role ? (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50/60 rounded-xl border border-orange-100/80">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Welcome to TrackMart</h4>
                    <p className="text-xs text-slate-500">Fresh organic groceries & nutrition</p>
                  </div>
                </div>
              ) : role === "customer" ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-primary flex items-center justify-center font-bold shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Customer Account</h4>
                      <p className="text-xs text-slate-500">Orders, cart & saved items</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    Buyer
                  </span>
                </div>
              ) : role === "vendor" ? (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Vendor Merchant</h4>
                      <p className="text-xs text-slate-600">Store & catalog management</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-orange-700 bg-orange-200/80 px-2.5 py-0.5 rounded-full">
                    Seller
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-slate-100 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Administrator</h4>
                      <p className="text-xs text-slate-500">Platform governance</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-200 px-2.5 py-0.5 rounded-full">
                    Admin
                  </span>
                </div>
              )}

              {/* 2. NAVIGATION LINKS WITH PROPER ITEM NAMES */}
              <div className="space-y-1">

                {/* GUEST LINKS */}
                {!role && (
                  <>
                    <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Storefront Menu
                    </div>

                    <Link
                      to="/"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        isLinkActive("/")
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Shop Products</p>
                          <p className={`text-xs ${isLinkActive("/") ? "text-white/80" : "text-slate-400"}`}>
                            Browse all grocery & wellness items
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isLinkActive("/") ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/cart"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        isLinkActive("/cart")
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Shopping Cart</p>
                          <p className={`text-xs ${isLinkActive("/cart") ? "text-white/80" : "text-slate-400"}`}>
                            View selected grocery items
                          </p>
                        </div>
                      </div>
                      {cartCount > 0 ? (
                        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {cartCount} items
                        </span>
                      ) : (
                        <ChevronRight className={`w-4 h-4 ${isLinkActive("/cart") ? "text-white" : "text-slate-400"}`} />
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleSectionScroll("about-section")}
                      className="w-full flex items-center justify-between p-3 rounded-xl text-slate-700 hover:bg-slate-50 transition text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-slate-500 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">About TrackMart</p>
                          <p className="text-xs text-slate-400">Why choose our healthy market</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <Link
                      to="/apply-vendor"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        isLinkActive("/apply-vendor")
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Become a Seller</p>
                          <p className={`text-xs ${isLinkActive("/apply-vendor") ? "text-white/80" : "text-slate-400"}`}>
                            Join TrackMart merchant network
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isLinkActive("/apply-vendor") ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/contact"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        isLinkActive("/contact")
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Headphones className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Help & Contact</p>
                          <p className={`text-xs ${isLinkActive("/contact") ? "text-white/80" : "text-slate-400"}`}>
                            Support and inquiries
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isLinkActive("/contact") ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    {/* Auth Buttons */}
                    <div className="pt-3 mt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="p-2.5 text-center font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsOpen(false)}
                        className="p-2.5 text-center font-semibold bg-primary text-white rounded-xl shadow-xs shadow-orange-500/25 transition active:scale-95"
                      >
                        Create Account
                      </Link>
                    </div>
                  </>
                )}

                {/* CUSTOMER LINKS */}
                {role === "customer" && (
                  <>
                    <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Shopping & Activity
                    </div>

                    <Link
                      to="/"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname === "/"
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Shop Products</p>
                          <p className={`text-xs ${location.pathname === "/" ? "text-white/80" : "text-slate-400"}`}>
                            Browse store catalog
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname === "/" ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/customer/cart"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        isLinkActive("/customer/cart")
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Shopping Cart</p>
                          <p className={`text-xs ${isLinkActive("/customer/cart") ? "text-white/80" : "text-slate-400"}`}>
                            Review items ready for checkout
                          </p>
                        </div>
                      </div>
                      {cartCount > 0 ? (
                        <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {cartCount} items
                        </span>
                      ) : (
                        <ChevronRight className={`w-4 h-4 ${isLinkActive("/customer/cart") ? "text-white" : "text-slate-400"}`} />
                      )}
                    </Link>

                    <Link
                      to="/customer/wishlist"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        isLinkActive("/customer/wishlist")
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-red-500 fill-red-500/20 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">My Wishlist</p>
                          <p className={`text-xs ${isLinkActive("/customer/wishlist") ? "text-white/80" : "text-slate-400"}`}>
                            Your saved favorite products
                          </p>
                        </div>
                      </div>
                      {wishlistCount > 0 ? (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {wishlistCount}
                        </span>
                      ) : (
                        <ChevronRight className={`w-4 h-4 ${isLinkActive("/customer/wishlist") ? "text-white" : "text-slate-400"}`} />
                      )}
                    </Link>

                    <Link
                      to="/customer/orders"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        isLinkActive("/customer/orders")
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">My Orders</p>
                          <p className={`text-xs ${isLinkActive("/customer/orders") ? "text-white/80" : "text-slate-400"}`}>
                            Track deliveries and order history
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isLinkActive("/customer/orders") ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <div className="pt-2">
                      <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Account & Support
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-xl transition ${
                          isLinkActive("/profile")
                            ? "bg-primary text-white font-semibold shadow-xs"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold">Account Profile</p>
                            <p className={`text-xs ${isLinkActive("/profile") ? "text-white/80" : "text-slate-400"}`}>
                              Personal details & address settings
                            </p>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isLinkActive("/profile") ? "text-white" : "text-slate-400"}`} />
                      </Link>

                      <Link
                        to="/support"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-xl transition ${
                          isLinkActive("/support")
                            ? "bg-primary text-white font-semibold shadow-xs"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Headphones className="w-5 h-5 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold">Customer Support</p>
                            <p className={`text-xs ${isLinkActive("/support") ? "text-white/80" : "text-slate-400"}`}>
                              Help center & dispute tickets
                            </p>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isLinkActive("/support") ? "text-white" : "text-slate-400"}`} />
                      </Link>
                    </div>

                    <div className="pt-3 mt-2 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-red-600 font-semibold bg-red-50 hover:bg-red-100 transition active:scale-95"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}

                {/* VENDOR LINKS */}
                {role === "vendor" && (
                  <>
                    <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Merchant Operations
                    </div>

                    <Link
                      to="/vendor"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname === "/vendor"
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Vendor Dashboard</p>
                          <p className={`text-xs ${location.pathname === "/vendor" ? "text-white/80" : "text-slate-400"}`}>
                            Overview and performance metrics
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname === "/vendor" ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/vendor/products"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname === "/vendor/products"
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Product Catalog</p>
                          <p className={`text-xs ${location.pathname === "/vendor/products" ? "text-white/80" : "text-slate-400"}`}>
                            Manage products, stock and prices
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname === "/vendor/products" ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/vendor/add-product"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname === "/vendor/add-product"
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <PlusCircle className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Add New Product</p>
                          <p className={`text-xs ${location.pathname === "/vendor/add-product" ? "text-white/80" : "text-slate-400"}`}>
                            List a fresh grocery product
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname === "/vendor/add-product" ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/vendor/orders"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname.startsWith("/vendor/orders")
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Customer Orders</p>
                          <p className={`text-xs ${location.pathname.startsWith("/vendor/orders") ? "text-white/80" : "text-slate-400"}`}>
                            Fulfill customer purchases
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname.startsWith("/vendor/orders") ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/vendor/payments"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname === "/vendor/payments" ||
                        location.pathname === "/vendor/earnings"
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Earnings & Payouts</p>
                          <p className={`text-xs ${location.pathname === "/vendor/payments" ? "text-white/80" : "text-slate-400"}`}>
                            Track revenue & payment history
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname === "/vendor/payments" ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/vendor/profile"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname === "/vendor/profile"
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Store Profile</p>
                          <p className={`text-xs ${location.pathname === "/vendor/profile" ? "text-white/80" : "text-slate-400"}`}>
                            Manage store credentials & address
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname === "/vendor/profile" ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <div className="pt-3 mt-2 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 text-red-600 font-semibold p-2.5 bg-red-50 hover:bg-red-100 rounded-xl transition active:scale-95"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}

                {/* ADMIN LINKS */}
                {role === "admin" && (
                  <>
                    <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Admin Control Center
                    </div>

                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname === "/admin"
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Admin Overview</p>
                          <p className={`text-xs ${location.pathname === "/admin" ? "text-white/80" : "text-slate-400"}`}>
                            Platform statistics & activity
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname === "/admin" ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/admin/products"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname.startsWith("/admin/products")
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Manage Products</p>
                          <p className={`text-xs ${location.pathname.startsWith("/admin/products") ? "text-white/80" : "text-slate-400"}`}>
                            Review and manage marketplace products
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname.startsWith("/admin/products") ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/admin/orders"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname.startsWith("/admin/orders")
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingBag className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Customer Orders</p>
                          <p className={`text-xs ${location.pathname.startsWith("/admin/orders") ? "text-white/80" : "text-slate-400"}`}>
                            All customer orders platform-wide
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname.startsWith("/admin/orders") ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/admin/vendors"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname === "/admin/vendors"
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Store className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Verified Vendors</p>
                          <p className={`text-xs ${location.pathname === "/admin/vendors" ? "text-white/80" : "text-slate-400"}`}>
                            Active marketplace sellers
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname === "/admin/vendors" ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/admin/approve-vendors"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname === "/admin/approve-vendors"
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Vendor Applications</p>
                          <p className={`text-xs ${location.pathname === "/admin/approve-vendors" ? "text-white/80" : "text-slate-400"}`}>
                            Review pending seller requests
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname === "/admin/approve-vendors" ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/admin/vendor-payments"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname === "/admin/vendor-payments"
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Vendor Payouts</p>
                          <p className={`text-xs ${location.pathname === "/admin/vendor-payments" ? "text-white/80" : "text-slate-400"}`}>
                            Process seller settlements
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname === "/admin/vendor-payments" ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/admin/support"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname === "/admin/support"
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Headphones className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Support Tickets</p>
                          <p className={`text-xs ${location.pathname === "/admin/support" ? "text-white/80" : "text-slate-400"}`}>
                            Customer and vendor assistance
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname === "/admin/support" ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl transition ${
                        location.pathname === "/profile"
                          ? "bg-primary text-white font-semibold shadow-xs"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold">Admin Profile</p>
                          <p className={`text-xs ${location.pathname === "/profile" ? "text-white/80" : "text-slate-400"}`}>
                            Account credentials
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${location.pathname === "/profile" ? "text-white" : "text-slate-400"}`} />
                    </Link>

                    <div className="pt-3 mt-2 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-red-600 font-semibold bg-red-50 hover:bg-red-100 transition active:scale-95"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}

              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
