import { useEffect, useState } from "react";
import { deleteVendorById } from "../../services/adminService";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";


export default function Vendors() {
const navigate = useNavigate();
const [vendors,setVendors] = useState([]);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const fetchVendors = async()=>{

try{

const res = await api.get("/admin/vendors");

setVendors(res.data);

}catch(err){

console.log(err);

}finally{

setLoading(false);

}

};

fetchVendors();

},[]);



const deleteVendor = async(id)=>{

if(!window.confirm("Delete this vendor?")) return;

try{

await deleteVendorById(id);

setVendors(prev=>prev.filter(v=>v.id!==id));

}catch(err){

console.log(err);

}

};



return(

<div className="space-y-8">

{/* Header */}

<div>

<h1 className="text-2xl font-primary font-bold text-textStrong">
Approved Vendors
</h1>

<p className="text-textDefault mt-2">
Manage approved vendors.
</p>

</div>



{/* Loading */}

{loading && (
<div className="text-textMuted">
Loading...
</div>
)}



{/* Empty State */}

{!loading && vendors.length === 0 && (

<div className="bg-bgSurfaceAlt border border-borderDefault rounded-2xl p-6 text-center text-textMuted">
No vendors found
</div>

)}



{/* Vendor Cards */}

<div className="space-y-6">

{vendors.map(v=>(

<div
key={v.id}
onClick={()=>navigate(`/admin/vendors/${v.id}`)}
className="bg-bgSurface border border-borderDefault rounded-2xl p-4 md:p-6 shadow-card cursor-pointer hover:bg-bgSurfaceAlt flex flex-col md:flex-row md:justify-between md:items-center gap-4"
>

{/* LEFT */}
<div className="space-y-1">

<h3 className="font-primary font-semibold text-textStrong text-base md:text-lg">
{v.business_name}
</h3>

<p className="text-textMuted text-sm">
{v.email}
</p>

<span className="text-xs px-3 py-1 bg-green-200 text-green-800 rounded-full mt-2 inline-block">
Approved
</span>

</div>

{/* RIGHT BUTTON */}
<div className="w-full md:w-auto">

<button
onClick={(e)=>{
e.stopPropagation();
deleteVendor(v.id);
}}
className="w-full md:w-[140px] h-10 flex items-center justify-center border border-dangerText text-dangerText rounded-xl font-semibold hover:bg-dangerText hover:text-white"
>
Delete
</button>

</div>

</div>

))}

</div>

</div>

);

}