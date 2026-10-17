import React, { useEffect, useState } from "react";
import { 
  MessageSquare, 
  Trash2, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Check, 
  RefreshCw, 
  Tag, 
  ShieldCheck 
} from "lucide-react";
import api from "../../services/api";

export default function AdminSupport() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "unread" | "read"
  const [actionAlert, setActionAlert] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get("/contact");
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching contact messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type = "success") => {
    setActionAlert({ text, type });
    setTimeout(() => setActionAlert(null), 4000);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/contact/${id}`);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "read" } : m))
      );
      showAlert("Message marked as read");
    } catch (err) {
      console.error("Error marking as read:", err);
      showAlert("Failed to update message status", "error");
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this inquiry?")) {
      return;
    }
    try {
      await api.delete(`/contact/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      showAlert("Customer inquiry deleted successfully");
    } catch (err) {
      console.error("Error deleting contact message:", err);
      showAlert("Failed to delete inquiry", "error");
    }
  };

  // Filter messages by search term & read status
  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.message || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "unread") {
      return matchesSearch && m.status === "unread";
    }
    if (statusFilter === "read") {
      return matchesSearch && m.status === "read";
    }
    return matchesSearch;
  });

  const unreadCount = messages.filter((m) => m.status === "unread").length;
  const readCount = messages.length - unreadCount;

  return (
    <div className="space-y-8 pb-12">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Inquiries & Support
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            All messages submitted through the Contact and Support pages are saved here.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          disabled={loading}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-xs active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>Refresh Messages</span>
        </button>
      </div>

      {/* ALERT BANNER */}
      {actionAlert && (
        <div className={`p-4 rounded-xl flex items-center gap-3 border text-sm animate-scaleIn ${
          actionAlert.type === "error"
            ? "bg-red-50 text-red-800 border-red-200"
            : "bg-emerald-50 text-emerald-800 border-emerald-200"
        }`}>
          {actionAlert.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{actionAlert.text}</span>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Inquiries
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {messages.length}
          </p>
          <span className="text-[11px] text-slate-500">Stored in database</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Unread Messages
          </p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {unreadCount}
          </p>
          <span className="text-[11px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md inline-block font-medium">
            Requires Attention
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Reviewed & Resolved
          </p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {readCount}
          </p>
          <span className="text-[11px] text-slate-500">Marked as handled</span>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, phone, or keyword..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary transition"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("unread")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === "unread" ? "bg-orange-500 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("read")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              statusFilter === "read" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Read ({readCount})
          </button>
        </div>
      </div>

      {/* MESSAGES LIST */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Loading inquiries...
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-2">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No inquiries found</h3>
          <p className="text-xs text-slate-400">
            {searchQuery ? "No inquiries matched your search terms." : "Customer submissions will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-2xl border transition-all duration-200 p-5 sm:p-6 shadow-xs space-y-4 ${
                msg.status === "unread"
                  ? "border-orange-300 ring-2 ring-orange-400/20"
                  : "border-slate-200/90"
              }`}
            >
              {/* CARD HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {msg.name ? msg.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        {msg.name}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        msg.status === "unread"
                          ? "bg-orange-100 text-orange-700 border border-orange-200"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {msg.status || "unread"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-0.5">
                      <a
                        href={`mailto:${msg.email}`}
                        className="inline-flex items-center gap-1 hover:text-primary transition"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{msg.email}</span>
                      </a>
                      {msg.phone && (
                        <a
                          href={`tel:${msg.phone}`}
                          className="inline-flex items-center gap-1 hover:text-primary transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{msg.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {new Date(msg.created_at || Date.now()).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>

              {/* SUBJECT & MESSAGE BODY */}
              <div className="space-y-2">
                {msg.subject && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span>{msg.subject}</span>
                  </div>
                )}
                <p className="text-sm text-slate-800 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>

              {/* CARD ACTIONS */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${msg.email}?subject=Re: [TrackMart] ${encodeURIComponent(msg.subject || "Customer Inquiry")}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-50 text-primary hover:bg-orange-100 border border-orange-200 transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                  </a>

                  {msg.phone && (
                    <a
                      href={`tel:${msg.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Sender</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {msg.status === "unread" && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(msg.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Read</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition cursor-pointer active:scale-95"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}