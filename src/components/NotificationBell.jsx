import { useEffect, useState } from "react";
import api from "../services/api";

export default function NotificationBell() {

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

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


  /* ================= MARK AS READ ================= */

  const markAsRead = async (id) => {

    try {

      await api.put(`/notifications/${id}/read`);

      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );

    } catch (err) {
      console.log(err);
    }

  };


  /* ================= UNREAD COUNT ================= */

  const unreadCount = notifications.filter(n => !n.is_read).length;


  return (

    <div className="relative">

      {/* Bell Icon */}

      <button
        onClick={() => setOpen(!open)}
        className="relative text-xl"
      >

        🔔

        {unreadCount > 0 && (

          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
            {unreadCount}
          </span>

        )}

      </button>


      {/* Dropdown */}

      {open && (

        <div className="absolute right-0 mt-3 w-80 bg-white border border-borderDefault rounded-xl shadow-lg z-50">

          <div className="p-3 border-b font-semibold">
            Notifications
          </div>


          <div className="max-h-80 overflow-y-auto">

            {notifications.length === 0 && (

              <p className="p-4 text-gray-500 text-sm">
                No notifications
              </p>

            )}


            {notifications.map(n => (

              <div
                key={n.id}
                className={`p-4 border-b hover:bg-gray-50 ${
                  !n.is_read ? "bg-blue-50" : ""
                }`}
              >

                <p className="font-semibold text-sm">
                  {n.title}
                </p>

                <p className="text-xs text-gray-600">
                  {n.message}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>


                {!n.is_read && (

                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-xs text-primary mt-2"
                  >
                    Mark as read
                  </button>

                )}

              </div>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}