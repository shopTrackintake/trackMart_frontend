import React from "react";
import { 
  Headphones, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import ContactForm from "../../components/ContactForm";

export default function Support() {
  const supportChannels = [
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Direct Phone Support",
      value: "+91 78986 22813",
      subtext: "Mon - Sat, 10:00 AM – 7:00 PM IST",
      action: "tel:+917898622813",
      actionLabel: "Call Hotline",
      color: "bg-emerald-50 text-emerald-600 border-emerald-200/80"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email Support",
      value: "shop.trackintake@gmail.com",
      subtext: "Typical response within 2-4 hours",
      action: "mailto:shop.trackintake@gmail.com",
      actionLabel: "Send Email",
      color: "bg-orange-50 text-primary border-orange-200/80"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Operating Hours",
      value: "10:00 AM – 7:00 PM",
      subtext: "Sunday closed for platform maintenance",
      action: null,
      actionLabel: null,
      color: "bg-purple-50 text-purple-600 border-purple-200/80"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-primary border border-orange-200/60">
              <Headphones className="w-3.5 h-3.5" />
              <span>Dedicated Customer Assistance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Customer Support Center
            </h1>
            <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
              Have an issue with your recent order, a delivery inquiry, or product quality feedback? Reach our team directly below.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Guaranteed Resolutions</span>
          </div>
        </div>
      </div>

      {/* DIRECT CONTACT CHANNELS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {supportChannels.map((channel, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-3 ${channel.color}`}>
                {channel.icon}
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {channel.title}
              </p>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                {channel.value}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {channel.subtext}
              </p>
            </div>

            {channel.action && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <a
                  href={channel.action}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-orange-700 transition"
                >
                  <span>{channel.actionLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MAIN CONTACT US FORM */}
      <div className="space-y-6">
        <ContactForm
          title="Send a Support Inquiry"
          subtitle="Submit your issue or question below. Your inquiry will be saved in our database, notified to the administrator's bell, and dispatched to email immediately."
        />
      </div>

    </div>
  );
}