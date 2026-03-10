import { useEffect, useState, useRef } from "react";
import {
  getAddresses,
  addAddress,
  deleteAddress,
  updateAddress
} from "../../services/addressService";
import api from "../../services/api";

export default function Checkout(){

const paymentRef = useRef(null);
const formRef = useRef(null);

const [addresses,setAddresses] = useState([]);
const [selected,setSelected] = useState(null);
const [editingId,setEditingId] = useState(null);

const [paymentMethod,setPaymentMethod] = useState("COD");
const [placing,setPlacing] = useState(false);
const [showOverview,setShowOverview] = useState(false);

const [cartItems,setCartItems] = useState([]);
const [totalAmount,setTotalAmount] = useState(0);

const [form,setForm] = useState({
 full_name:"",
 phone:"",
 house_no:"",
 street:"",
 locality:"",
 landmark:"",
 city:"",
 state:"",
 pincode:"",
 latitude:"",
 longitude:""
});


/* FETCH ADDRESSES */

const fetchAddresses = async()=>{
 try{
  const res = await getAddresses();
  setAddresses(res.data);
 }catch(err){
  console.log(err);
 }
};


/* FETCH CART */

useEffect(()=>{

 const fetchCart = async()=>{

  try{

   const res = await api.get("/cart");

   const validItems = res.data.filter(
    item=>Number(item.quantity)>0
   );

   setCartItems(validItems);

   const total = validItems.reduce(
    (acc,item)=>acc + Number(item.price)*Number(item.quantity),
    0
   );

   setTotalAmount(total);

  }catch(err){
   console.log(err);
  }

 };

 fetchCart();
 fetchAddresses();

},[]);


/* PLACE ORDER */

const placeOrder = async()=>{

 if(!selected){
  alert("Please select delivery address first.");
  return;
 }

 setShowOverview(true);

};


/* SAVE / UPDATE ADDRESS */

const handleAdd = async()=>{

 try{

  if(
   !form.full_name ||
   !form.phone ||
   !form.house_no ||
   !form.street ||
   !form.locality ||
   !form.city ||
   !form.state ||
   !form.pincode
  ){
   alert("Please fill all required fields");
   return;
  }

  if(editingId){

   await updateAddress(editingId,form);
   alert("Address updated");
   setEditingId(null);

  }else{

   const latest = await getAddresses();

   if(latest.data.length>=2){
    alert("Maximum 2 addresses allowed");
    return;
   }

   await addAddress(form);
   alert("Address saved");

  }

  setForm({
   full_name:"",
   phone:"",
   house_no:"",
   street:"",
   locality:"",
   landmark:"",
   city:"",
   state:"",
   pincode:"",
   latitude:"",
   longitude:""
  });

  fetchAddresses();

 }catch(err){
  alert("Failed to save address");
 }

};


/* DELETE */

const handleDelete = async(id)=>{

 await deleteAddress(id);
 fetchAddresses();

};


/* CONFIRM ORDER */

const confirmOrder = async()=>{

 try{

  setPlacing(true);

  await api.post("/orders",{
   address_id:selected,
   payment_method:paymentMethod
  });

  alert("Order placed successfully!");

  window.location.href="/customer/orders";

 }catch(err){

  console.log(err);
  alert("Failed to place order");

 }finally{

  setPlacing(false);

 }

};


/* LOCATION */

const getLiveLocation = ()=>{

 if(!navigator.geolocation){
  alert("Geolocation not supported");
  return;
 }

 navigator.geolocation.getCurrentPosition(async(position)=>{

  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  const res = await fetch(
   `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
  );

  const data = await res.json();
  const addr = data.address;

  setForm(prev=>({

   ...prev,
   house_no:addr.house_number || "",
   street:addr.road || "",
   locality:addr.suburb || "",
   city:addr.city || "",
   state:addr.state || "",
   pincode:addr.postcode || "",
   latitude:lat,
   longitude:lon

  }));

 });

};


return(

<div className="space-y-10">

<h1 className="text-3xl font-bold">Checkout</h1>


{/* SAVED ADDRESSES */}

<div className="space-y-4">

{addresses.map(addr=>(

<div
key={addr.id}
onClick={()=>{
 setSelected(addr.id);

 setTimeout(()=>{
  paymentRef.current?.scrollIntoView({
   behavior:"smooth"
  });
 },200);

}}
className={`p-6 border rounded-2xl cursor-pointer ${
selected===addr.id
? "border-primary bg-primary/5"
: "border-gray-200"
}`}
>

<p className="font-semibold">{addr.full_name}</p>
<p className="text-sm text-gray-500">{addr.phone}</p>

<p>{addr.house_no}, {addr.street}</p>
<p>{addr.locality}</p>
<p>{addr.city}, {addr.state} - {addr.pincode}</p>


<div className="flex gap-4 mt-3">

<button
onClick={(e)=>{

 e.stopPropagation();

 setEditingId(addr.id);

 setForm({
  full_name:addr.full_name || "",
  phone:addr.phone || "",
  house_no:addr.house_no || "",
  street:addr.street || "",
  locality:addr.locality || "",
  landmark:addr.landmark || "",
  city:addr.city || "",
  state:addr.state || "",
  pincode:addr.pincode || "",
  latitude:addr.latitude || "",
  longitude:addr.longitude || ""
 });

 formRef.current?.scrollIntoView({
  behavior:"smooth"
 });

}}
className="text-blue-500 text-xs"
>

Edit

</button>


<button
onClick={(e)=>{
 e.stopPropagation();
 handleDelete(addr.id);
}}
className="text-red-500 text-xs"
>

Delete

</button>

</div>

</div>

))}

</div>


{/* ADDRESS FORM */}

<div ref={formRef} className="space-y-4 border p-6 rounded-2xl">

<h2 className="font-semibold text-lg">Add Delivery Address</h2>

<input placeholder="Full Name" value={form.full_name}
onChange={e=>setForm({...form,full_name:e.target.value})}
className="border p-2 w-full rounded-lg"/>

<input placeholder="Phone" value={form.phone}
onChange={e=>setForm({...form,phone:e.target.value})}
className="border p-2 w-full rounded-lg"/>

<input placeholder="House No" value={form.house_no}
onChange={e=>setForm({...form,house_no:e.target.value})}
className="border p-2 w-full rounded-lg"/>

<input placeholder="Street" value={form.street}
onChange={e=>setForm({...form,street:e.target.value})}
className="border p-2 w-full rounded-lg"/>

<input placeholder="Locality" value={form.locality}
onChange={e=>setForm({...form,locality:e.target.value})}
className="border p-2 w-full rounded-lg"/>

<input placeholder="City" value={form.city}
onChange={e=>setForm({...form,city:e.target.value})}
className="border p-2 w-full rounded-lg"/>

<input placeholder="State" value={form.state}
onChange={e=>setForm({...form,state:e.target.value})}
className="border p-2 w-full rounded-lg"/>

<input placeholder="Pincode" value={form.pincode}
onChange={e=>setForm({...form,pincode:e.target.value})}
className="border p-2 w-full rounded-lg"/>


<div className="flex gap-4">

<button
onClick={handleAdd}
className="bg-primary text-white px-6 py-2 rounded-xl"
>
{editingId ? "Update Address" : "Save Address"}
</button>

<button
onClick={getLiveLocation}
className="border px-6 py-2 rounded-xl"
>
Use Live Location
</button>

</div>

</div>


{/* PAYMENT SECTION */}

<div ref={paymentRef} className="border p-6 rounded-2xl space-y-4">

<h2 className="font-semibold text-lg">Payment Method</h2>

<label className="flex gap-3">

<input
type="radio"
value="COD"
checked={paymentMethod==="COD"}
onChange={()=>setPaymentMethod("COD")}
/>

Cash on Delivery

</label>


<label className="flex gap-3">

<input
type="radio"
value="ONLINE"
checked={paymentMethod==="ONLINE"}
onChange={()=>setPaymentMethod("ONLINE")}
/>

Online Payment

</label>


<button
onClick={placeOrder}
disabled={!selected}
className="bg-primary text-white px-8 py-3 rounded-xl w-full"
>

Place Order

</button>

</div>


{/* ORDER OVERVIEW */}

{showOverview && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white p-8 rounded-2xl w-[600px]">

<h2 className="text-xl font-bold mb-4">
Order Overview
</h2>

{cartItems.map(item=>(

<div key={item.id} className="flex justify-between border-b py-2">

<p>{item.title} (x{item.quantity})</p>

<p>₹{item.price*item.quantity}</p>

</div>

))}

<div className="flex justify-between font-bold mt-4">

<p>Total</p>
<p>₹{totalAmount}</p>

</div>

<div className="flex gap-4 mt-6">

<button
onClick={()=>setShowOverview(false)}
className="border px-6 py-2 rounded-xl"
>

Back

</button>

<button
onClick={confirmOrder}
className="bg-primary text-white px-6 py-2 rounded-xl"
>

Confirm Order

</button>

</div>

</div>

</div>

)}

</div>

);

}