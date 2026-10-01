import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
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
        } else {
          setRole(decoded.role);
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Invalid token format in storage:", error);
        localStorage.removeItem("token");
        setRole(null);
        setToken(null);
      }
    }

    setLoading(false);
  }, []);

  /* ================= LISTEN FOR 401/403 INTERCEPTOR ================= */
  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem("token");
      setRole(null);
      setToken(null);
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
    } catch (error) {
      console.error("Failed to decode token on login:", error);
      localStorage.removeItem("token");
      setRole(null);
      setToken(null);
    }
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("token");
    setRole(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        token,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}