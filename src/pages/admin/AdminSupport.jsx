import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdminSupport(){

const [tickets,setTickets] = useState([]);
const [replyText, setReplyText] = useState({});
const [messages, setMessages] = useState([]);

useEffect(()=>{
const fetchMessages = async () => {
  try {
    const res = await api.get("/contact");
    setMessages(res.data);
  } catch (err) {
    console.log(err);
  }
};
const fetchTickets = async()=>{

try{

const res = await api.get("/support/admin");
setTickets(res.data);

}catch(err){
console.log(err);
}

};

fetchTickets();
  fetchMessages();

},[]);


const sendReply = async(id)=>{

  if (!replyText[id]) {
    alert("Reply cannot be empty");
    return;
  }

  try{

    await api.post(`/support/admin/${id}/reply`, {
      reply: replyText[id]
    });

    alert("Reply sent");

    setReplyText({
      ...replyText,
      [id]: ""
    });

    const res = await api.get("/support/admin");
    setTickets(res.data);

  }catch(err){
    console.log(err);
  }
};


return(

<div className="space-y-8">

<h1 className="text-3xl font-bold">
Customer Support
</h1>

{tickets.length===0 && (
<p className="text-textMuted">
No user issues
</p>
)}

{tickets.map(t=>(

<div
key={t.id}
className="bg-bgSurface border border-borderDefault rounded-xl p-6 space-y-4"
>

<div>

<h3 className="font-semibold text-lg">
{t.subject}
</h3>

<p className="text-textMuted text-sm">
User: {t.name} ({t.email})
</p>

</div>

<p className="text-textStrong">
{t.message}
</p>

{t.admin_reply && (

<div className="bg-green-50 border border-green-200 p-4 rounded-lg">

<p className="text-sm text-green-700 font-semibold">
Admin Reply
</p>

<p>{t.admin_reply}</p>

</div>

)}

{!t.admin_reply && (

<div className="space-y-3">

<textarea
value={replyText[t.id] || ""}
  
onChange={(e)=>
  setReplyText({
    ...replyText,
    [t.id]: e.target.value
  })
}
className="w-full border border-borderDefault rounded-lg p-3"
/>

<button
onClick={()=>sendReply(t.id)}
className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primaryHover"
>
Send Reply
</button>

</div>

)}

</div>

))}
  {/* ================= CONTACT MESSAGES ================= */}

<div className="space-y-6 mt-10">

  <h2 className="text-2xl font-semibold">
    Contact Messages
  </h2>

  {messages.length === 0 && (
    <p className="text-textMuted">
      No contact messages
    </p>
  )}

 {messages.map(msg => (

  <div
    key={msg.id}
    className="bg-bgSurface border border-borderDefault rounded-xl p-6 space-y-4"
  >

    <div>
      <h3 className="font-semibold text-lg">
        {msg.name}
      </h3>

      <p className="text-textMuted text-sm">
        {msg.email} {msg.phone && `(${msg.phone})`}
      </p>
    </div>

    <p className="text-textStrong">
      {msg.message}
    </p>

  </div>

))}
</div>

</div>

);

}