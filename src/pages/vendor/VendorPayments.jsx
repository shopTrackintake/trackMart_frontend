import { useEffect, useState } from "react";
import api from "../../services/api";

export default function VendorPayments(){

const [data,setData] = useState({
received:0,
pending:0,
history:[]
});

const [vendor,setVendor] = useState(null);

useEffect(()=>{

const fetchPayments = async()=>{
  

try{

const res = await api.get("/vendor/payments");
setData(res.data);

}catch(err){
console.log(err);
}

};


fetchPayments();


},[]);
  const netPending = (data.pending || 0) - (data.dues || 0);
  const handlePayDues = async () => {
  try {

    // 🔥 create order
    const { data: orderRes } = await api.post("/payment/create-order", {
      amount: Math.abs(netPending),
      type: "vendor_due"
    });

    const order = orderRes.order;

    const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,  // ⚠️ replace
      amount: order.amount,
      currency: "INR",
      order_id: order.id,
      name: "TrackMart Vendor Dues",
      description: "Clear your dues",

      handler: async function (response) {

        // 🔥 verify payment
        await api.post("/payment/verify", {
  razorpay_order_id: response.razorpay_order_id,
  razorpay_payment_id: response.razorpay_payment_id,
  razorpay_signature: response.razorpay_signature,
  type: "vendor_due",
  amount: Math.abs(netPending)   // 🔥 IMPORTANT
});

        alert("Dues cleared successfully");

        // 🔥 refresh UI (simple way)
        window.location.reload();
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.log(err);
  }
};

return(

<div className="space-y-10">

{/* PAGE TITLE */}

<h1 className="text-3xl font-bold">
My Earnings
</h1>
{/* 🔥 ADD THIS */}
{netPending < 0 && (
  <p className="text-red-500 font-medium">
    ⚠ You have pending dues. Clear them to receive payouts.
  </p>
)}

{/* SUMMARY */}

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

<div className="bg-bgSurface border border-borderDefault rounded-xl p-6">
<p className="text-textMuted">Received</p>
<p className="text-2xl font-bold text-green-600">
₹{data.received}
</p>
</div>

<div className="bg-bgSurface border border-borderDefault rounded-xl p-6">
<p className="text-textMuted">Pending</p>
<p className="text-2xl font-bold text-yellow-600">
₹{Math.max(0, netPending)}
</p>
</div>

{/* 🔥 ADD THIS HERE */}
<div className="bg-bgSurface border border-borderDefault rounded-xl p-6">
<p className="text-textMuted">Dues</p>

<p className="text-2xl font-bold text-red-600">
₹{netPending < 0 ? Math.abs(netPending) : 0}
</p>

{/* 🔥 PAY DUES BUTTON */}
{netPending < 0 && (
  <button
    onClick={handlePayDues}
    className="mt-3 w-full bg-red-500 text-white py-2 rounded-lg"
  >
    Pay Dues
  </button>
)}
</div>

</div>


{/* SHOP DETAILS */}

{vendor && (

<div className="bg-bgSurface border border-borderDefault rounded-xl p-6 space-y-3">

<h2 className="text-xl font-semibold">
My Shop Details
</h2>

<p>
<b>Business:</b> {vendor.business_name}
</p>

<p>
<b>Phone:</b> {vendor.phone}
</p>

<p>
<b>Address:</b> {vendor.shop_address}
</p>

<p>
<b>UPI ID:</b> {vendor.upi_id}
</p>

</div>

)}


{/* PAYMENT HISTORY */}

<div className="space-y-4">

<h2 className="text-xl font-semibold">
Payment History
</h2>

{data.history.length === 0 && (

<p className="text-textMuted">
No payments yet
</p>

)}

{data.history.map((p,i)=>(

<div
key={i}
className="bg-bgSurface border border-borderDefault rounded-xl p-6 flex justify-between items-center"
>

<div>

<p className="font-semibold">
{p.product_title}
</p>

<p className="text-sm text-textMuted">
{new Date(p.created_at).toLocaleDateString()}
</p>

</div>


<div className="text-right">

<p className="font-semibold">
₹{p.vendor_earning}
</p>

<p
className={`text-sm ${
p.payout_status==="paid"
? "text-green-600"
: "text-yellow-600"
}`}
>

{p.payout_status==="paid"
? "Paid"
: "Pending"}

</p>
  {/* 🔥 ADD THIS HERE */}
{p.payout_status==="paid" && p.payout_reference && (
  <p className="text-xs text-textMuted">
    Ref: {p.payout_reference}
  </p>
)}
</div>

</div>

))}

</div>

</div>

);

}
