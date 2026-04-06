import { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function AdminProducts(){

const [products,setProducts] = useState([]);
const navigate = useNavigate();

useEffect(()=>{

const fetchProducts = async()=>{

try{
const res = await api.get("/admin/products");
setProducts(res.data);
}catch(err){
console.log(err);
}

};

fetchProducts();

},[]);


/* ================= DELETE PRODUCT ================= */

const deleteProduct = async(id)=>{

const reason = prompt("Why are you deleting this product?");
if(!reason) return;

try{
await api.delete(`/admin/products/${id}`,{
data:{reason}
});
setProducts(prev=>prev.filter(p=>p.id!==id));
}catch(err){
console.log(err);
}

};


/* ================= GROUP BY VENDOR ================= */

const groupedProducts = products.reduce((acc,product)=>{

if(!acc[product.business_name]){
acc[product.business_name] = [];
}

acc[product.business_name].push(product);
return acc;

},{});


return(

<div className="space-y-8 md:space-y-10 max-w-6xl mx-auto px-4">

<h1 className="text-2xl md:text-3xl font-bold">
Product Moderation
</h1>


{/* ================= VENDOR GROUP ================= */}

{Object.entries(groupedProducts).map(([vendor,items])=>(

<div key={vendor} className="space-y-4">

{/* Vendor Name */}

<h2 className="text-lg md:text-xl font-semibold text-primary border-b pb-2">
Vendor: {vendor}
</h2>


{/* Products */}

{items.map(p=>(

<div
key={p.id}
className="bg-bgSurface border border-borderDefault rounded-xl p-4 md:p-5 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center gap-4"
>

{/* LEFT SIDE */}
<div className="space-y-1">

<h3 className="font-semibold text-sm md:text-base">
{p.title}
</h3>

<p className="text-sm text-textMuted">
₹{p.price}
</p>

</div>


{/* RIGHT SIDE BUTTONS */}
<div className="grid grid-cols-2 sm:flex gap-3 w-full md:w-auto">


<button
onClick={()=>navigate(`/admin/products/${p.id}`)}
className="w-full sm:w-[160px] h-10 flex items-center justify-center text-center whitespace-nowrap overflow-hidden text-ellipsis bg-primary text-white rounded-lg"
>
View Details
</button>

<button
onClick={()=>deleteProduct(p.id)}
className="w-full sm:w-[160px] h-10 flex items-center justify-center text-center whitespace-nowrap overflow-hidden text-ellipsis border border-dangerText text-dangerText rounded-lg hover:bg-dangerText hover:text-white"
>
Delete
</button>

</div>

</div>

))}

</div>

))}

</div>

);

}