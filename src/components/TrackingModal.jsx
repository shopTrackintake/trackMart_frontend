import { useEffect, useState } from "react";
import api from "../services/api";
import Map from "../components/Map";

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

    const interval = setInterval(fetchTracking, 5000);

    return () => clearInterval(interval);

  }, [itemId]);

  if (!itemId) return null;

  const status = (item?.status || "").toLowerCase();

  const steps = ["PLACED", "CONFIRMED", "ASSIGNED", "SHIPPED", "DELIVERED"];

  const getStep = () => {
    if (status === "delivered") return 4;
    if (status === "shipped") return 3;
    if (status === "confirmed") return 2;
    return 1;
  };

  const currentStep = getStep();

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >

      <div
        className="bg-white w-[90%] max-w-md p-6 rounded-xl relative"
        onClick={(e) => e.stopPropagation()}
      >

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3"
        >
          ✖
        </button>

        <h2 className="text-xl font-bold mb-4">
          Order Tracking
        </h2>

        {!item ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* PRODUCT */}
            <p className="font-semibold">
              {item.title}
            </p>

            <p className="text-sm text-gray-500 mb-4">
              Vendor: {item.vendor_name}
            </p>

            {/*  STEPS */}
            <div className="space-y-2 mb-4">
              {steps.map((step, i) => (
                <div key={step} className="flex gap-2 items-center">

                  <div
                    className={`w-3 h-3 rounded-full ${
                      i <= currentStep
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  />

                  <span>{step}</span>

                </div>
              ))}
            </div>

            {/*  MAP WITH ROUTE */}
            {item.latitude && item.longitude && (
              <Map
                lat={Number(item.latitude)}
                lng={Number(item.longitude)}
                userLat={Number(item.user_lat)}   // ✅ NEW
                userLng={Number(item.user_lng)}   // ✅ NEW
              />
            )}

            {/* INFO */}
            <div className="mt-3 text-sm">
              <p>Status: {item.status}</p>

              <p>
                Delivery:{" "}
                {item.delivery_date
                  ? new Date(item.delivery_date).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>

          </>
        )}

      </div>
    </div>
  );
}