import { useEffect,useState } from "react";
import api from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminDashboard() {

const navigate = useNavigate();
const location = useLocation();

const [stats,setStats] = useState({
vendors:0,
pending:0,
revenue:0
});

useEffect(()=>{

const fetchStats = async()=>{

try{
const res = await api.get("/admin/stats");
setStats(res.data);
}catch(err){
console.log(err);
}

};

fetchStats();

},[]);

  return (
    <div className="space-y-8 md:space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-primary font-bold text-textStrong">
          Admin Dashboard
        </h1>
        <p className="text-textDefault mt-2 text-sm md:text-base">
          Monitor vendors, platform health and revenue insights.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">

        <div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-4 md:p-6 shadow-card">
          <h3 className="text-textMuted text-sm font-semibold">
            Total Vendors
          </h3>
          <p className="text-2xl md:text-3xl font-bold text-textStrong mt-2">
            {stats.vendors}
          </p>
        </div>

        <div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-4 md:p-6 shadow-card">
          <h3 className="text-textMuted text-sm font-semibold">
            Pending Approvals
          </h3>
          <p className="text-2xl md:text-3xl font-bold text-warningText mt-2">
            {stats.pending}
          </p>
        </div>

        <div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-4 md:p-6 shadow-card">
          <h3 className="text-textMuted text-sm font-semibold">
            Platform Revenue
          </h3>
          <p className="text-2xl md:text-3xl font-bold text-primary mt-2">
            ₹{stats.revenue}
          </p>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-bgSurface border border-borderDefault rounded-2xl p-4 md:p-8 shadow-card">
        <h2 className="text-lg md:text-xl font-primary font-semibold text-textStrong mb-4 md:mb-6">
          Quick Actions
        </h2>

        {/* 🔥 RESPONSIVE GRID BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <button
            onClick={()=>navigate("/admin/approve-vendors")}
            className={`w-full h-12 flex items-center justify-center rounded-xl transition ${
              location.pathname === "/admin/approve-vendors"
              ? "bg-orange-500 text-white"
              : "bg-primary text-white hover:bg-primaryHover"
            }`}
          >
            View Pending Vendors
          </button>

          <button 
            onClick={()=>navigate("/admin/products")}
            className={`w-full h-12 flex items-center justify-center rounded-xl transition ${
              location.pathname === "/admin/products"
              ? "bg-orange-500 text-white"
              : "border border-primary text-primary hover:bg-primary hover:text-white"
            }`}
          >
            Manage Products
          </button>

          <button
            onClick={()=>navigate("/admin/orders")}
            className={`w-full h-12 flex items-center justify-center rounded-xl transition ${
              location.pathname === "/admin/orders"
              ? "bg-orange-500 text-white"
              : "border border-primary text-primary hover:bg-primary hover:text-white"
            }`}
          >
            View Orders
          </button>

          <button
            onClick={()=>navigate("/admin/vendor-payments")}
            className={`w-full h-12 flex items-center justify-center rounded-xl transition ${
              location.pathname === "/admin/vendor-payments"
              ? "bg-orange-500 text-white"
              : "border border-primary text-primary hover:bg-primary hover:text-white"
            }`}
          >
            Vendor Payments
          </button>

          <button
            onClick={()=>navigate("/admin/support")}
            className={`w-full h-12 flex items-center justify-center rounded-xl transition ${
              location.pathname === "/admin/support"
              ? "bg-orange-500 text-white"
              : "border border-primary text-primary hover:bg-primary hover:text-white"
            }`}
          >
            Customer Support
          </button>

        </div>
      </div>

    </div>
  );
}