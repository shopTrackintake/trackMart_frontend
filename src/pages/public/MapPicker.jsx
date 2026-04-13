import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

export default function MapPicker({
  setForm,
  setLocationConfirmed,
  setShowMap,   
  lat,
  lng
}) {

  const [position, setPosition] = useState(
    lat && lng ? [Number(lat), Number(lng)] : [26.8467, 80.9462]
  );

  // update position when lat/lng changes
  useEffect(() => {
    if (lat && lng) {
      setPosition([Number(lat), Number(lng)]);
    }
  }, [lat, lng]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;

        setPosition([lat, lng]);

        
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        )
          .then(res => res.json())
          .then(data => {

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
              longitude: lng
            }));

            
            setLocationConfirmed(true);
            setShowMap(false);

          })
          .catch(err => console.log(err));
      }
    });

    return <Marker position={position} />;
  }

  return (
    <MapContainer
      center={position}
      zoom={15}
      style={{
        height: "300px",
        width: "100%",
        borderRadius: "12px"
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker />
    </MapContainer>
  );
}