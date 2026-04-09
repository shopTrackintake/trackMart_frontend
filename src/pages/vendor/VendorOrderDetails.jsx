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
const [otp, setOtp] = useState("");
const [askOtp, setAskOtp] = useState(false);

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
const confirmOrder = async () => {
  try {

    if (!date) {
      alert("Please select delivery date");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    if (date < today) {
      alert("Please select present or future date");
      return;
    }

    const pendingItems = items.filter(i => i.item_status === "pending");

    const item = pendingItems[0];

    if (!item) {
      alert("No pending item found");
      return;
    }

    await api.patch("/vendor/confirm-item", {
      item_id: item.id,
      delivery_date: date
    });

    alert("Item confirmed & OTP sent");

    fetchOrder();

  } catch (err) {
    console.log(err);
    alert(err.response?.data?.message || "Failed to confirm");
  }
};

/* ================= MARK DELIVERED ================= */
const handleDeliverClick = async () => {

  if (!askOtp) {
    setAskOtp(true);
    return;
  }

  try {

    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    const item = items.find(i => i.item_status === "confirmed");

    if (!item) {
      alert("No confirmed item found");
      return;
    }

    await api.patch("/vendor/deliver-item", {
      item_id: item.id,
      otp
    });

    alert("Item delivered successfully");

    setOtp("");
    setAskOtp(false);
    fetchOrder();

  } catch (err) {
    console.log(err);
    alert(err.response?.data?.message || "Delivery failed");
  }
};

if(!order) return <p>Loading...</p>;


const hasPending = items.some(i => i.item_status === "pending");
const hasConfirmed = items.some(i => i.item_status === "confirmed");
const allDelivered = items.every(i => i.item_status === "delivered");
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

{(() => {

  if (items.length === 0) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
        No Items
      </span>
    );
  }

  const allDelivered = items.every(i => i.item_status === "delivered");
  const anyDelivered = items.some(i => i.item_status === "delivered");
  const anyConfirmed = items.some(i => i.item_status === "confirmed");

  let status = "Pending";
  let style = "bg-yellow-200 text-yellow-800";

  if (allDelivered) {
    status = "Delivered";
    style = "bg-green-200 text-green-800";
  } else if (anyDelivered) {
    status = "Partially Delivered";
    style = "bg-blue-200 text-blue-800";
  } else if (anyConfirmed) {
    status = "Confirmed";
    style = "bg-blue-200 text-blue-800";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
})()}

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

<p className="text-xs text-gray-400">
  Delivery: {item.delivery_date 
    ? new Date(item.delivery_date).toLocaleDateString()
    : "Not set"}
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

{/* ✅ DELIVER BUTTON */}

{!hasPending && hasConfirmed && !allDelivered && (
  <div className="space-y-3">

    {/* OTP INPUT (click ke baad hi dikhega) */}
    {askOtp && (
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e)=>setOtp(e.target.value)}
        className="border p-2 rounded w-full"
      />
    )}

    {/* SAME BUTTON */}
    <button
      onClick={handleDeliverClick}
      className="bg-green-600 text-white px-6 py-2 rounded-xl"
    >
      {askOtp ? "Verify & Deliver" : "Mark as Delivered"}
    </button>

  </div>
)}

{/* ✅ CONFIRM BUTTON */}

{hasPending && (
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

{/* ✅ ALL DONE MESSAGE */}

{allDelivered && (
  <p className="text-green-600 font-semibold">
    All items delivered
  </p>
)}

</div>

{/* PENDING / DEFAULT */}


<Footer/>
</div>

);

}