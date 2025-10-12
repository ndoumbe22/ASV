import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { urgenceService } from "../../services/urgenceService";

function DashboardMedecin() {
  const [stats, setStats] = useState({
    patientsTotal: 0,
    consultationsJour: 0,
    urgencesPending: 0,
    articlesPublies: 0,
  });
  const [urgences, setUrgences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // In a real application, we would fetch actual data from the API
      // For now, we'll use mock data
      setTimeout(() => {
        const mockUrgences = [
          {
            id: 1,
            type_urgence: "Douleur thoracique",
            patient_nom: "Mamadou Fall",
            temps_ecoule: "5 minutes",
            priorite: "critique"
          },
          {
            id: 2,
            type_urgence: "Fracture du poignet",
            patient_nom: "Awa Diop",
            temps_ecoule: "12 minutes",
            priorite: "elevee"
          },
          {
            id: 3,
            type_urgence: "Maux de tête persistants",
            patient_nom: "Cheikh Sow",
            temps_ecoule: "25 minutes",
            priorite: "moyenne"
          }
        ];
        
        setUrgences(mockUrgences.slice(0, 5)); // Top 5
        setStats({
          patientsTotal: 45,
          consultationsJour: 8,
          urgencesPending: mockUrgences.length,
          articlesPublies: 12,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erreur:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-medecin container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="mb-2">
            <i className="bi bi-hospital text-primary"></i> Espace Médecin
          </h1>
          <p className="text-muted">Vue d'ensemble de votre activité</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i
                className="bi bi-people text-primary"
                style={{ fontSize: "2.5rem" }}
              ></i>
              <h3 className="mt-2 mb-0">{stats.patientsTotal}</h3>
              <p className="text-muted mb-0">Patients suivis</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i
                className="bi bi-calendar-check text-success"
                style={{ fontSize: "2.5rem" }}
              ></i>
              <h3 className="mt-2 mb-0">{stats.consultationsJour}</h3>
              <p className="text-muted mb-0">Consultations aujourd'hui</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm border-warning">
            <div className="card-body text-center">
              <i
                className="bi bi-exclamation-triangle text-warning"
                style={{ fontSize: "2.5rem" }}
              ></i>
              <h3 className="mt-2 mb-0 text-warning">
                {stats.urgencesPending}
              </h3>
              <p className="text-muted mb-0">Urgences en attente</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <i
                className="bi bi-file-text text-info"
                style={{ fontSize: "2.5rem" }}
              ></i>
              <h3 className="mt-2 mb-0">{stats.articlesPublies}</h3>
              <p className="text-muted mb-0">Articles publiés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Urgences récentes */}
      {urgences.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-exclamation-octagon text-danger"></i> Urgences
                  en Attente
                </h5>
                <Link to="/medecin/urgences" className="btn btn-sm btn-primary">
                  Voir tout
                </Link>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  {urgences.map((urgence) => (
                    <div
                      key={urgence.id}
                      className="list-group-item border-0 px-0"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{urgence.type_urgence}</h6>
                          <p className="mb-1 text-muted">
                            {urgence.patient_nom}
                          </p>
                          <small className="text-muted">
                            <i className="bi bi-clock"></i> {urgence.temps_ecoule}
                          </small>
                        </div>
                        <span
                          className={`badge bg-${
                            urgence.priorite === "critique"
                              ? "danger"
                              : urgence.priorite === "elevee"
                              ? "warning"
                              : "info"
                          }`}
                        >
                          {urgence.priorite}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="row">
        <div className="col-md-4 mb-3">
          <Link to="/medecin/urgences" className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <i
                  className="bi bi-hospital text-danger"
                  style={{ fontSize: "2rem" }}
                ></i>
                <h6 className="mt-2">Gérer les Urgences</h6>
                <p className="text-muted mb-0">
                  Prendre en charge les urgences
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4 mb-3">
          <Link to="/medecin/articles" className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <i
                  className="bi bi-pencil-square text-primary"
                  style={{ fontSize: "2rem" }}
                ></i>
                <h6 className="mt-2">Mes Articles</h6>
                <p className="text-muted mb-0">Rédiger des articles santé</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4 mb-3">
          <Link to="/medecin/rendez-vous" className="text-decoration-none">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <i
                  className="bi bi-calendar-check text-success"
                  style={{ fontSize: "2rem" }}
                ></i>
                <h6 className="mt-2">Rendez-vous</h6>
                <p className="text-muted mb-0">Gérer mes consultations</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardMedecin;
