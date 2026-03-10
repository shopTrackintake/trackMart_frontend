import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { role, loading } = useContext(AuthContext);

  // ⏳ Wait until auth state loads
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgApp">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!role) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(role))
    return <Navigate to="/" replace />;

  return children;
}