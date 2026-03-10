import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerUser } from "../../services/authService";

export default function RegisterCustomer() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {

      if (!form.name || !form.email || !form.password) {
        alert("Please fill all fields");
        return;
      }

      setLoading(true);

      await registerUser({
        ...form,
        role: "customer"
      });

      alert("Registration successful!");
      navigate("/login");

    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">

      <div className="bg-bgSurface border border-borderDefault shadow-card rounded-2xl p-10 w-full max-w-md">

        <h2 className="text-3xl font-primary font-bold text-textStrong text-center">
          Create Account
        </h2>

        <p className="text-textMuted text-center mt-2 mb-8">
          Join NutriMarket and shop smarter.
        </p>

        {/* Name */}
        <input
          value={form.name || ""}
          placeholder="Full Name"
          className="w-full border border-borderDefault rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-primary transition"
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        {/* Email */}
        <input
          value={form.email}
          type="email"
          placeholder="Email"
          className="w-full border border-borderDefault rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-primary transition"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* Password */}
        <input
          value={form.password}
          type="password"
          placeholder="Password"
          className="w-full border border-borderDefault rounded-xl px-4 py-3 mb-6 focus:outline-none focus:border-primary transition"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primaryHover transition disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        {/* Vendor CTA */}
        <p className="mt-6 text-sm text-center text-textMuted">
          Want to sell on our platform?{" "}
          <Link
            to="/apply-vendor"
            className="text-primary font-semibold hover:underline"
          >
            Apply as Vendor
          </Link>
        </p>

      </div>
    </div>
  );
}