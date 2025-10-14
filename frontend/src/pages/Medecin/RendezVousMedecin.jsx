import React, { useState, useEffect } from "react";

function RendezVousMedecin() {
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous");

  useEffect(() => {
    loadRendezVous();
  }, [filter]);

  const loadRendezVous = async () => {
    try {
      setLoading(true);
      // TODO: Implémenter l'API
      // const data = await rendezVousService.getMedecinRendezVous(filter);
      // setRendezVous(data);

      setRendezVous([]);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2>
            <i className="bi bi-calendar-check text-primary"></i> Mes Rendez-vous
          </h2>
        </div>
      </div>

      {/* Filtres */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="btn-group" role="group">
            <button
              className={`btn ${
                filter === "tous" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setFilter("tous")}
            >
              Tous
            </button>
            <button
              className={`btn ${
                filter === "aujourdhui" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setFilter("aujourdhui")}
            >
              Aujourd'hui
            </button>
            <button
              className={`btn ${
                filter === "a_venir" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setFilter("a_venir")}
            >
              À venir
            </button>
            <button
              className={`btn ${
                filter === "passes" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setFilter("passes")}
            >
              Passés
            </button>
          </div>
        </div>
      </div>

      {/* Liste */}
      {rendezVous.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle"></i> Aucun rendez-vous pour cette période.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rendezVous.map((rdv) => (
                <tr key={rdv.id}>
                  <td>{rdv.patient}</td>
                  <td>{rdv.date}</td>
                  <td>{rdv.heure}</td>
                  <td>
                    <span className="badge bg-primary">{rdv.statut}</span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary">Détails</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default RendezVousMedecin;