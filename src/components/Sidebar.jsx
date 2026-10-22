import { NavLink, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, UserCheck, Store, Package, ShoppingBag, 
  Wallet, Headphones, ShieldCheck, X, Menu, ChevronRight,
  PlusCircle, ShoppingCart, User
} from "lucide-react";
import api from "../services/api";

export default function Sidebar({ role }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending KYC count if role is admin
  useEffect(() => {
    if (role !== "admin") return;
    let isMounted = true;
    const fetchPendingCount = async () => {
      try {
        const res = await api.get("/admin/stats");
        if (isMounted && res.data && typeof res.data.pending === "number") {
          setPendingCount(res.data.pending);
        }
      } catch (err) {
        // Silently handle if unauthenticated
      }
    };
    fetchPendingCount();
    return () => { isMounted = false; };
  }, [role]);

  const baseLink =
    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-sm font-medium";

  const getLinkClass = (isActive) =>
    isActive
      ? `${baseLink} bg-primary text-white shadow-sm font-semibold`
      : `${baseLink} text-slate-600 hover:text-primary hover:bg-orange-50/60 font-medium`;

  return (
    <>
      {/* MOBILE TOGGLE / TRIGGER BUTTON */}
      <button
        type="button"
        aria-label="Toggle Navigation Sidebar"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-orange-600 active:scale-95 transition"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR PANEL */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200/90 z-50
          flex flex-col justify-between p-5
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="space-y-6">

          {/* HEADER BRAND & CLOSE BUTTON */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <Link 
              to={role === "admin" ? "/admin" : role === "vendor" ? "/vendor" : "/buy"} 
              className="flex items-center gap-2 group"
              onClick={() => setIsOpen(false)}
            >
              <div className="text-xl font-black tracking-tight text-slate-900">
                Track<span className="text-primary">Mart</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                role === "admin" 
                  ? "bg-slate-900 text-white" 
                  : role === "vendor" 
                  ? "bg-orange-100 text-primary" 
                  : "bg-blue-100 text-blue-800"
              }`}>
                {role === "admin" ? "Admin" : role === "vendor" ? "Vendor" : "Account"}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="space-y-1.5">

            {/* 1. ADMIN NAVIGATION */}
            {role === "admin" && (
              <>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
                  Governance
                </div>

                <NavLink 
                  to="/admin" 
                  end
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink 
                  to="/admin/approve-vendors" 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <UserCheck className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Seller Approvals</span>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-white">
                      {pendingCount}
                    </span>
                  )}
                </NavLink>

                <NavLink 
                  to="/admin/vendors" 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <Store className="w-4 h-4 shrink-0" />
                  <span>Merchants</span>
                </NavLink>

                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-3 pb-1">
                  Operations
                </div>

                <NavLink 
                  to="/admin/products" 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <Package className="w-4 h-4 shrink-0" />
                  <span>Product Catalog</span>
                </NavLink>

                <NavLink 
                  to="/admin/orders" 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>Orders Lifecycle</span>
                </NavLink>

                <NavLink 
                  to="/admin/vendor-payments" 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <Wallet className="w-4 h-4 shrink-0" />
                  <span>Payouts & Dues</span>
                </NavLink>

                <NavLink 
                  to="/admin/support" 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <Headphones className="w-4 h-4 shrink-0" />
                  <span>Support Desk</span>
                </NavLink>
              </>
            )}

            {/* 2. VENDOR NAVIGATION */}
            {role === "vendor" && (
              <>
                <NavLink 
                  to="/vendor" 
                  end
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink 
                  to="/vendor/add-product" 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  <span>Add Product</span>
                </NavLink>

                <NavLink 
                  to="/vendor/products" 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <Package className="w-4 h-4 shrink-0" />
                  <span>My Products</span>
                </NavLink>

                <NavLink 
                  to="/vendor/orders" 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <ShoppingBag className="w-4 h-4 shrink-0" />
                  <span>Orders</span>
                </NavLink>

                <NavLink 
                  to="/vendor/payments" 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <Wallet className="w-4 h-4 shrink-0" />
                  <span>Payouts & Dues</span>
                </NavLink>

                <NavLink 
                  to="/vendor/support" 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <Headphones className="w-4 h-4 shrink-0" />
                  <span>Support</span>
                </NavLink>
              </>
            )}

            {/* 3. CUSTOMER NAVIGATION */}
            {role === "customer" && (
              <>
                <NavLink 
                  to="/buy" 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  <span>Browse Store</span>
                </NavLink>

                <NavLink 
                  to="/customer/orders" 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <Package className="w-4 h-4 shrink-0" />
                  <span>My Orders</span>
                </NavLink>

                <NavLink 
                  to="/profile" 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span>Account Profile</span>
                </NavLink>
              </>
            )}

          </nav>
        </div>

        {/* BOTTOM BADGE / TRUST STATUS */}
        <div className="pt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{role === "admin" ? "Admin Security Active" : "TrackMart Security"}</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              {role === "admin" 
                ? "Restricted RBAC session. Activity is logged."
                : "256-bit SSL encrypted connection."}
            </p>
          </div>
        </div>

      </aside>
    </>
  );
}