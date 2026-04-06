import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

export default function AdminVendorDetails(){

const { id } = useParams();
const [vendor,setVendor] = useState(null);

useEffect(()=>{

const fetchVendor = async()=>{
try{
const res = await api.get(`/admin/vendors/${id}`);
setVendor(res.data);
}catch(err){
console.log(err);
}
};

fetchVendor();

},[id]);

if(!vendor) return <p className="text-center mt-10">Loading...</p>;

return(

<div className="space-y-6 md:space-y-8 max-w-4xl mx-auto px-4">

<h1 className="text-2xl md:text-3xl font-bold">
Vendor Details
</h1>

<div className="bg-bgSurface border border-borderDefault rounded-2xl p-4 md:p-8">

{/* 🔥 GRID LAYOUT */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">

<div>
<p className="text-sm text-textMuted">Business Name</p>
<p className="font-semibold">{vendor.business_name}</p>
</div>

<div>
<p className="text-sm text-textMuted">Owner Name</p>
<p className="font-semibold">{vendor.name}</p>
</div>

<div>
<p className="text-sm text-textMuted">Email</p>
<p className="font-semibold break-words">{vendor.email}</p>
</div>

<div>
<p className="text-sm text-textMuted">Phone</p>
<p className="font-semibold">{vendor.phone}</p>
</div>

<div className="sm:col-span-2">
<p className="text-sm text-textMuted">Shop Address</p>
<p className="font-semibold">{vendor.shop_address}</p>
</div>

<div>
<p className="text-sm text-textMuted">UPI ID</p>
<p className="font-semibold break-words">{vendor.upi_id}</p>
</div>

<div>
<p className="text-sm text-textMuted">Status</p>

<span
  className={`inline-block mt-1 px-3 py-1 text-xs rounded-full font-semibold ${
    vendor.kyc_status === "approved"
      ? "bg-green-100 text-green-700"
      : vendor.kyc_status === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700"
  }`}
>
  {vendor.kyc_status}
</span>

</div>

</div>

</div>

</div>

);
}