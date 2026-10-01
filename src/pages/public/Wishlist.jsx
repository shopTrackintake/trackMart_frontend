import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWishlist, removeWishlist } from "../../services/wishlistService";
import { updateCartItem } from "../../services/cartService";

export default function Wishlist(){

const [items,setItems] = useState([]);
const navigate = useNavigate();

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
const addToCart = async (item) => {
  try {

    await updateCartItem(item.id, 1);

    alert("Item added to cart");

    await removeWishlist(item.wishlist_id);

    setItems(prev =>
      prev.filter(i => i.wishlist_id !== item.wishlist_id)
    );

  } catch (err) {
    console.log(err);
  }
};


return(

<div className="max-w-6xl mx-auto px-4 md:px-0 space-y-8 md:space-y-10">

{/* 🔙 BACK BUTTON + TITLE */}
<div className="flex items-center gap-3">

<button
onClick={()=>navigate("/")}
className="w-10 h-10 flex items-center justify-center rounded-full border border-borderDefault hover:bg-bgSurfaceAlt transition"
>
←
</button>

<h1 className="text-2xl md:text-3xl font-bold">
My Wishlist
</h1>

</div>


{items.length===0 && (
<div>No items in wishlist</div>
)}


{/* ✅ GRID FIX */}
<div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">

{items.map(item=>(

<div
key={item.wishlist_id}
className="border rounded-xl p-4 md:p-6 shadow flex flex-col"
>

<div className="relative">
  {Number(item.discount_percent) > 0 && (
    <span className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
      {item.discount_percent}% OFF
    </span>
  )}
  <img
  src={item.image_url}
  className="h-28 md:h-40 object-contain mx-auto"
  />
</div>

<h3 className="font-semibold mt-3 md:mt-4 text-sm md:text-base line-clamp-1">
{item.title}
</h3>

<div className="flex items-center gap-2">
  <span className="text-primary font-bold text-sm md:text-base">
    ₹{Number(item.discount_percent) > 0
      ? Math.round(Number(item.price) * (1 - Number(item.discount_percent) / 100))
      : item.price}
  </span>
  {Number(item.discount_percent) > 0 && (
    <span className="text-xs text-gray-400 line-through">
      ₹{item.price}
    </span>
  )}
</div>

<div className="flex flex-col sm:flex-row gap-2 mt-3 md:mt-4">

<button
onClick={()=>addToCart(item)}
className="bg-primary text-white w-full sm:w-auto px-3 md:px-4 py-2 rounded text-sm"
>
Add to Cart
</button>

<button
onClick={()=>removeItem(item.wishlist_id)}
className="border w-full sm:w-auto px-3 md:px-4 py-2 rounded text-sm"
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