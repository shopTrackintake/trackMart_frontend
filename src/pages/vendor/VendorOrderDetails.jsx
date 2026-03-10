import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Footer from "../../components/Footer";
export default function VendorOrderDetails(){

const { id } = useParams();

const [order,setOrder] = useState(null);
const [items,setItems] = useState([]);
const [date,setDate] = useState("");
const [showFullAddress,setShowFullAddress] = useState(false);


/* ================= FETCH ORDER ================= */

const fetchOrder = async()=>{

try{

const res = await api.get(`/vendor/orders/${id}`);

setOrder(res.data.order);
setItems(res.data.items);

}catch(err){

console.log(err);

}

};

useEffect(()=>{

fetchOrder();

},[id]);



/* ================= CONFIRM ORDER ================= */

const confirmOrder = async()=>{

try{

if(!date){
alert("Please select delivery date");
return;
}

const today = new Date().toISOString().split("T")[0];

if(date < today){
alert("Please select present or future date");
return;
}

const res = await api.put(`/vendor/orders/${id}/confirm`,{
delivery_date:date
});

setOrder(res.data.order);

alert("Order confirmed");

}catch(err){

console.log(err);

}

};



/* ================= MARK DELIVERED ================= */

const markDelivered = async()=>{

try{

const res = await api.put(`/vendor/orders/${id}/deliver`);

setOrder(res.data.order);

alert("Order delivered");

}catch(err){

console.log(err);

}

};



if(!order) return <p>Loading...</p>;



return(

<div className="space-y-6">

<h1 className="text-2xl font-bold">
Order Details
</h1>


{/* ================= STATUS ================= */}

<div className="border p-4 rounded-xl flex justify-between">

<p className="font-semibold">
Order ID: {order.id.slice(0,8)}
</p>

<span
className={`px-3 py-1 rounded-full text-xs font-semibold ${
order.order_status==="delivered"
? "bg-green-200 text-green-800"
: order.order_status==="confirmed"
? "bg-blue-200 text-blue-800"
: "bg-yellow-200 text-yellow-800"
}`}
>

{order.order_status==="delivered"
? "Delivered"
: order.order_status==="confirmed"
? "Confirmed"
: "Pending"}

</span>

</div>



{/* ================= CUSTOMER ================= */}

<div className="border p-6 rounded-xl space-y-3">

<p><b>Customer:</b> {order.customer_name}</p>

<p><b>User ID:</b> {order.customer_id}</p>

<p><b>Phone:</b> {order.phone}</p>



{/* ADDRESS */}

<div
className="mt-4 border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
onClick={()=>setShowFullAddress(!showFullAddress)}
>

<div className="flex justify-between">

<p className="font-semibold">
Delivery Address
</p>

<span>{showFullAddress ? "▲" : "▼"}</span>

</div>

<p className="text-xs text-gray-400">
Click to view full address
</p>


{!showFullAddress ? (

<p className="text-sm mt-2">
{order.city}, {order.state} - {order.pincode}
</p>

) : (

<div className="mt-3 text-sm space-y-1">

<p><b>House No:</b> {order.house_no}</p>
<p><b>Street:</b> {order.street}</p>
<p><b>Locality:</b> {order.locality}</p>
<p><b>City:</b> {order.city}</p>
<p><b>State:</b> {order.state}</p>
<p><b>Pincode:</b> {order.pincode}</p>

</div>

)}

</div>

</div>



{/* ================= PRODUCTS ================= */}

<div className="space-y-3">

<h2 className="font-semibold">Products</h2>

{items.map(item=>(

<div
key={item.id}
className="border p-4 rounded-lg flex justify-between"
>

<div>

<p className="font-medium">
{item.title}
</p>

<p className="text-sm text-gray-500">
Qty: {item.quantity}
</p>

</div>

<p className="font-semibold">
₹{item.price_at_purchase}
</p>

</div>

))}

</div>
{/* ================= ACTION ================= */}

<div className="border p-6 rounded-xl space-y-4">

{/* DELIVERED */}

{order.order_status === "delivered" && (

<div className="bg-green-100 p-4 rounded">

<p className="text-green-700 font-semibold">
Order Delivered
</p>

</div>

)}



{/* CONFIRMED */}

{order.order_status === "confirmed" && (

<div className="space-y-3">

<p className="text-blue-700 font-semibold">
Order Confirmed
</p>

<p className="text-sm">
Delivery Date: {order.delivery_date
? new Date(order.delivery_date).toLocaleDateString()
: "Not set"}
</p>

<button
onClick={markDelivered}
className="bg-green-600 text-white px-6 py-2 rounded-xl"
>
Mark as Delivered
</button>

</div>

)}



{/* PENDING / DEFAULT */}

{order.order_status !== "confirmed" && order.order_status !== "delivered" && (

<div className="space-y-3">

<p className="font-semibold">
Select Delivery Date
</p>

<input
type="date"
value={date}
min={new Date().toISOString().split("T")[0]}
onChange={(e)=>setDate(e.target.value)}
className="border p-2 rounded w-full"
/>

<button
onClick={confirmOrder}
className="bg-primary text-white px-6 py-2 rounded-xl"
>
Confirm Order
</button>

</div>

)}

</div>
<Footer/>
</div>

);

}