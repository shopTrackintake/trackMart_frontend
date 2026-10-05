import React, { useContext } from "react";
import { 
  Mail, Phone, ShieldCheck, ArrowRight, Zap, 
  CheckCircle2, Instagram, Facebook, Twitter, Linkedin, Youtube 
} from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Footer() {
  const { role } = useContext(AuthContext);
  const currentYear = new Date().getFullYear();

  // VENDOR FOOTER (SPACIOUS, MODERN & PROFESSIONAL)
  if (role === "vendor") {
    return (
      <footer className="bg-gradient-to-b from-white to-slate-50 border-t border-slate-200/90 text-slate-600 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

            {/* 1. BRAND & OPERATIONAL STATUS */}
            <div className="space-y-4">
              <Link to="/vendor" className="text-2xl font-black tracking-tight flex items-center gap-2 group">
                <span className="text-primary">Track</span>
                <span className="text-slate-900">Mart</span>
                <span className="text-xs font-bold uppercase tracking-wider bg-orange-100/80 text-primary border border-orange-200 px-2.5 py-0.5 rounded-full ml-1 shadow-2xs">
                  Vendor Hub
                </span>
              </Link>

              <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
                Unified merchant platform for fast product cataloging, real-time order dispatch, analytics, and direct payout settlements.
              </p>

              <div className="pt-1">
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-emerald-700 text-xs font-semibold shadow-2xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span>Hub Operational Systems Online</span>
                </div>
              </div>
            </div>

            {/* 2. STORE QUICK LINKS */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Store Management
              </h4>

              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <Link to="/vendor" className="text-slate-600 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span>Dashboard Overview</span>
                  </Link>
                </li>
                <li>
                  <Link to="/vendor/products" className="text-slate-600 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span>My Products Catalog</span>
                  </Link>
                </li>
                <li>
                  <Link to="/vendor/add-product" className="text-slate-600 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span>Add New Inventory</span>
                  </Link>
                </li>
                <li>
                  <Link to="/vendor/orders" className="text-slate-600 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span>Orders & Fulfillment</span>
                  </Link>
                </li>
                <li>
                  <Link to="/vendor/payments" className="text-slate-600 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span>Earnings & Payouts</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* 3. HELP & SUPPORT */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Vendor Support
              </h4>

              <div className="space-y-3.5 text-sm text-slate-600">
                <div className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-primary flex items-center justify-center shrink-0 border border-orange-100 shadow-2xs group-hover:scale-105 transition-transform">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Email Support</span>
                    <a href="mailto:support@trackmart.com" className="hover:text-primary transition-colors font-medium text-slate-700">
                      support@trackmart.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-primary flex items-center justify-center shrink-0 border border-orange-100 shadow-2xs group-hover:scale-105 transition-transform">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Merchant Helpline</span>
                    <a href="tel:+918001234567" className="hover:text-primary transition-colors font-medium text-slate-700">
                      +91 (800) 123-4567
                    </a>
                  </div>
                </div>

                <div className="pt-2">
                  <Link 
                    to="/contact" 
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary bg-orange-50 hover:bg-orange-100 border border-orange-200/80 px-4 py-2 rounded-xl transition shadow-2xs hover:shadow-xs"
                  >
                    <span>Merchant Help Desk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 4. POLICIES & COMPLIANCE */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Policies & Terms
              </h4>

              <ul className="space-y-3 text-sm font-medium">
                <li>
                  <Link to="/terms" className="text-slate-600 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-block">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-slate-600 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-block">
                    Privacy & Security Policy
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="text-slate-600 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-block">
                    Shipping & Delivery SLA
                  </Link>
                </li>
                <li>
                  <Link to="/refund" className="text-slate-600 hover:text-primary hover:translate-x-1 transition-all duration-200 inline-block">
                    Refund & Return Guidelines
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* BOTTOM COPYRIGHT & TRUST BAR */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-500">
            <p className="text-center md:text-left">
              © {currentYear} <span className="font-bold text-slate-800">TrackMart Vendor Hub</span>. All rights reserved.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-slate-600 font-medium">
              <span className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1 rounded-lg border border-slate-200/60 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                256-Bit SSL Encrypted
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1 rounded-lg border border-slate-200/60 text-xs">
                <Zap className="w-4 h-4 text-primary" />
                Fast Settlement Support
              </span>
              <span className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1 rounded-lg border border-slate-200/60 text-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Verified Merchant Hub
              </span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // CUSTOMER / PUBLIC FOOTER (CONCISE, RELEVANT & MOBILE RESPONSIVE)
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

          {/* 1. BRAND & SOCIAL MEDIA */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link to="/" className="text-xl font-bold flex items-center gap-1">
              <span className="text-primary font-black">Track</span>
              <span className="text-slate-900 font-black">Mart</span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs">
              Smart grocery shopping with verified nutritional insights and seamless order delivery.
            </p>
            <div className="space-y-1.5 text-xs sm:text-sm pt-0.5">
              <a 
                href="mailto:support@trackmart.com" 
                className="flex items-center gap-2 text-slate-600 hover:text-primary transition"
              >
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>support@trackmart.com</span>
              </a>
              <a 
                href="tel:+918001234567" 
                className="flex items-center gap-2 text-slate-600 hover:text-primary transition"
              >
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>+91 (800) 123-4567</span>
              </a>
            </div>

            {/* SOCIAL MEDIA ICONS */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Follow Us</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50 transition"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-sky-500 hover:border-sky-200 hover:bg-sky-50 transition"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 transition"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* 2. FOR BUYERS */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
              For Buyers
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="text-slate-600 hover:text-primary transition block py-0.5">
                  Shop Products
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-600 hover:text-primary transition block py-0.5">
                  Buyer Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-600 hover:text-primary transition block py-0.5">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. FOR SELLERS */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
              For Sellers
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/apply-vendor" className="text-primary font-semibold hover:underline block py-0.5">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-600 hover:text-primary transition block py-0.5">
                  Vendor Login
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. SUPPORT & HELP */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider">
              Support & Help
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/contact" className="text-slate-600 hover:text-primary transition block py-0.5">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-slate-600 hover:text-primary transition block py-0.5">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-slate-600 hover:text-primary transition block py-0.5">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT & LEGAL BAR */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p className="text-center sm:text-left">
            © {currentYear} TrackMart. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link to="/terms" className="text-slate-500 hover:text-primary transition">
              Terms of Service
            </Link>
            <span className="text-slate-300">•</span>
            <Link to="/privacy" className="text-slate-500 hover:text-primary transition">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}