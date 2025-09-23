import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function MedecinGeneraliste() {
  const [search, setSearch] = useState("");
  const [medecins, setMedecins] = useState([]);

  // --- Récupération des médecins depuis l'API Django ---
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/medecins/")
      .then((res) => res.json())
      .then((data) => {
    const generalistes = data.filter((m) => {
    const specialite = m.specialite
      .toLowerCase()
      .normalize("NFD") // décompose les lettres accentuées
      .replace(/[\u0300-\u036f]/g, ""); // supprime les accents
    return specialite === "generaliste";
  });
  setMedecins(generalistes);
})

      .catch((err) => console.error("Erreur API :", err));
  }, []);

  // --- Initialisation de la carte Leaflet ---
  useEffect(() => {
    const map = L.map("map-generalistes").setView([14.6928, -17.4467], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    const marker = L.marker([14.6928, -17.4467]).addTo(map);

    const input = document.getElementById("search-map-generalistes");
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
              const lat = parseFloat(data[0].lat);
              const lon = parseFloat(data[0].lon);
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
      <h2 className="mb-4">Liste des Médecins Généralistes</h2>

      <input
        type="text"
        className="form-control w-50 mb-3"
        placeholder="Rechercher un médecin..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="row">
        {/* Table des médecins */}
        <div className="col-lg-7">
          <table className="table table-bordered">
            <thead className="table-success">
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Spécialité</th>
              </tr>
            </thead>
            <tbody>
              {medecins
                .filter((m) =>
                  m.user.first_name.toLowerCase().includes(search.toLowerCase()) ||
                  m.user.last_name.toLowerCase().includes(search.toLowerCase())
                )
                .map((medecin) => (
                  <tr key={medecin.id}>
                    <td>{`Dr. ${medecin.user.first_name} ${medecin.user.last_name}`}</td>
                    <td>{medecin.user.email || "-"}</td>
                    <td>{medecin.specialite}</td>
                  </tr>
                ))}
              {medecins.filter((m) =>
                m.user.first_name.toLowerCase().includes(search.toLowerCase()) ||
                m.user.last_name.toLowerCase().includes(search.toLowerCase())
              ).length === 0 && (
                <tr>
                  <td colSpan="5">Aucun médecin généraliste trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Carte + Recherche géographique */}
        <div className="col-lg-4">
          <img
            src="/images/medecin.jpg"
            className="rounded shadow mb-3"
            style={{ width: "520px", height: "300px" }}
            alt="Médecin"
          />
          <input
            type="text"
            id="search-map-generalistes"
            className="form-control mb-2 w-75"
            placeholder="Localiser un médecin"
          />
          <div
            id="map-generalistes"
            style={{ height: "260px", width: "520px", borderRadius: "10px" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default MedecinGeneraliste;
