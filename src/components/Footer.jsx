import React, { useContext } from "react";
import { Mail, Phone, Heart, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Footer() {
  const { role } = useContext(AuthContext);
  const currentYear = new Date().getFullYear();

  // VENDOR FOOTER (ATTRACTIVE, PROFESSIONAL & COMPACT)
  if (role === "vendor") {
    return (
      <footer className="bg-white border-t border-slate-200 text-slate-600 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

            {/* 1. BRAND & OPERATIONAL STATUS */}
            <div className="space-y-3">
              <Link to="/vendor" className="text-xl font-bold flex items-center gap-1.5">
                <span className="text-primary">Track</span>
                <span className="text-slate-900">Mart</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-primary border border-orange-200 px-2 py-0.5 rounded-full ml-1">
                  Vendor Hub
                </span>
              </Link>

              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Unified merchant platform for fast product cataloging, live order dispatch, and direct payout settlements.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Hub Systems Online</span>
              </div>
            </div>

            {/* 2. STORE QUICK LINKS */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Store Management
              </h4>

              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link to="/vendor" className="text-slate-600 hover:text-primary transition-colors inline-flex items-center gap-1">
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link to="/vendor/products" className="text-slate-600 hover:text-primary transition-colors inline-flex items-center gap-1">
                    <span>My Products</span>
                  </Link>
                </li>
                <li>
                  <Link to="/vendor/add-product" className="text-slate-600 hover:text-primary transition-colors inline-flex items-center gap-1">
                    <span>Add New Product</span>
                  </Link>
                </li>
                <li>
                  <Link to="/vendor/orders" className="text-slate-600 hover:text-primary transition-colors inline-flex items-center gap-1">
                    <span>Orders & Fulfillment</span>
                  </Link>
                </li>
                <li>
                  <Link to="/vendor/payments" className="text-slate-600 hover:text-primary transition-colors inline-flex items-center gap-1">
                    <span>Earnings & Payouts</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* 3. HELP & SUPPORT */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Help & Support
              </h4>

              <div className="space-y-2 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-primary flex items-center justify-center shrink-0 border border-orange-100">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <a href="mailto:support@trackmart.com" className="hover:text-primary transition-colors font-medium truncate">
                    support@trackmart.com
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 text-primary flex items-center justify-center shrink-0 border border-orange-100">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <a href="tel:+918001234567" className="hover:text-primary transition-colors font-medium">
                    +91 (800) 123-4567
                  </a>
                </div>

                <div className="pt-1.5">
                  <Link 
                    to="/contact" 
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-orange-50 hover:bg-orange-100/80 border border-orange-200/80 px-3 py-1.5 rounded-xl transition shadow-2xs"
                  >
                    <span>Support Desk</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 4. POLICIES & COMPLIANCE */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Policies & Terms
              </h4>

              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <Link to="/terms" className="text-slate-600 hover:text-primary transition-colors inline-block">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-slate-600 hover:text-primary transition-colors inline-block">
                    Privacy & Security
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-slate-600 hover:text-primary transition-colors inline-block">
                    Shipping & Delivery SLA
                  </Link>
                </li>
                <li>
                  <Link to="/refund" className="text-slate-600 hover:text-primary transition-colors inline-block">
                    Refund & Return Policy
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* BOTTOM COPYRIGHT & TRUST BAR */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              © {currentYear} <span className="font-semibold text-slate-800">TrackMart Vendor Hub</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                256-Bit SSL Secured
              </span>
              <span>•</span>
              <span className="text-slate-500">Fast Daily Settlements</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // CUSTOMER / PUBLIC FOOTER
  const dashboardPath = role === "admin" ? "/admin" : "/customer";

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">

          {/* 1. BRAND */}
          <div className="space-y-2">
            <Link to="/" className="text-lg font-bold flex items-center gap-1.5">
              <span className="text-primary">Track</span>
              <span className="text-slate-900">Mart</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Your smart destination for online grocery shopping and live order delivery tracking.
            </p>
          </div>

          {/* 2. QUICK LINKS */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Quick Links
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:text-sm">
              <Link to="/" className="text-slate-600 hover:text-primary transition py-0.5">
                Shop
              </Link>
              {role ? (
                <>
                  <Link to={dashboardPath} className="text-slate-600 hover:text-primary transition py-0.5">
                    Dashboard
                  </Link>
                  <Link to="/profile" className="text-slate-600 hover:text-primary transition py-0.5">
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-slate-600 hover:text-primary transition py-0.5">
                    Login
                  </Link>
                  <Link to="/register" className="text-slate-600 hover:text-primary transition py-0.5">
                    Register
                  </Link>
                </>
              )}
              <Link to="/apply-vendor" className="text-primary font-semibold hover:underline py-0.5">
                Become Seller
              </Link>
            </div>
          </div>

          {/* 3. SUPPORT & CONTACT */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Support & Legal
            </h4>
            <div className="space-y-1.5 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <a href="mailto:support@trackmart.com" className="hover:text-primary transition">
                  support@trackmart.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <a href="tel:+918001234567" className="hover:text-primary transition">
                  +91 (800) 123-4567
                </a>
              </div>
              <div className="flex items-center gap-2.5 pt-1 text-xs text-slate-500">
                <Link to="/privacy" className="hover:text-primary transition">Privacy</Link>
                <span>•</span>
                <Link to="/terms" className="hover:text-primary transition">Terms</Link>
                <span>•</span>
                <Link to="/refund" className="hover:text-primary transition">Refunds</Link>
                <span>•</span>
                <Link to="/contact" className="hover:text-primary transition">Contact</Link>
              </div>
            </div>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p className="flex items-center gap-1">
            © {currentYear} <span className="font-semibold text-slate-800">TrackMart</span>. All rights reserved. Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
          </p>
          <span className="text-slate-400">Secure Multi-Vendor Platform</span>
        </div>
      </div>
    </footer>
  );
}