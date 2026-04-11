import { useEffect } from "react";
import api from "../services/api";
import { useParams } from "react-router-dom";

export default function LiveTracking() {

  const { itemId } = useParams();

  useEffect(() => {

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition((pos) => {

        api.patch("/track/update-location", {
          item_id: itemId,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });

      });
    };

    sendLocation(); // first time

    const interval = setInterval(sendLocation, 5000);

    return () => clearInterval(interval);

  }, [itemId]);

  return (
    <div className="flex justify-center items-center h-screen">
      <h1 className="text-xl font-bold">
        🚚 Tracking ON... Keep this page open
      </h1>
    </div>
  );
}