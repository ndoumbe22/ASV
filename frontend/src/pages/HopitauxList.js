import React, { useState, useEffect } from "react";
import HealthFacilitiesMap from "../components/Map";

function HopitauxList() {
  const [hopitaux, setHopitaux] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // In a real implementation, this would fetch from the Django API
    // For now, we'll use mock data to preserve the exact design
    const mockHopitaux = [
      {
        id: 1,
        nom: "Hôpital Principal de Dakar",
        adresse: "Avenue Georges Pompidou, Dakar",
        telephone: "+221 33 123 45 67",
        email: "contact@hpd.sn",
        site_web: "https://www.hopital-principal.sn",
      },
      {
        id: 2,
        nom: "Hôpital Aristide Le Dantec",
        adresse: "Rue Carnot, Dakar",
        telephone: "+221 33 987 65 43",
        email: "info@ald.sn",
        site_web: "https://www.ald.sn",
      },
      {
        id: 3,
        nom: "Clinique Pasteur",
        adresse: "Avenue Malick Sy, Dakar",
        telephone: "+221 33 456 78 90",
        email: "contact@pasteur.sn",
        site_web: "https://www.pasteur.sn",
      },
    ];
    setHopitaux(mockHopitaux);
  }, []);

  const filteredHopitaux = hopitaux.filter(
    (hopital) =>
      hopital.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hopital.adresse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Liste des Hôpitaux</h2>

      <input
        type="text"
        id="search-hopitaux"
        className="form-control w-50 mb-3"
        placeholder="Rechercher un hôpital..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="row">
        <div className="col-lg-7">
          <table className="table table-bordered" id="table-hopitaux">
            <thead className="table-primary">
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Site web</th>
              </tr>
            </thead>
            <tbody>
              {filteredHopitaux.length > 0 ? (
                filteredHopitaux.map((hopital) => (
                  <tr key={hopital.id}>
                    <td>{hopital.nom}</td>
                    <td>{hopital.adresse}</td>
                    <td>{hopital.telephone || "-"}</td>
                    <td>{hopital.email || "-"}</td>
                    <td>
                      {hopital.site_web ? (
                        <a
                          href={hopital.site_web}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {hopital.site_web}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">Aucun hôpital trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="col-lg-5">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                Carte des hôpitaux et centres de santé
              </h5>
              <p className="card-text">
                Localisez les hôpitaux, cliniques, pharmacies et dentistes près
                de chez vous.
              </p>
              <HealthFacilitiesMap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HopitauxList;
