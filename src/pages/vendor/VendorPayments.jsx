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

const fetchVendor = async()=>{

try{

const res = await api.get("/vendor/details");
setVendor(res.data);

}catch(err){
console.log(err);
}

};

fetchPayments();
fetchVendor();

},[]);

return(

<div className="space-y-10">

{/* PAGE TITLE */}

<h1 className="text-3xl font-bold">
My Earnings
</h1>


{/* SUMMARY */}

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

<div className="bg-bgSurface border border-borderDefault rounded-xl p-6">

<p className="text-textMuted">
Received
</p>

<p className="text-2xl font-bold text-green-600">
₹{data.received}
</p>

</div>


<div className="bg-bgSurface border border-borderDefault rounded-xl p-6">

<p className="text-textMuted">
Pending
</p>

<p className="text-2xl font-bold text-yellow-600">
₹{data.pending}
</p>

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

</div>

</div>

))}

</div>

</div>

);

}