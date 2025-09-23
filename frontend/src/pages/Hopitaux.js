import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function Hopitaux() {
  const [search, setSearch] = useState("");
  const [hopitaux, setHopitaux] = useState([]); // ← vide au départ

  // --- Fetch des hôpitaux depuis l'API ---
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/hopitaux/")
      .then((res) => res.json())
      .then((data) => setHopitaux(data))
      .catch((err) => console.error("Erreur API Hôpitaux:", err));
  }, []);

  // --- Initialisation de la carte Leaflet ---
  useEffect(() => {
    const map = L.map("map-hopitaux").setView([14.6928, -17.4467], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const marker = L.marker([14.6928, -17.4467]).addTo(map);

    // Recherche géographique via Nominatim
    const input = document.getElementById("search-map-hopitaux");
    if (input) {
      input.addEventListener("change", (e) => {
        const query = e.target.value;
        fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
          )}`
        )
          .then((res) => res.json())
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

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Liste des Hôpitaux</h2>

      {/* 🔎 Barre de recherche */}
      <input
        type="text"
        className="form-control w-50 mb-3"
        placeholder="Rechercher un hôpital..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="row">
        {/* 📋 Tableau des hôpitaux */}
        <div className="col-lg-7">
          <table className="table table-bordered">
            <thead className="table-primary">
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Téléphone</th>
              </tr>
            </thead>
            <tbody>
              {hopitaux
                .filter((h) =>
                  h.nom.toLowerCase().includes(search.toLowerCase())
                )
                .map((hopital, index) => (
                  <tr key={index}>
                    <td>{hopital.nom}</td>
                    <td>{hopital.adresse}</td>
                    <td>{hopital.telephone || "-"}</td>
                  </tr>
                ))}
              {hopitaux.filter((h) =>
                h.nom.toLowerCase().includes(search.toLowerCase())
              ).length === 0 && (
                <tr>
                  <td colSpan="5">Aucun hôpital trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🗺️ Carte + Recherche géographique */}
        <div className="col-lg-4">
          <img
            src="/images/hopital.jpg" // ✅ Mets ton image dans public/image/
            className="rounded shadow mb-3"
            style={{ width: "520px", height: "300px" }}
            alt="Hopital"
          />
          <input
            type="text"
            id="search-map-hopitaux"
            className="form-control mb-2 w-75"
            placeholder="Localiser un hôpital"
          />
          <div
            id="map-hopitaux"
            style={{ height: "260px", width: "520px", borderRadius: "10px" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default Hopitaux;
