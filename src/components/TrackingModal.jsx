import { useEffect, useState } from "react";
import api from "../services/api";
import { Package, Truck, CheckCircle2, X, Calendar, Store, Clock } from "lucide-react";

export default function TrackingModal({ itemId, onClose }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemId) return;

    let isMounted = true;
    const fetchTracking = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/track/${itemId}`);
        if (isMounted) setItem(res.data);
      } catch (err) {
        console.error("Tracking Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTracking();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      isMounted = false;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [itemId, onClose]);

  if (!itemId) return null;

  const rawStatus = String(item?.item_status || item?.status || "placed").toLowerCase();
  
  // Map status: 1 = placed, 2 = in_transit, 3 = delivered
  const getStage = () => {
    if (rawStatus === "delivered") return 3;
    if (["in_transit", "confirmed", "shipped"].includes(rawStatus)) return 2;
    return 1;
  };

  const currentStage = getStage();
  const isCancelled = rawStatus === "cancelled";

  const stages = [
    {
      id: 1,
      label: "Order Placed",
      desc: "Customer order placed & received",
      icon: Package
    },
    {
      id: 2,
      label: "In Transit",
      desc: "Dispatched by vendor with OTP",
      icon: Truck
    },
    {
      id: 3,
      label: "Delivered",
      desc: "OTP verified & package delivered",
      icon: CheckCircle2
    }
  ];

  const imageUrl = item?.image_url || (Array.isArray(item?.images) ? item?.images[0] : null);

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[9999] p-4 transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md p-6 sm:p-7 rounded-3xl shadow-2xl relative space-y-6 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* MODAL HEADER */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
            <Clock className="w-3.5 h-3.5" />
            <span>Order Status Details</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Status Progress
          </h2>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium">Loading tracking timeline...</p>
          </div>
        ) : !item ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            Tracking information is unavailable for this item.
          </div>
        ) : (
          <div className="space-y-6">
            {/* PRODUCT CARD */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.title || "Product"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="font-bold text-slate-900 text-sm truncate">
                  {item.title}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Store className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">
                    Seller: <strong className="text-slate-800 font-semibold">{item.vendor_name || "Verified Vendor"}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* STATUS STEPPER */}
            <div className="relative pl-1 space-y-6">
              {stages.map((stg, index) => {
                const IconComp = stg.icon;
                const isCompleted = !isCancelled && currentStage >= stg.id;
                const isCurrent = !isCancelled && currentStage === stg.id;
                const isLast = index === stages.length - 1;

                return (
                  <div key={stg.id} className="relative flex items-start gap-4">
                    {/* Vertical connecting line */}
                    {!isLast && (
                      <div
                        className={`absolute left-[19px] top-[38px] bottom-[-24px] w-[2px] transition-colors ${
                          !isCancelled && currentStage > stg.id
                            ? "bg-emerald-500"
                            : "bg-slate-200"
                        }`}
                      />
                    )}

                    {/* Step Icon Node */}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                        isCompleted
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                          : isCurrent
                          ? "bg-primary text-white shadow-md shadow-primary/25 ring-4 ring-primary/15"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>

                    {/* Step Label & Description */}
                    <div className="space-y-0.5 pt-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm font-bold leading-tight ${
                            isCurrent
                              ? "text-primary"
                              : isCompleted
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {stg.label}
                        </p>
                        {isCurrent && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            In Progress
                          </span>
                        )}
                        {isCompleted && !isCurrent && (
                          <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-normal">{stg.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* EXPECTED DELIVERY CARD */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Expected Delivery</span>
              </div>
              <strong className="text-xs font-black text-amber-950 font-mono">
                {item.delivery_date
                  ? new Date(item.delivery_date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })
                  : "Scheduled on Dispatch"}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}