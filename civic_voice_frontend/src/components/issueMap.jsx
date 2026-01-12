import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function IssuesMap({ issues }) {
  return (
    <MapContainer
      center={[17.5965, 78.4819]}
      zoom={14}
      style={{ height: "450px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {issues.map((issue) => (
        <Marker key={issue.id} position={[issue.lat, issue.lng]}>
          <Popup>
            <b>{issue.type}</b><br />
            {issue.description}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default IssuesMap;
