import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function Pharmacie() {
  const [pharmacies, setPharmacies] = useState([]); // ← vide au départ
  const [search, setSearch] = useState("");
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [query, setQuery] = useState("");

  // --- Fetch des pharmacies depuis l'API ---
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/pharmacies/")
      .then((res) => res.json())
      .then((data) => setPharmacies(data))
      .catch((err) => console.error("Erreur API Pharmacies:", err));
  }, []);

  // --- Initialisation de la carte ---
  useEffect(() => {
    const mapInstance = L.map("map-pharmacies").setView([14.6928, -17.4467], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstance);

    const markerInstance = L.marker([14.6928, -17.4467]).addTo(mapInstance);

    setMap(mapInstance);
    setMarker(markerInstance);

    return () => {
      mapInstance.remove();
    };
  }, []);

  // --- Recherche sur la carte ---
  const handleMapSearch = async (e) => {
    e.preventDefault();
    if (!query) return;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}`
    );
    const data = await response.json();
    if (data.length > 0) {
      let lat = parseFloat(data[0].lat);
      let lon = parseFloat(data[0].lon);
      map.setView([lat, lon], 14);
      marker.setLatLng([lat, lon]);
    } else {
      alert("Aucun résultat trouvé.");
    }
  };

  // --- Filtrage des pharmacies ---
  const filteredPharmacies = pharmacies.filter(
    (p) =>
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.adresse.toLowerCase().includes(search.toLowerCase()) ||
      (p.telephone && p.telephone.includes(search))
  );

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Liste des Pharmacies</h2>

      {/* 🔍 Recherche dans le tableau */}
      <input
        type="text"
        className="form-control w-50 mb-3"
        placeholder="Rechercher une pharmacie..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="row">
        {/* Tableau */}
        <div className="col-lg-7">
          <table className="table table-bordered">
            <thead className="table-info">
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Téléphone</th>
              </tr>
            </thead>
            <tbody>
              {filteredPharmacies.length > 0 ? (
                filteredPharmacies.map((pharmacie, index) => (
                  <tr key={index}>
                    <td>{pharmacie.nom}</td>
                    <td>{pharmacie.adresse}</td>
                    <td>{pharmacie.telephone || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">Aucune pharmacie trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Carte + image */}
        <div className="col-lg-4">
          <img
            src="/images/pharmacie.jpg"
            className="rounded shadow mb-3"
            style={{ width: "520px", height: "300px" }}
            alt="Pharmacie"
          />

          {/* Recherche sur la carte */}
          <form onSubmit={handleMapSearch}>
            <input
              type="text"
              className="form-control mb-2 w-75"
              placeholder="Localiser une pharmacie"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Rechercher
            </button>
          </form>

          <div
            id="map-pharmacies"
            style={{ height: "260px", width: "520px", borderRadius: "10px" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default Pharmacie;
