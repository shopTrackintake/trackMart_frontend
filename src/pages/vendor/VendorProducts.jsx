import { useEffect, useState } from "react";
import api from "../../services/api";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function VendorProducts(){

const [products,setProducts] = useState([]);


/* ================= FETCH PRODUCTS ================= */

const fetchProducts = async()=>{

 try{

  const res = await api.get("/products/vendor");
  setProducts(res.data);

 }catch(err){

  console.log("Fetch error:",err);

 }

};

useEffect(()=>{
 fetchProducts();
},[]);


/* ================= DELETE PRODUCT ================= */

const deleteProduct = async(id)=>{

 if(!window.confirm("Delete this product?")) return;

 try{

  await api.delete(`/products/${id}`);

  /* refresh list */

  setProducts(prev => prev.filter(p => p.id !== id));

 }catch(err){

  console.log(err);
  alert("Unable to delete product");

 }

};


return(

<>

<Navbar/>

<div className="max-w-7xl mx-auto px-6 py-8">

<h1 className="text-3xl font-bold mb-8">
My Products
</h1>


<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">


{products.map(p=>(

<div
key={p.id}
className="bg-white border rounded-xl shadow-sm hover:shadow-lg transition flex flex-col h-[360px]"
>


{/* IMAGE */}

<div className="h-40 flex items-center justify-center bg-gray-50 rounded-t-xl p-4">

<img
src={
  p.image_url?.startsWith("http")
    ? p.image_url
    : `https://trackmart-backend.onrender.com/uploads/${p.image_url}`
}
alt={p.title}
className="max-h-full object-contain"
/>

</div>


{/* CONTENT */}

<div className="flex flex-col flex-grow p-4">

<h2 className="font-semibold text-lg line-clamp-1">
{p.title}
</h2>

<p className="text-primary font-bold mt-1">
₹{p.price}
</p>

<p className="text-sm text-gray-600 mt-2 line-clamp-2">
{p.description}
</p>


{/* DELETE BUTTON */}

<div className="mt-auto pt-4">

<button
onClick={()=>deleteProduct(p.id)}
className="text-red-600 font-medium hover:underline"
>
Delete
</button>

</div>

</div>

</div>

))}

</div>

</div>

<Footer/>

</>

);

}
