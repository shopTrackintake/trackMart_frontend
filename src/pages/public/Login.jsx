import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../../context/AuthContext";
import { loginUser } from "../../services/authService";
import { Link } from "react-router-dom";
export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        alert("Please fill all fields");
        return;
      }

      setLoading(true);

      const res = await loginUser({ email, password });

      const token = res.data.token;

      login(token);

      const decoded = jwtDecode(token);

      if (decoded.role === "admin") navigate("/admin");
      else if (decoded.role === "vendor") navigate("/vendor");
      else navigate("/customer");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">

      <div className="bg-bgSurface border border-borderDefault shadow-card rounded-2xl p-10 w-full max-w-md">

        <h2 className="text-3xl font-primary font-bold text-textStrong text-center">
          Welcome Back
        </h2>

        <p className="text-textMuted text-center mt-2 mb-8">
          Login to continue to NutriMarket
        </p>

        {/* Email */}
        <input
          className="w-full border border-borderDefault rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-primary transition"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          className="w-full border border-borderDefault rounded-xl px-4 py-3 mb-6 focus:outline-none focus:border-primary transition"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primaryHover transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="text-center mt-6 text-sm text-textMuted">
  Don't have an account?{" "}
  <Link
    to="/register"
    className="text-primary font-semibold hover:underline"
  >
    Register
  </Link>
</div>

      </div>

    </div>
  );
}