import { useEffect,useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminVendorPayments(){

const [vendors,setVendors] = useState([]);
const navigate = useNavigate();

useEffect(()=>{

const fetchData = async()=>{
try{
const res = await api.get("/admin/vendor-earnings");
setVendors(res.data);
}catch(err){
console.log(err);
}
};

fetchData();

},[]);

const clearPayment = async(id)=>{

try{
await api.post(`/admin/vendor-payout/${id}`);
setVendors(prev=>prev.filter(v=>v.vendor_id!==id));
}catch(err){
console.log(err);
}

};

return(

<div className="space-y-6 md:space-y-8 max-w-5xl mx-auto px-4">

<h1 className="text-2xl md:text-3xl font-bold">
Vendor Weekly Payments
</h1>

{vendors.length===0 && (
<p className="text-textMuted text-sm md:text-base">
No pending payouts
</p>
)}

{vendors.map(v=>(

<div
key={v.vendor_id}
onClick={()=>navigate(`/admin/vendors/${v.vendor_id}`)}
className="bg-bgSurface border border-borderDefault rounded-xl p-4 md:p-6 cursor-pointer hover:bg-bgSurfaceAlt flex flex-col md:flex-row md:justify-between md:items-center gap-4"
>

{/* LEFT SIDE */}
<div className="space-y-1">

<h2 className="font-semibold text-base md:text-lg">
{v.business_name}
</h2>

<p className="text-green-600 font-semibold text-base md:text-lg">
₹{Number(v.total_earning || 0)}
</p>

</div>

{/* RIGHT SIDE BUTTON */}
<div className="w-full md:w-auto">

<button
onClick={(e)=>{
e.stopPropagation();
clearPayment(v.vendor_id);
}}
className="w-full md:w-[200px] h-10 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primaryHover"
>
Clear Weekly Payment
</button>

</div>

</div>

))}

</div>

);

}