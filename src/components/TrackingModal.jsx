import { useEffect, useState } from "react";
import api from "../services/api";
import { Package, Clock, Truck, CheckCircle2, X } from "lucide-react";

export default function TrackingModal({ itemId, onClose }) {
  const [item, setItem] = useState(null);

  useEffect(() => {
    if (!itemId) return;

    const fetchTracking = async () => {
      try {
        const res = await api.get(`/track/${itemId}`);
        setItem(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTracking();
  }, [itemId]);

  if (!itemId) return null;

  const rawStatus = String(item?.status || "placed").toLowerCase();
  
  // Map internal status to 3 main states: placed, in_transit, delivered
  const getStage = () => {
    if (rawStatus === "delivered") return 3;
    if (rawStatus === "in_transit" || rawStatus === "confirmed" || rawStatus === "shipped") return 2;
    return 1; // placed / pending
  };

  const currentStage = getStage();

  const stages = [
    { id: 1, label: "Order Placed", desc: "Customer order placed & received", icon: Package },
    { id: 2, label: "In Transit", desc: "Dispatched by vendor with OTP", icon: Truck },
    { id: 3, label: "Delivered", desc: "OTP verified & package delivered", icon: CheckCircle2 }
  ];

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-center items-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl relative space-y-5 animate-fadeIn border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
            Order Status Details
          </span>
          <h2 className="text-xl font-bold text-slate-900 font-primary mt-1">
            Status Progress
          </h2>
        </div>

        {!item ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Loading order details...
          </div>
        ) : (
          <div className="space-y-5">
            {/* PRODUCT TITLE */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <p className="font-bold text-slate-900 text-sm">{item.title}</p>
              <p className="text-xs text-slate-500">Seller: <strong className="text-slate-700 font-medium">{item.vendor_name}</strong></p>
            </div>

            {/* 3-STAGE STATUS TIMELINE */}
            <div className="space-y-4 pt-2">
              {stages.map((stg) => {
                const IconComp = stg.icon;
                const isCompleted = currentStage >= stg.id;
                const isCurrent = currentStage === stg.id;

                return (
                  <div key={stg.id} className="flex items-start gap-3.5 relative">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition ${
                        isCompleted
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>

                    <div className="space-y-0.5 pt-0.5">
                      <p className={`text-sm font-bold leading-tight ${isCurrent ? "text-slate-900" : isCompleted ? "text-emerald-700" : "text-slate-400"}`}>
                        {stg.label}
                      </p>
                      <p className="text-xs text-slate-500">{stg.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ADDITIONAL INFORMATION */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Expected Delivery:</span>
              <strong className="text-slate-800 font-bold">
                {item.delivery_date
                  ? new Date(item.delivery_date).toLocaleDateString()
                  : "Scheduled on Dispatch"}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}