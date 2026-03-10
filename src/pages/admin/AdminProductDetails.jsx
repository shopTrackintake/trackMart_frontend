import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";

export default function AdminProductDetails(){

const { id } = useParams();

const [product,setProduct] = useState(null);

useEffect(()=>{

const fetchProduct = async()=>{

try{

const res = await api.get(`/admin/products/${id}`);

setProduct(res.data);

}catch(err){

console.log(err);

}

};

fetchProduct();

},[id]);


if(!product) return <p>Loading...</p>;


return(

<div className="space-y-8">

<h1 className="text-3xl font-bold">
Product Details
</h1>

<div className="bg-bgSurface border border-borderDefault rounded-2xl p-8 space-y-6">

<img
  src={
    product.image_url?.startsWith("http")
      ? product.image_url
      : `https://trackmart-backend.onrender.com/uploads/${product.image_url}`
  }
  className="w-64 rounded-xl"
/>

<div>

<h2 className="text-2xl font-semibold">
{product.title}
</h2>

<p className="text-textMuted mt-2">
Vendor: {product.business_name}
</p>

<p className="text-lg font-semibold mt-2">
₹{product.price}
</p>
<p className="text-sm text-textMuted">
Delivery Charge: ₹{product.delivery_charge}
</p>
</div>

<div>

<h3 className="font-semibold">
Description
</h3>

<p className="text-textMuted">
{product.description}
</p>

</div>

<div className="grid grid-cols-2 gap-6">

<p>Calories: {product.calories}</p>
<p>Sugar: {product.sugar}</p>
<p>Fat: {product.fat}</p>
<p>Protein: {product.protein}</p>

</div>

</div>

</div>

);

}
