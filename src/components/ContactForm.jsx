import React, { useState, useEffect, useContext } from "react";
import { Send, CheckCircle2, AlertCircle, Loader2, MessageSquare, Mail, User, Phone, Tag } from "lucide-react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function ContactForm({
  title = "Send us a Message",
  subtitle = "Have a question or need assistance? Fill out the form and our support team will respond promptly.",
  showHeader = true,
  onSuccess
}) {
  const { user, role } = useContext(AuthContext) || {};

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: role === "vendor" ? "Payout & Bank Settlement" : "General Inquiry",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-populate logged-in user credentials
  useEffect(() => {
    let savedUser = user;
    if (!savedUser) {
      try {
        savedUser = JSON.parse(localStorage.getItem("user"));
      } catch (e) {
        // ignore
      }
    }

    if (savedUser) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || savedUser.name || "",
        email: prev.email || savedUser.email || "",
        phone: prev.phone || savedUser.phone || ""
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate
    if (!form.name.trim()) {
      setErrorMsg("Please provide your name.");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setErrorMsg("Please provide a valid email address.");
      return;
    }
    if (!form.message.trim() || form.message.trim().length < 5) {
      setErrorMsg("Please write a detailed message (at least 5 characters).");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/contact", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        subject: form.subject.trim(),
        message: form.message.trim()
      });

      setSuccess(true);
      setForm((prev) => ({
        ...prev,
        message: ""
      }));

      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      console.error("Failed to submit contact form:", err);
      setErrorMsg(
        err.response?.data?.message ||
        "Could not send your message. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
      {showHeader && (
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-primary border border-orange-200/60 mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Support Channel</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Success Notification */}
      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 animate-scaleIn">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-emerald-900">
              Message Delivered!
            </h3>
            <p className="text-sm text-emerald-700 max-w-md mx-auto">
              Your inquiry has been stored in our system and notified to our support team and administrator email. We will reach back to you shortly.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition active:scale-95 shadow-sm"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            </div>

            {/* Inquiry Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject Category <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Tag className="w-4 h-4" />
                </div>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                >
                  {role === "vendor" ? (
                    <>
                      <option value="Payout & Bank Settlement">Payout & Bank Settlement</option>
                      <option value="Product Listing & Catalog Approval">Product Listing & Catalog Approval</option>
                      <option value="Order Fulfillment & Courier Pickup">Order Fulfillment & Courier Pickup</option>
                      <option value="Commission & Transaction Statement">Commission & Transaction Statement</option>
                      <option value="Account Verification & GST Compliance">Account Verification & GST Compliance</option>
                      <option value="General Merchant Support">General Merchant Support</option>
                    </>
                  ) : (
                    <>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Order & Delivery Status">Order & Delivery Status</option>
                      <option value="Product Quality & Freshness">Product Quality & Freshness</option>
                      <option value="Payments & Refunds">Payments & Refunds</option>
                      <option value="Vendor / Partner Collaboration">Vendor / Partner Collaboration</option>
                      <option value="Feedback & Suggestions">Feedback & Suggestions</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Detailed Message <span className="text-primary">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {form.message.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us what you need help with, provide relevant order IDs or questions..."
              className="w-full p-3.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition resize-none leading-relaxed"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-orange-600 disabled:bg-primary/60 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-orange-500/25 transition active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Message...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
