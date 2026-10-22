import React, { useEffect, useState, useMemo } from "react";
import { 
  Headphones, MessageSquare, Trash2, Mail, Clock, 
  CheckCircle, AlertCircle, Search, Check, RefreshCw, 
  Tag, ShieldCheck, Send, User, ChevronRight, X, Reply
} from "lucide-react";
import api from "../../services/api";

export default function AdminSupport() {
  const [activeTab, setActiveTab] = useState("tickets"); // "tickets" | "contact"
  const [tickets, setTickets] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "open" | "resolved"

  // Reply modal state for tickets
  const [replyingTicket, setReplyingTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [actionAlert, setActionAlert] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, contactRes] = await Promise.all([
        api.get("/support/admin").catch(() => ({ data: [] })),
        api.get("/contact").catch(() => ({ data: [] }))
      ]);
      setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
      setContactMessages(Array.isArray(contactRes.data) ? contactRes.data : []);
    } catch (err) {
      console.error("Error fetching support data:", err);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, type = "success") => {
    setActionAlert({ text, type });
    setTimeout(() => setActionAlert(null), 4000);
  };

  /* ================= TICKET ACTIONS ================= */
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyingTicket || !replyText.trim()) return;

    setSendingReply(true);
    try {
      const res = await api.post(`/support/admin/${replyingTicket.id}/reply`, {
        reply: replyText.trim()
      });

      setTickets((prev) =>
        prev.map((t) =>
          t.id === replyingTicket.id
            ? { ...t, admin_reply: replyText.trim(), status: "closed", replied_at: new Date() }
            : t
        )
      );

      showAlert("Reply sent and ticket resolved successfully!");
      setReplyingTicket(null);
      setReplyText("");
    } catch (err) {
      console.error("Error replying to ticket:", err);
      showAlert(err.response?.data?.message || "Failed to send reply", "error");
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm("Permanently delete this support ticket?")) return;
    try {
      await api.delete(`/support/admin/${id}`);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      showAlert("Ticket deleted successfully");
    } catch (err) {
      console.error("Error deleting ticket:", err);
      showAlert("Failed to delete ticket", "error");
    }
  };

  /* ================= CONTACT MESSAGE ACTIONS ================= */
  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/contact/${id}`);
      setContactMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "read" } : m))
      );
      showAlert("Inquiry marked as read");
    } catch (err) {
      console.error("Error marking contact as read:", err);
      showAlert("Failed to update status", "error");
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm("Permanently delete this contact message?")) return;
    try {
      await api.delete(`/contact/${id}`);
      setContactMessages((prev) => prev.filter((m) => m.id !== id));
      showAlert("Contact inquiry deleted");
    } catch (err) {
      console.error("Error deleting contact inquiry:", err);
      showAlert("Failed to delete inquiry", "error");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  /* ================= COUNTS ================= */
  const openTicketsCount = useMemo(() => tickets.filter((t) => t.status === "open").length, [tickets]);
  const closedTicketsCount = useMemo(() => tickets.filter((t) => t.status !== "open").length, [tickets]);
  const unreadContactCount = useMemo(() => contactMessages.filter((m) => m.status === "unread").length, [contactMessages]);

  /* ================= FILTERED LISTS ================= */
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const isStatusMatch =
        statusFilter === "all"
          ? true
          : statusFilter === "open"
          ? t.status === "open"
          : t.status !== "open";

      const q = searchQuery.toLowerCase().trim();
      const isSearchMatch =
        !q ||
        (t.subject || "").toLowerCase().includes(q) ||
        (t.message || "").toLowerCase().includes(q) ||
        (t.name || "").toLowerCase().includes(q) ||
        (t.email || "").toLowerCase().includes(q);

      return isStatusMatch && isSearchMatch;
    });
  }, [tickets, statusFilter, searchQuery]);

  const filteredContactMessages = useMemo(() => {
    return contactMessages.filter((m) => {
      const isStatusMatch =
        statusFilter === "all"
          ? true
          : statusFilter === "open"
          ? m.status === "unread"
          : m.status === "read";

      const q = searchQuery.toLowerCase().trim();
      const isSearchMatch =
        !q ||
        (m.name || "").toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q) ||
        (m.subject || "").toLowerCase().includes(q) ||
        (m.message || "").toLowerCase().includes(q);

      return isStatusMatch && isSearchMatch;
    });
  }, [contactMessages, statusFilter, searchQuery]);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">

      {/* ALERT NOTIFICATION */}
      {actionAlert && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold transition ${
          actionAlert.type === "error"
            ? "bg-rose-50 border border-rose-200 text-rose-800"
            : "bg-emerald-50 border border-emerald-200 text-emerald-800"
        }`}>
          {actionAlert.type === "error" ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{actionAlert.text}</span>
        </div>
      )}

      {/* ================= 1. HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Headphones className="w-7 h-7 text-primary" />
            <span>Customer &amp; Merchant Support Desk</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Resolve support tickets, dispatch official admin resolutions, and oversee contact inquiries.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* ================= 2. KPI SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div 
          onClick={() => { setActiveTab("tickets"); setStatusFilter("open"); }}
          className={`p-5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            activeTab === "tickets" && statusFilter === "open"
              ? "bg-amber-50/80 border-amber-300 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-amber-200"
          }`}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Open Support Tickets</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{openTicketsCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Awaiting admin resolution</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => { setActiveTab("tickets"); setStatusFilter("resolved"); }}
          className={`p-5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            activeTab === "tickets" && statusFilter === "resolved"
              ? "bg-emerald-50/80 border-emerald-300 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-emerald-200"
          }`}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved Tickets</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">{closedTicketsCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Admin reply delivered</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => { setActiveTab("contact"); setStatusFilter("all"); }}
          className={`p-5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            activeTab === "contact"
              ? "bg-blue-50/80 border-blue-300 shadow-xs"
              : "bg-white border-slate-200/90 hover:border-blue-200"
          }`}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact Inquiries</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{contactMessages.length}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">{unreadContactCount} unread message{unreadContactCount !== 1 ? "s" : ""}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* ================= 3. NAVIGATION TABS & FILTER CONTROLS ================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
        
        {/* Main Category Tabs */}
        <div className="flex border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab("tickets"); setStatusFilter("all"); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === "tickets"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span>Platform Tickets ({tickets.length})</span>
              {openTicketsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white">
                  {openTicketsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab("contact"); setStatusFilter("all"); }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === "contact"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Contact Messages ({contactMessages.length})</span>
              {unreadContactCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-500 text-white">
                  {unreadContactCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search & Status Filter row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === "tickets" ? "Search tickets by subject, message, user name, email..." : "Search contact messages..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                statusFilter === "all"
                  ? "bg-orange-50 text-primary border border-orange-200 font-bold"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setStatusFilter("open")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === "open"
                  ? "bg-amber-50 text-amber-800 border border-amber-300 font-bold"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{activeTab === "tickets" ? "Open" : "Unread"}</span>
            </button>

            <button
              onClick={() => setStatusFilter("resolved")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === "resolved"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Check className="w-3 h-3" />
              <span>{activeTab === "tickets" ? "Resolved" : "Read"}</span>
            </button>
          </div>
        </div>

      </div>

      {/* ================= 4. SUPPORT TICKETS TAB CONTENT ================= */}
      {activeTab === "tickets" && (
        <>
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-slate-500 text-sm font-medium">Loading support tickets...</p>
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => {
                const isOpen = ticket.status === "open";

                return (
                  <div
                    key={ticket.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xs transition space-y-4"
                  >
                    {/* Header: Sender, Subject, Date, Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 text-primary flex items-center justify-center font-bold shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm sm:text-base">
                              {ticket.name || "Customer User"}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">{ticket.email}</span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Ticket #{ticket.id.slice(0, 8).toUpperCase()} • {formatDate(ticket.created_at)} at {formatTime(ticket.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isOpen ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5 animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            Awaiting Response
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Resolved &amp; Replied
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subject & User Message */}
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800">
                        <Tag className="w-3 h-3 text-slate-500" />
                        <span>{ticket.subject}</span>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {ticket.message}
                      </div>
                    </div>

                    {/* Existing Admin Reply Display (if answered) */}
                    {ticket.admin_reply && (
                      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            Official Support Resolution
                          </span>
                          <span className="text-[11px] text-emerald-700 font-normal">
                            Replied: {formatDate(ticket.replied_at)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-emerald-800 whitespace-pre-wrap">
                          {ticket.admin_reply}
                        </p>
                      </div>
                    )}

                    {/* Actions Toolbar (NO CALL SENDER BUTTON) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <button
                            type="button"
                            onClick={() => { setReplyingTicket(ticket); setReplyText(""); }}
                            className="px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-2xs transition inline-flex items-center gap-1.5 active:scale-95"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span>Dispatch Reply &amp; Resolve</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setReplyingTicket(ticket); setReplyText(ticket.admin_reply || ""); }}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span>Update Resolution</span>
                          </button>
                        )}

                        <a
                          href={`mailto:${ticket.email}?subject=Re: [TrackMart Support #${ticket.id.slice(0, 8).toUpperCase()}] ${encodeURIComponent(ticket.subject || "")}`}
                          className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Open in Email</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8 space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No Support Tickets Found</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {searchQuery || statusFilter !== "all"
                  ? "No tickets match your filter criteria."
                  : "All user support tickets have been answered and resolved."}
              </p>
            </div>
          )}
        </>
      )}

      {/* ================= 5. CONTACT MESSAGES TAB CONTENT ================= */}
      {activeTab === "contact" && (
        <>
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
              <p className="text-slate-500 text-sm font-medium">Loading contact inquiries...</p>
            </div>
          ) : filteredContactMessages.length > 0 ? (
            <div className="space-y-4">
              {filteredContactMessages.map((msg) => {
                const isUnread = msg.status === "unread";

                return (
                  <div
                    key={msg.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-xs transition space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm sm:text-base">
                              {msg.name || "Inquirer"}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">{msg.email}</span>
                            {msg.phone && (
                              <>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-500">{msg.phone}</span>
                              </>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Received: {formatDate(msg.created_at)} at {formatTime(msg.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isUnread ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Unread Inquiry
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            Reviewed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Subject & Message */}
                    <div className="space-y-2">
                      {msg.subject && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800">
                          <Tag className="w-3 h-3 text-slate-500" />
                          <span>{msg.subject}</span>
                        </div>
                      )}

                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </div>
                    </div>

                    {/* Actions Toolbar (NO CALL SENDER BUTTON) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${msg.email}?subject=Re: [TrackMart] ${encodeURIComponent(msg.subject || "Customer Inquiry")}`}
                          className="px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-2xs transition inline-flex items-center gap-1.5 active:scale-95"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Reply via Email</span>
                        </a>

                        {isUnread && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(msg.id)}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark as Read</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteContact(msg.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 p-8 space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No Contact Messages</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                No contact form submissions found matching your filters.
              </p>
            </div>
          )}
        </>
      )}

      {/* ================= 6. REPLY MODAL ================= */}
      {replyingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-primary flex items-center justify-center font-bold">
                  <Reply className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Respond to #{replyingTicket.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recipient: {replyingTicket.name} ({replyingTicket.email})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReplyingTicket(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original message quote */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 max-h-36 overflow-y-auto">
              <strong className="text-slate-800 block">{replyingTicket.subject}</strong>
              <p className="whitespace-pre-wrap">{replyingTicket.message}</p>
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Official Support Resolution / Reply:
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Type your official resolution or response to the customer/vendor here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-primary transition leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyingTicket(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="px-5 py-2 bg-primary hover:bg-orange-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition active:scale-95 inline-flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{sendingReply ? "Sending..." : "Send Resolution & Close"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}