import { useEffect, useState } from "react";
import { getWishlist, removeWishlist } from "../../services/wishlistService";
import { updateCartItem } from "../../services/cartService";

export default function Wishlist(){

const [items,setItems] = useState([]);

useEffect(()=>{

const fetchWishlist = async()=>{

try{

const res = await getWishlist();
setItems(res.data);

}catch(err){

console.log(err);

}

};

fetchWishlist();

},[]);


/* REMOVE */

const removeItem = async(id)=>{

try{

await removeWishlist(id);

setItems(prev=>prev.filter(i=>i.wishlist_id !== id));

}catch(err){

console.log(err);

}

};


/* ADD TO CART */

const addToCart = async(product)=>{

try{

await updateCartItem(product.id,1);

}catch(err){

console.log(err);

}

};


return(

<div className="max-w-6xl mx-auto space-y-10">

<h1 className="text-3xl font-bold">
My Wishlist
</h1>

{items.length===0 && (
<div>No items in wishlist</div>
)}

<div className="grid md:grid-cols-3 gap-8">

{items.map(item=>(

<div
key={item.wishlist_id}
className="border rounded-xl p-6 shadow"
>

<img
src={item.image_url}
className="h-40 object-contain mx-auto"
/>

<h3 className="font-semibold mt-4">
{item.title}
</h3>

<p className="text-primary font-bold">
₹{item.price}
</p>

<div className="flex gap-3 mt-4">

<button
onClick={()=>addToCart(item)}
className="bg-primary text-white px-4 py-2 rounded"
>
Add to Cart
</button>

<button
onClick={()=>removeItem(item.wishlist_id)}
className="border px-4 py-2 rounded"
>
Remove
</button>

</div>

</div>

))}

</div>

</div>

);

}
