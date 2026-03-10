import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminOrders() {

const [orders,setOrders] = useState([]);

useEffect(()=>{

const fetchOrders = async()=>{

try{

const res = await api.get("/admin/orders");
setOrders(res.data);

}catch(err){
console.log(err);
}

};

fetchOrders();

},[]);

const getStatusBadge = (status)=>{

if(status === "placed")
return "bg-yellow-100 text-yellow-800";

if(status === "confirmed")
return "bg-blue-100 text-blue-800";

if(status === "delivered")
return "bg-green-100 text-green-800";

return "bg-gray-100 text-gray-700";

};

return(

<div className="space-y-10">

{/* Header */}

<div>

<h1 className="text-3xl font-primary font-bold text-textStrong">
Orders Management
</h1>

<p className="text-textMuted mt-2">
View and monitor all platform orders.
</p>

</div>


{/* Orders Table */}

<div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card overflow-hidden">

<table className="w-full">

<thead className="bg-bgSurfaceAlt border-b border-borderDefault">

<tr className="text-left text-sm text-textMuted">

<th className="px-6 py-4">Vendor</th>
<th className="px-6 py-4">Product</th>
<th className="px-6 py-4">Quantity</th>
<th className="px-6 py-4">Price</th>
<th className="px-6 py-4">Status</th>

</tr>

</thead>

<tbody>

{orders.map(o=>(

<tr
key={o.order_id}
className="border-b border-borderDefault hover:bg-bgSurfaceAlt transition"
>

<td className="px-6 py-4 font-semibold text-textStrong">
{o.business_name}
</td>

<td className="px-6 py-4 text-textDefault">
{o.product_name}
</td>

<td className="px-6 py-4 text-textDefault">
{o.quantity}
</td>

<td className="px-6 py-4 font-semibold text-textStrong">
₹{o.price_at_purchase}
</td>

<td className="px-6 py-4">

<span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(o.order_status)}`}>
{o.order_status}
</span>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

);

}