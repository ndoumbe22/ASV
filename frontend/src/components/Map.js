import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function Map() {
  const mapContainer = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  useEffect(() => {
    // Si la carte n'existe pas déjà, on la crée
    if (!mapInstance.current && mapContainer.current) {
      const map = L.map(mapContainer.current).setView([14.6928, -17.4467], 12);
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const marker = L.marker([14.6928, -17.4467]).addTo(map);
      markerInstance.current = marker;

      const input = document.getElementById("search-location");
      if (input) {
        const handleChange = (e) => {
          const query = e.target.value;
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
              if (data.length > 0) {
                const place = data[0];
                const lat = parseFloat(place.lat);
                const lon = parseFloat(place.lon);
                map.setView([lat, lon], 14);
                marker.setLatLng([lat, lon]);
                marker.bindPopup(`<b>${place.display_name}</b>`).openPopup();
              } else {
                alert("Aucun résultat trouvé pour : " + query);
              }
            })
            .catch(err => console.error(err));
        };

        input.addEventListener("change", handleChange);

        return () => {
          input.removeEventListener("change", handleChange);
          // Détruire la carte au démontage pour éviter l'erreur
          map.remove();
          mapInstance.current = null;
        };
      }
    }
  }, []);

  return <div ref={mapContainer} style={{ height: "200px", borderRadius: "10px" }} />;
}

export default Map;
