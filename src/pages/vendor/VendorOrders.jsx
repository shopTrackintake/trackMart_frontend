import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Footer from "../../components/Footer";
export default function VendorOrders(){

const [orders,setOrders] = useState([]);
const [loading,setLoading] = useState(true);


/* ================= FETCH ORDERS ================= */

useEffect(()=>{

const fetchOrders = async()=>{

try{

const res = await api.get("/vendor/orders");

setOrders(res.data);

}catch(err){

console.log("Orders Error:",err);

}

finally{

setLoading(false);

}

};

fetchOrders();

},[]);



/* ================= LOADING ================= */

if(loading){
return (
<div className="p-6">
<p className="text-gray-500">Loading orders...</p>
</div>
);
}



/* ================= UI ================= */

return(

<div className="space-y-8 p-6">

<h1 className="text-3xl font-bold">
Orders Received
</h1>


{orders.length === 0 && (

<div className="border p-6 rounded-xl text-gray-500">
No orders received yet
</div>

)}



{orders.map(order=>(

<div
key={order.order_id}
className="border p-6 rounded-2xl shadow-sm"
>


{/* ================= HEADER ================= */}

<div className="flex justify-between items-center mb-4">

<div>

<p className="font-semibold">
Order ID: {order.order_id?.slice(0,8)}
</p>

<p className="text-sm text-gray-500">
{order.created_at
? new Date(order.created_at).toLocaleDateString()
: ""}
</p>

</div>


{/* STATUS BADGE */}

<span
className={`px-3 py-1 rounded-full text-xs font-semibold ${
order.order_status === "delivered"
? "bg-green-200 text-green-800"
: order.order_status === "confirmed"
? "bg-blue-200 text-blue-800"
: "bg-yellow-200 text-yellow-800"
}`}
>

{order.order_status === "delivered"
? "Delivered"
: order.order_status === "confirmed"
? "Confirmed"
: "Pending"}

</span>

</div>



{/* ================= PRODUCT ================= */}

<div className="border-t pt-3">

<p className="font-medium">
{order.product_title || "Deleted Product"}
</p>

<p className="text-sm text-gray-500">
Quantity: {order.quantity}
</p>

<p className="text-sm text-gray-600">
Vendor Earning: ₹{order.vendor_earning}
</p>

</div>



{/* ================= DETAILS BUTTON ================= */}

<div className="mt-4">

<Link
to={`/vendor/orders/${order.order_id}`}
className="text-primary font-semibold hover:underline"
>

View Details

</Link>

</div>

</div>

))}
<Footer/>
</div>

);

}