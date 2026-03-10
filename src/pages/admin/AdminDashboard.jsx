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
    <div className="space-y-10">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-primary font-bold text-textStrong">
          Admin Dashboard
        </h1>
        <p className="text-textDefault mt-2">
          Monitor vendors, platform health and revenue insights.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Total Vendors */}
        <div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-6 shadow-card">
          <h3 className="text-textMuted text-sm font-semibold">
            Total Vendors
          </h3>
          <p className="text-3xl font-bold text-textStrong mt-2">
            {stats.vendors}
          </p>
        </div>

        {/* Pending Approvals */}
        <div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-6 shadow-card">
          <h3 className="text-textMuted text-sm font-semibold">
            Pending Approvals
          </h3>
          <p className="text-3xl font-bold text-warningText mt-2">
            {stats.pending}
          </p>
        </div>

        {/* Platform Revenue */}
        <div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-6 shadow-card">
          <h3 className="text-textMuted text-sm font-semibold">
            Platform Revenue
          </h3>
          <p className="text-3xl font-bold text-primary mt-2">
            ₹{stats.revenue}
          </p>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="bg-bgSurface border border-borderDefault rounded-2xl p-8 shadow-card">
        <h2 className="text-xl font-primary font-semibold text-textStrong mb-6">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-6">

         <button
onClick={()=>navigate("/admin/approve-vendors")}
className={`px-6 py-3 rounded-xl transition ${
location.pathname === "/admin/approve-vendors"
? "bg-orange-500 text-white"
: "bg-primary text-white hover:bg-primaryHover"
}`}
>
View Pending Vendors
</button>


          <button 
          onClick={()=>navigate("/admin/products")}
          className={`px-6 py-3 rounded-xl transition ${
location.pathname === "/admin/products"
? "bg-orange-500 text-white"
: "border border-primary text-primary hover:bg-primary hover:text-white"
}`}
>
Manage Products
</button>


          <button
onClick={()=>navigate("/admin/orders")}
className={`px-6 py-3 rounded-xl transition ${
location.pathname === "/admin/orders"
? "bg-orange-500 text-white"
: "border border-primary text-primary hover:bg-primary hover:text-white"
}`}
>
View Orders
</button>


<button
onClick={()=>navigate("/admin/vendor-payments")}
className={`px-6 py-3 rounded-xl transition ${
location.pathname === "/admin/vendor-payments"
? "bg-orange-500 text-white"
: "border border-primary text-primary hover:bg-primary hover:text-white"
}`}
>
Vendor Payments
</button>


<button
onClick={()=>navigate("/admin/support")}
className={`px-6 py-3 rounded-xl transition ${
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