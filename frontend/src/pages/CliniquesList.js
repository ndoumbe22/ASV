import React, { useState, useEffect } from "react";

function CliniquesList() {
  const [cliniques, setCliniques] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // In a real implementation, this would fetch from the Django API
    // For now, we'll use mock data to preserve the exact design
    const mockCliniques = [
      {
        id: 1,
        nom: "Clinique du Bel-Air",
        adresse: "Rue Georges Pompidou, Dakar",
        telephone: "+221 33 111 22 33",
        email: "contact@belairclinic.sn",
      },
      {
        id: 2,
        nom: "Clinique Internationale de Dakar",
        adresse: "Avenue Léopold Sédar Senghor, Dakar",
        telephone: "+221 33 444 55 66",
        email: "info@cidakar.sn",
      },
      {
        id: 3,
        nom: "Clinique Pasteur",
        adresse: "Avenue Malick Sy, Dakar",
        telephone: "+221 33 777 88 99",
        email: "contact@pasteurclinic.sn",
      },
    ];
    setCliniques(mockCliniques);
  }, []);

  const filteredCliniques = cliniques.filter(
    (clinique) =>
      clinique.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinique.adresse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // Initialize map
    const initMap = () => {
      if (window.L && document.getElementById("map-cliniques")) {
        var map = window.L.map("map-cliniques").setView(
          [14.6928, -17.4467],
          12
        );
        window.L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "© OpenStreetMap contributors",
          }
        ).addTo(map);
        var marker = window.L.marker([14.6928, -17.4467]).addTo(map);

        document
          .getElementById("search-map-cliniques")
          .addEventListener("change", function (e) {
            let query = e.target.value;
            fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                query
              )}`
            )
              .then((response) => response.json())
              .then((data) => {
                if (data.length > 0) {
                  let lat = parseFloat(data[0].lat);
                  let lon = parseFloat(data[0].lon);
                  map.setView([lat, lon], 14);
                  marker.setLatLng([lat, lon]);
                } else {
                  alert("Aucun résultat trouvé.");
                }
              });
          });
      }
    };

    // Load Leaflet CSS and JS dynamically if not already loaded
    if (!document.querySelector('link[href*="leaflet"]')) {
      const leafletCSS = document.createElement("link");
      leafletCSS.rel = "stylesheet";
      leafletCSS.href = "https://unpkg.com/leaflet@1.9.5/dist/leaflet.css";
      document.head.appendChild(leafletCSS);
    }

    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.5/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    // Search functionality
    const handleSearch = (e) => {
      let filter = e.target.value.toLowerCase();
      document.querySelectorAll("#table-cliniques tbody tr").forEach((row) => {
        row.style.display = row.innerText.toLowerCase().includes(filter)
          ? ""
          : "none";
      });
    };

    const searchInput = document.getElementById("search-cliniques");
    if (searchInput) {
      searchInput.addEventListener("keyup", handleSearch);
      return () => searchInput.removeEventListener("keyup", handleSearch);
    }
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Liste des Cliniques</h2>

      <input
        type="text"
        id="search-cliniques"
        className="form-control w-50 mb-3"
        placeholder="Rechercher une clinique..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="row">
        <div className="col-lg-7">
          <table className="table table-bordered" id="table-cliniques">
            <thead className="table-primary">
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Téléphone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {filteredCliniques.length > 0 ? (
                filteredCliniques.map((clinique) => (
                  <tr key={clinique.id}>
                    <td>{clinique.nom}</td>
                    <td>{clinique.adresse}</td>
                    <td>{clinique.telephone || "-"}</td>
                    <td>{clinique.email || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">Aucune clinique trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="col-lg-4">
          <img
            src="/images/clinique.jpg"
            className="rounded shadow mb-3"
            style={{ width: "520px", height: "300px" }}
            alt="Clinique"
          />
          <input
            type="text"
            id="search-map-cliniques"
            className="form-control mb-2 w-75"
            placeholder="Localiser une clinique"
          />
          <div
            id="map-cliniques"
            style={{ height: "260px", width: "520px", borderRadius: "10px" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default CliniquesList;
