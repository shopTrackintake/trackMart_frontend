import React, { useContext } from "react";
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // path adjust karo

export default function Footer() {

  const { role } = useContext(AuthContext);

  // 🔥 dynamic dashboard path
  const dashboardPath =
    role === "admin"
      ? "/admin"
      : role === "vendor"
      ? "/vendor"
      : "/customer";

  const quickLinks = [
    { label: "Dashboard", path: dashboardPath },
    { label: "Tools", path: dashboardPath },
    { label: "Profile", path: dashboardPath },
    { label: "Health", path: dashboardPath },
  ];

  const legalLinks = [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms & Conditions", path: "/terms" },
    { label: "Refund & Return Policy", path: "/refund" },
    { label: "Shipping Policy", path: "/shipping" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <footer className="bg-[var(--color-bg-surface)] border-t border-[var(--color-border-default)]">
      
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-3 gap-12">

          {/* LEFT */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              <span className="text-[var(--color-primary)]">Track</span>
              <span className="text-[var(--color-text-strong)]">Mart</span>
            </h2>

            <p className="text-[var(--color-text-muted)] leading-7 mb-6 max-w-sm">
              Your smart destination for seamless shopping — explore products, track orders, and enjoy a smooth, reliable experience every time.
            </p>

            {/* SOCIAL ICONS */}
            <div className="flex gap-4">
              
              <a className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:text-blue-600 hover:border-blue-600 transition">
                <Facebook size={18} />
              </a>

              <a className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:text-sky-500 hover:border-sky-500 transition">
                <Twitter size={18} />
              </a>

              <a className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:text-pink-500 hover:border-pink-500 transition">
                <Instagram size={18} />
              </a>

              <a className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:text-red-500 hover:border-red-500 transition">
                <Youtube size={18} />
              </a>

              <a className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:text-blue-700 hover:border-blue-700 transition">
                <Linkedin size={18} />
              </a>

            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="font-semibold mb-4 text-[var(--color-text-strong)]">
              Quick Links
            </h3>

            <ul className="space-y-3 text-[var(--color-text-muted)]">
              {quickLinks.map((item, i) => (
                <li key={i}>
                  <Link to={item.path} className="hover:text-[var(--color-primary)] transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h3 className="font-semibold mb-4 text-[var(--color-text-strong)]">
              Legal
            </h3>

            <ul className="space-y-3 text-[var(--color-text-muted)]">
              {legalLinks.map((item, i) => (
                <li key={i}>
                  <Link to={item.path} className="hover:text-[var(--color-primary)] transition">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-12 pt-6 border-t border-dashed border-[var(--color-border-default)] text-center text-sm text-[var(--color-text-muted)]">
          <p className="flex items-center justify-center gap-1 flex-wrap">
            © {new Date().getFullYear()}{" "}
            <span className="font-medium">
              <span className="text-[var(--color-primary)]">Track</span>
              <span className="text-[var(--color-text-strong)]">Mart</span>
            </span>
            . All rights reserved. Made with{" "}
            <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
          </p>
        </div>

      </div>
    </footer>
  );
}