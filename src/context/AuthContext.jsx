import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import socket from "../services/socket";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        // Check if token is expired (exp is in seconds)
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn("Session token expired. Logging out.");
          localStorage.removeItem("token");
          setRole(null);
          setToken(null);
          setUser(null);
        } else {
          setRole(decoded.role);
          setToken(storedToken);
          setUser({ id: decoded.id, role: decoded.role });
        }
      } catch (error) {
        console.error("Invalid token format in storage:", error);
        localStorage.removeItem("token");
        setRole(null);
        setToken(null);
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  /* ================= REAL-TIME SOCKET CONNECTION ================= */
  useEffect(() => {
    if (user && user.id) {
      if (!socket.connected) {
        socket.connect();
      }

      const joinRoom = () => {
        socket.emit("join_user_room", user.id);
      };

      if (socket.connected) {
        joinRoom();
      } else {
        socket.on("connect", joinRoom);
      }

      return () => {
        socket.off("connect", joinRoom);
      };
    } else {
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }, [user]);

  /* ================= LISTEN FOR 401/403 INTERCEPTOR ================= */
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("token");
      setRole(null);
      setToken(null);
      setUser(null);
      if (socket.connected) {
        socket.disconnect();
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  /* ================= LOGIN ================= */
  const login = (newToken) => {
    try {
      localStorage.setItem("token", newToken);
      const decoded = jwtDecode(newToken);
      setRole(decoded.role);
      setToken(newToken);
      setUser({ id: decoded.id, role: decoded.role });
    } catch (error) {
      console.error("Failed to decode token on login:", error);
      localStorage.removeItem("token");
      setRole(null);
      setToken(null);
      setUser(null);
    }
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("token");
    setRole(null);
    setToken(null);
    setUser(null);
    if (socket.connected) {
      socket.disconnect();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        token,
        user,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}