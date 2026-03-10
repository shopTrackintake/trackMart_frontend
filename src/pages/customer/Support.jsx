import { useState,useEffect } from "react";
import api from "../../services/api";

export default function Support(){

const [tickets,setTickets] = useState([]);
const [form,setForm] = useState({subject:"",message:""});
const [loading,setLoading] = useState(true);

useEffect(()=>{

const fetchTickets = async()=>{

try{

const res = await api.get("/support");
setTickets(res.data);

}catch(err){

console.log(err);

}finally{

setLoading(false);

}

};

fetchTickets();

},[]);


const submit = async(e)=>{

e.preventDefault();

try{

await api.post("/support",form);

alert("Issue submitted successfully");

setForm({subject:"",message:""});

}catch(err){

console.log(err);

}

};


return(

<div className="space-y-10">

{/* PAGE HEADER */}

<div>

<h1 className="text-3xl font-primary font-bold text-textStrong">
Customer Support
</h1>

<p className="text-textDefault mt-2">
Submit your issue and our admin team will assist you.
</p>

</div>



{/* SUPPORT FORM */}

<div className="bg-bgSurface border border-borderDefault rounded-2xl shadow-card p-8 space-y-6">

<h2 className="text-xl font-semibold text-textStrong">
Submit a Support Request
</h2>

<form onSubmit={submit} className="space-y-5">

<input
value={form.subject}
placeholder="Issue Subject"
className="w-full border border-borderDefault rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition"
onChange={e=>setForm({...form,subject:e.target.value})}
/>

<textarea
value={form.message}
placeholder="Describe your issue..."
rows="4"
className="w-full border border-borderDefault rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition"
onChange={e=>setForm({...form,message:e.target.value})}
/>

<button
className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primaryHover transition"
>
Submit Issue
</button>

</form>

</div>



{/* TICKET HISTORY */}

<div className="space-y-6">

<h2 className="text-xl font-semibold text-textStrong">
Your Support Requests
</h2>


{loading && (

<p className="text-textMuted">
Loading...
</p>

)}


{!loading && tickets.length===0 && (

<div className="bg-bgSurfaceAlt border border-borderDefault rounded-xl p-6 text-center text-textMuted">
No issues submitted yet.
</div>

)}


<div className="space-y-4">

{tickets.map(t=>(

<div
key={t.id}
className="bg-bgSurface border border-borderDefault rounded-xl p-6 shadow-card"
>

<h3 className="font-semibold text-textStrong text-lg">
{t.subject}
</h3>

<p className="text-textDefault mt-2">
{t.message}
</p>


{/* ADMIN REPLY */}

{t.admin_reply ? (

<div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">

<p className="text-green-700 font-semibold">
Admin Response
</p>

<p className="text-green-700 mt-1">
{t.admin_reply}
</p>

</div>

) : (

<p className="text-sm text-textMuted mt-4">
Waiting for admin response...
</p>

)}

</div>

))}

</div>

</div>

</div>

);

}