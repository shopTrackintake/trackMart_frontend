import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function CustomerDashboard() {

const navigate = useNavigate();

const [stats,setStats] = useState({
totalOrders:0,
healthy:0,
unhealthy:0,
recent:[]
});

const [loading,setLoading] = useState(true);


/* ================= FETCH DASHBOARD DATA ================= */

useEffect(()=>{

const fetchStats = async()=>{

  try{

    const res = await api.get("/customer/dashboard-stats");

    setStats(res.data);

  }catch(err){

    console.log("Dashboard error:",err);

  }finally{

    setLoading(false);

  }

};

fetchStats();

},[]);


return (

<div className="space-y-10">


{/* ================= HEADER ================= */}

<div className="flex justify-between items-center">

<div>

<h1 className="text-3xl font-primary font-bold text-textStrong">
My Dashboard
</h1>

<p className="text-textDefault mt-2">
Track your orders and health-conscious purchases.
</p>

</div>


{/* SUPPORT BUTTON */}

<button
onClick={()=>navigate("/support")}
className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl shadow hover:bg-primaryHover transition font-semibold"
>
💬 Contact Support
</button>

</div>



{/* ================= STATS ================= */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-8">

<div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-6 shadow-card">

<h3 className="text-textMuted text-sm font-semibold">
Total Orders
</h3>

<p className="text-3xl font-bold text-textStrong mt-2">
{loading ? "..." : stats.totalOrders}
</p>

</div>



<div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-6 shadow-card">

<h3 className="text-textMuted text-sm font-semibold">
Healthy Purchases
</h3>

<p className="text-3xl font-bold text-successText mt-2">
{loading ? "..." : stats.healthy}
</p>

</div>



<div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-6 shadow-card">

<h3 className="text-textMuted text-sm font-semibold">
Unhealthy Purchases
</h3>

<p className="text-3xl font-bold text-dangerText mt-2">
{loading ? "..." : stats.unhealthy}
</p>

</div>

</div>



{/* ================= RECENT ORDERS ================= */}

<div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-8">

<h2 className="text-xl font-primary font-semibold text-textStrong mb-6">
Recent Orders
</h2>


{loading ? (

<p className="text-textMuted">
Loading orders...
</p>

) : stats.recent.length === 0 ? (

<p className="text-textMuted">
No orders yet.
</p>

) : (

<div className="space-y-4">

{stats.recent.map((order,i)=>(

<div
key={i}
className="flex justify-between items-center border-b border-borderDefault pb-4"
>

<div>

<p className="font-semibold text-textStrong">
{order.title}
</p>

<p className="text-textMuted text-sm">
Ordered on {new Date(order.created_at).toLocaleDateString()}
</p>

</div>

<div className="text-right">

<p className="text-primary font-semibold">
₹{order.total_amount}
</p>

<p className="text-xs text-textMuted">
Qty: {order.quantity}
</p>

</div>

</div>

))}

</div>

)}

</div>

</div>

);

}