import React, { useState } from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Truck, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import ContactForm from "../components/ContactForm";

export default function Contact() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const contactCards = [
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Call Us Directly",
      detail: "+91 78986 22813",
      subtext: "Mon - Sat, 10 AM to 7 PM IST",
      action: "tel:+917898622813",
      actionLabel: "Call Now",
      bgClass: "bg-emerald-50 text-emerald-600 border-emerald-200/80"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email Support",
      detail: "shop.trackintake@gmail.com",
      subtext: "Typical response within 2-4 hours",
      action: "mailto:shop.trackintake@gmail.com",
      actionLabel: "Send Email",
      bgClass: "bg-orange-50 text-primary border-orange-200/80"
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Office Location",
      detail: "Indore, Madhya Pradesh",
      subtext: "1-Snehalata Ganj, Indore, 452003",
      action: "https://maps.google.com/?q=Snehalata+ganj+Indore+Madhya+Pradesh",
      actionLabel: "View Map",
      bgClass: "bg-blue-50 text-blue-600 border-blue-200/80"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Operational Hours",
      detail: "10:00 AM – 7:00 PM",
      subtext: "Sunday: Closed for maintenance",
      action: null,
      actionLabel: null,
      bgClass: "bg-purple-50 text-purple-600 border-purple-200/80"
    }
  ];

  const faqs = [
    {
      q: "How can I track my active grocery order?",
      a: "Once your order is placed, you can visit the 'My Orders' section from your navigation bar to view real-time status updates and delivery stages."
    },
    {
      q: "What should I do if an item received is damaged or incorrect?",
      a: "Submit an inquiry right here on this Contact/Support page with your Order ID, or visit your Orders page to request a resolution. Our support team resolves issues promptly."
    },
    {
      q: "How do I become a seller on TrackMart?",
      a: "Click on 'Become a Seller' in the top navigation, complete the short vendor onboarding form, and our merchant team will review your application within 24 hours."
    },
    {
      q: "Are the nutritional and health ratings verified?",
      a: "Yes! TrackMart algorithms evaluate verified manufacturer labels, FSSAI certifications, and nutritional breakdowns (sugar, saturated fats, sodium) to compute objective health ratings."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-orange-100/70 text-orange-800 border border-orange-200">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Dedicated Customer Care & Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            We’re Here to <span className="text-primary">Help You</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Have questions about healthy groceries, your recent order, or partnership opportunities? Reach out anytime and our team will assist you.
          </p>
        </div>

        {/* 4 CONTACT CHANNELS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border mb-4 group-hover:scale-105 transition-transform ${card.bgClass}`}>
                  {card.icon}
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {card.title}
                </h3>
                <p className="text-base font-bold text-slate-900 break-words mb-1">
                  {card.detail}
                </p>
                <p className="text-xs text-slate-500 leading-normal">
                  {card.subtext}
                </p>
              </div>

              {card.action && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <a
                    href={card.action}
                    target={card.action.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-orange-700 transition"
                  >
                    <span>{card.actionLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* MAIN 2-COLUMN SECTION: FORM + MAP & FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: CONTACT FORM (7 cols) */}
          <div className="lg:col-span-7">
            <ContactForm
              title="Send Us a Message"
              subtitle="Fill out the form below. Your message will be securely stored in our database and dispatched immediately to our support team."
            />
          </div>

          {/* RIGHT: MAP & FAQ (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* GOOGLE MAP & OFFICE PREVIEW */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    TrackMart Headquarters
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  Open Today
                </span>
              </div>

              <div className="w-full h-52 rounded-xl overflow-hidden border border-slate-200 relative bg-slate-100">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117925.21689532266!2d75.816664!3d22.719568!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fcad1b410ddb%3A0x96ec4da356240f4!2sIndore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  className="w-full h-full border-0"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="TrackMart Location"
                />
              </div>

              <div className="text-xs text-slate-500 leading-relaxed">
                <strong className="text-slate-800">Address: </strong>
                1-Snehalata Ganj, Indore, Madhya Pradesh, India.
              </div>
            </div>

            {/* QUICK FAQ ACCORDION */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <HelpCircle className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={index} className="py-3 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between gap-3 text-left group"
                      >
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-primary transition">
                          {faq.q}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed pl-1 animate-fadeIn">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TRUST & PROMISE BANNER */}
            <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200/60 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Buyer Protection & Quick Resolutions
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Every inquiry receives dedicated priority from our support administrators.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
