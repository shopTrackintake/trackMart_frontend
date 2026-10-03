import { useEffect, useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MapPicker from "../../components/MapPicker";
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
const navigate = useNavigate();
const [locationConfirmed, setLocationConfirmed] = useState(false);
const [addresses,setAddresses] = useState([]);
const [selected,setSelected] = useState(null);
const [editingId,setEditingId] = useState(null);
const [showMap, setShowMap] = useState(false);
const [paymentMethod,setPaymentMethod] = useState("ONLINE");
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
useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  document.body.appendChild(script);
}, []);
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
  const placeOrder = async () => {
    if (!selected) {
      alert("Please select delivery address first.");
      return;
    }
    await handleRazorpay();
  };

  /* RAZORPAY HANDLER */
  const handleRazorpay = async () => {
  try {
    setPlacing(true);

    // ✅ STEP 1: Create DB Order FIRST
    const orderRes = await api.post("/orders", {
      address_id: selected,
      payment_method: "ONLINE"
    });

    const dbOrderId = orderRes.data.order_id;

    // ✅ STEP 2: Create Razorpay Order
    const res = await api.post("/payment/create-order", {
      amount: totalAmount
    });

    const { order } = res.data;

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "HealthMart",
      order_id: order.id,
handler: async function (response) {
  try {

    console.log("RAZORPAY RESPONSE:", response);

    const verifyRes = await api.post("/payment/verify", {
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature
    });

    console.log("VERIFY RESPONSE:", verifyRes.data); // ✅ ADD

    if (verifyRes.data.success) {

      console.log("DB ORDER ID:", dbOrderId); // ✅ ADD

      await api.patch("/orders/payment-status", {
        order_id: dbOrderId,
        payment_id: response.razorpay_payment_id
      });

      console.log("PAYMENT STATUS UPDATED"); // ✅ ADD

      alert("Payment successful!");
      window.location.href = "/customer/orders";

    } else {
      alert("Payment verification failed");
    }

  } catch (err) {
    console.log("VERIFY ERROR:", err.response?.data); // ✅ ADD
    alert("Verification error");
  }
},

      modal: {
        ondismiss: () => {
          setPlacing(false);
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (err) {
    console.log(err);
    alert("Payment failed to start");
  } finally {
    setPlacing(false);
  }
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
navigator.geolocation.getCurrentPosition(
  async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );

      const data = await res.json();
      const addr = data.address || {};

      setForm(prev => ({
  ...prev,
  house_no: addr.house_number || prev.house_no,
  street: addr.road || prev.street,
  locality: addr.suburb || addr.village || prev.locality,
  city: addr.city || addr.town || prev.city,
  state: addr.state || prev.state,
  pincode: addr.postcode || prev.pincode,
  latitude: lat,
  longitude: lon
}));

      setLocationConfirmed(true);
      setShowMap(true);

    } catch (err) {
      console.log(err);
      alert("Failed to fetch address");
    }
  },
  (error) => {
    alert("Please enable location permission");
  }
);
  };  
return(

<div className="space-y-10">

{/* BACK ARROW */}
<button
 onClick={()=>navigate("/cart")}
  className="absolute top-16 left-6 p-10 rounded-full hover:bg-gray-100 transition z-50"
>
 <ArrowLeft className="w-6 h-6 text-gray-700"/>
</button>

<h1 className="text-3xl font-bold">Checkout</h1>

{/* SAVED ADDRESSES */}
<div className="space-y-4">

{addresses.map(addr=>(

<div
key={addr.id}
className={`p-6 border rounded-2xl ${
selected===addr.id
? "border-primary bg-primary/5"
: "border-gray-200"
}`}
>

{/* CLICK AREA */}
<div
onClick={()=>{

 setSelected(addr.id);

 setTimeout(()=>{
  paymentRef.current?.scrollIntoView({
   behavior:"smooth"
  });
 },200);

}}
className="cursor-pointer"
>

<p className="font-semibold">{addr.full_name}</p>
<p className="text-sm text-gray-500">{addr.phone}</p>

<p>{addr.house_no}, {addr.street}</p>
<p>{addr.locality}</p>
<p>{addr.city}, {addr.state} - {addr.pincode}</p>

</div>

{/* EDIT + DELETE BUTTONS */}
<div className="flex gap-3 mt-4">

<button
onClick={(e)=>{
 e.stopPropagation();

 setForm({
  full_name:addr.full_name,
  phone:addr.phone,
  house_no:addr.house_no,
  street:addr.street,
  locality:addr.locality,
  landmark:addr.landmark,
  city:addr.city,
  state:addr.state,
  pincode:addr.pincode,
  latitude:addr.latitude,
  longitude:addr.longitude
 });

 setEditingId(addr.id);
 setShowMap(true);              // map open
 setLocationConfirmed(false);
 formRef.current?.scrollIntoView({behavior:"smooth"});
}}
className="text-sm px-4 py-1 border rounded-lg hover:bg-gray-100"
>
Edit
</button>

<button
onClick={(e)=>{
 e.stopPropagation();
 handleDelete(addr.id);
}}
className="text-sm px-4 py-1 border rounded-lg text-red-500 hover:bg-red-50"
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
  onClick={() => {
    setShowMap(true);          // 🔥 ALWAYS OPEN
    setLocationConfirmed(false);
  }}
 className="w-full h-11 border rounded-xl flex items-center justify-center"
>
  📍 Pick from Map
</button>
<button
  onClick={() => {

    // ✅ validation
    if (
      !form.full_name ||
      !form.phone ||
      !form.house_no ||
      !form.street ||
      !form.locality ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      alert("Please fill all fields");
      return;
    }

    // 🔥 ALWAYS REQUIRE MAP CLICK (IMPORTANT)
    if (!locationConfirmed) {
      alert("Please select location on map first");

      setShowMap(true);   // map open
      return;
    }

    // ✅ FINAL UPDATE
    handleAdd();

  }}
  className="w-full h-11 bg-primary text-white rounded-xl flex items-center justify-center"
>
  {editingId ? "Update Address" : "Save Address"}
</button> 
<button
  onClick={getLiveLocation}
 className="w-full h-11 border rounded-xl flex items-center justify-center"
>
  Use Live Location
</button>

</div>
{showMap && (
  <div className="mt-4 border p-4 rounded-xl">

    <p className="text-sm text-gray-500 mb-2">
      📍 Click on map to confirm location
    </p>

  <MapPicker 
  setForm={setForm}
  setLocationConfirmed={setLocationConfirmed}
  setShowMap={setShowMap}   // 🔥 MUST
  lat={form.latitude}
  lng={form.longitude}
/>

     

  </div>
)}
</div>

{/* PAYMENT */}
<div ref={paymentRef} className="border border-slate-200 bg-white p-6 rounded-2xl space-y-4 shadow-xs">

<div className="flex items-center justify-between">
  <h2 className="font-bold text-lg text-slate-900">Payment Method</h2>
  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
    100% Secured Online Payment
  </span>
</div>

<div className="p-4 border border-emerald-200 bg-emerald-50/60 rounded-xl flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="w-5 h-5 rounded-full border-2 border-emerald-600 bg-emerald-600 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-white"></div>
    </div>
    <div>
      <p className="font-bold text-slate-900 text-sm">Online Payment (Razorpay)</p>
      <p className="text-xs text-slate-500">UPI, Credit/Debit Cards, NetBanking, Wallets</p>
    </div>
  </div>
  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">Instant Pay</span>
</div>

<button
  onClick={placeOrder}
  disabled={placing}
  className="bg-primary hover:bg-primaryHover text-white text-base font-bold py-3.5 rounded-xl w-full shadow-md transition active:scale-95 disabled:opacity-50"
>
  {placing ? "Processing Payment..." : `Pay ₹${totalAmount} & Place Order`}
</button>

</div>

{/* OVERVIEW */}
{showOverview && (
<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
<div className="bg-white p-8 rounded-2xl w-[600px]">

<h2 className="text-xl font-bold mb-4">Order Overview</h2>

{cartItems.map(item=>(
<div key={item.id} className="flex justify-between border-b py-2">
<p>{item.title} (x{item.quantity})</p>
<p>₹{Number(item.price)*Number(item.quantity)}</p>
</div>
))}

<div className="flex justify-between font-bold mt-4">
<p>Total</p>
<p>₹{totalAmount}</p>
</div>

<div className="flex gap-4 mt-6">
<button
onClick={()=>setShowOverview(false)}
className="border px-6 py-2 rounded-xl">
Back
</button>

<button
onClick={confirmOrder}
className="bg-primary text-white px-6 py-2 rounded-xl">
Confirm Order
</button>
</div>

</div>
</div>
)}

</div>
);
}