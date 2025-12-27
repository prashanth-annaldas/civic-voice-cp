import { useState } from "react";

function LocationInput() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setError("Permission denied or unable to retrieve location");
      }
    );

    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;

        const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );

        const data = await res.json();
        setName(data.display_name);
    });
  };

  return (
    <div>
      <button onClick={getLocation}>Location</button>

      {location && (
        <p>{name}</p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default LocationInput;