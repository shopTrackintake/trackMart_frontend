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

if(!vendor) return <p>Loading...</p>;

return(

<div className="space-y-8">

<h1 className="text-3xl font-bold">
Vendor Details
</h1>

<div className="bg-bgSurface border border-borderDefault rounded-2xl p-8 space-y-6">

<p><b>Business Name:</b> {vendor.business_name}</p>

<p><b>Owner Name:</b> {vendor.name}</p>

<p><b>Email:</b> {vendor.email}</p>

<p><b>Phone:</b> {vendor.phone}</p>

<p><b>Shop Address:</b> {vendor.shop_address}</p>

<p><b>UPI ID:</b> {vendor.upi_id}</p>

<p><b>Status:</b> {vendor.kyc_status}</p>

</div>

</div>

);

}