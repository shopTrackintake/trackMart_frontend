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
      const decoded = jwtDecode(storedToken);
      setRole(decoded.role);
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  /* ================= LOGIN ================= */
  const login = (newToken) => {
    localStorage.setItem("token", newToken);

    const decoded = jwtDecode(newToken);

    setRole(decoded.role);
    setToken(newToken);
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