import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { Bell, Trash2, Clock } from "lucide-react";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);

  /* ================= CLOSE ON CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ================= FETCH NOTIFICATIONS ================= */
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= MARK ALL AS READ (WITH FALLBACK) ================= */
  const markAllAsRead = async (currentNotifications) => {
    // 1. Synchronously reset badge in UI state
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      // 2. Try bulk update endpoint
      await api.put("/notifications/read-all");
    } catch (err) {
      // 3. Fallback: If server hasn't reloaded bulk route, update each unread item individually
      const unreadItems = (currentNotifications || notifications).filter((n) => !n.is_read);
      if (unreadItems.length > 0) {
        await Promise.all(
          unreadItems.map((n) =>
            api.put(`/notifications/${n.id}/read`).catch(() => {})
          )
        );
      }
    }
  };

  /* ================= CLEAR ALL NOTIFICATIONS ================= */
  const clearAllNotifications = async () => {
    setNotifications([]);

    try {
      await api.delete("/notifications/clear-all");
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= TOGGLE DROPDOWN & AUTO READ ================= */
  const handleToggleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    // Auto mark all as read on opening
    const unread = notifications.filter((n) => !n.is_read);
    if (nextOpen && unread.length > 0) {
      markAllAsRead(notifications);
    }
  };

  /* ================= UNREAD COUNT ================= */
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div ref={bellRef} className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={handleToggleOpen}
        className="relative p-2 rounded-xl text-gray-700 hover:text-primary hover:bg-gray-100 transition flex items-center justify-center focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <>
          {/* Mobile backdrop for tap-to-dismiss */}
          <div 
            className="fixed inset-0 z-[9990] bg-slate-900/30 backdrop-blur-xs sm:hidden"
            onClick={() => setOpen(false)}
          />

          <div className="fixed sm:absolute top-14 sm:top-full right-3 sm:right-0 left-3 sm:left-auto mt-2 max-w-sm sm:w-96 mx-auto sm:mx-0 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-fadeIn">
            
            {/* Header */}
            <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition flex items-center gap-1 border border-red-200"
                  title="Clear All Notifications"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 sm:p-4 transition flex gap-3 ${
                      !n.is_read ? "bg-blue-50/60" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}