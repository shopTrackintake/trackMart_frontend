import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// FIX marker icon
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

export default function Map({ lat, lng, userLat, userLng }) {

  const [route, setRoute] = useState([]);

  useEffect(() => {
    if (!lat || !lng || !userLat || !userLng) return;

    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${userLng},${userLat}?overview=full&geometries=geojson`
        );

        const data = await res.json();

        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        setRoute(coords);

      } catch (err) {
        console.log(err);
      }
    };

    fetchRoute();
  }, [lat, lng, userLat, userLng]);

  if (!lat || !lng) return <p>No location</p>;

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ height: "250px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/*  Delivery Partner */}
      <Marker position={[lat, lng]}>
        <Popup>🚚 Delivery Partner</Popup>
      </Marker>

      {/*  User Location */}
      {userLat && userLng && (
        <Marker position={[userLat, userLng]}>
          <Popup>🏠 Your Location</Popup>
        </Marker>
      )}

      {/*  Route Line */}
      {route.length > 0 && (
        <Polyline positions={route} />
      )}

    </MapContainer>
  );
}