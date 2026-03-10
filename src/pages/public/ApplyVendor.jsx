import { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function ApplyVendor() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    business_name: "",
    phone: "",
    shop_address: "",
    upi_id: ""
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await api.post("/auth/register", {
        ...form,
        role: "vendor"
      });

      alert("Vendor application submitted. Wait for admin approval.");

      navigate("/login");

    } catch (err) {

      alert(err.response?.data?.message || "Registration failed");

    }

  };

  return (

    <div className="min-h-[80vh] flex items-center justify-center">

      <div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-10 w-full max-w-md">

        {/* Header */}

        <div className="mb-8">

          <h2 className="text-2xl font-primary font-bold text-textStrong">
            Become a Vendor
          </h2>

          <p className="text-textDefault mt-2">
            Start selling your health-focused products.
          </p>

        </div>

        {/* Form */}

        <form onSubmit={handleSubmit} className="space-y-5">

          <input
            required
            placeholder="Full Name"
            className="w-full border border-borderDefault rounded-xl px-4 py-3"
            onChange={(e)=>setForm({...form,name:e.target.value})}
          />

          <input
            required
            placeholder="Business Name"
            className="w-full border border-borderDefault rounded-xl px-4 py-3"
            onChange={(e)=>setForm({...form,business_name:e.target.value})}
          />

          <input
            required
            type="email"
            placeholder="Email Address"
            className="w-full border border-borderDefault rounded-xl px-4 py-3"
            onChange={(e)=>setForm({...form,email:e.target.value})}
          />

          {/* PHONE */}

          <input
            required
            placeholder="Phone Number"
            className="w-full border border-borderDefault rounded-xl px-4 py-3"
            onChange={(e)=>setForm({...form,phone:e.target.value})}
          />

          {/* ADDRESS */}

          <textarea
            required
            placeholder="Shop Address"
            className="w-full border border-borderDefault rounded-xl px-4 py-3"
            onChange={(e)=>setForm({...form,shop_address:e.target.value})}
          />

          {/* UPI */}

          <input
            required
            placeholder="UPI ID"
            className="w-full border border-borderDefault rounded-xl px-4 py-3"
            onChange={(e)=>setForm({...form,upi_id:e.target.value})}
          />

          <input
            required
            type="password"
            placeholder="Password"
            className="w-full border border-borderDefault rounded-xl px-4 py-3"
            onChange={(e)=>setForm({...form,password:e.target.value})}
          />

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primaryHover"
          >
            Submit Application
          </button>

        </form>

      </div>

    </div>

  );

}