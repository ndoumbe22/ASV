import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { patientAPI } from "../../services/api";
import "./DashboardPatient.css";

function DashboardPatient() {
  const [stats, setStats] = useState({
    prochainRdv: null,
    rappelsActifs: 0,
    urgencesEnCours: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // In a real application, we would fetch actual data from the API
      // For now, we'll use mock data
      setTimeout(() => {
        setStats({
          prochainRdv: null,
          rappelsActifs: 3,
          urgencesEnCours: 0,
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
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-patient container-fluid p-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="mb-3">
            <i className="bi bi-speedometer2 text-primary"></i> Tableau de Bord
          </h1>
          <p className="text-muted">Bienvenue sur votre espace patient</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card stat-card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="stat-icon text-primary mb-2">
                <i
                  className="bi bi-calendar-check"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
              <h3 className="mb-1">{stats.prochainRdv ? "1" : "0"}</h3>
              <p className="text-muted mb-0">Prochain RDV</p>
              {stats.prochainRdv && (
                <small className="text-success">
                  {new Date(stats.prochainRdv).toLocaleDateString("fr-FR")}
                </small>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card stat-card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="stat-icon text-info mb-2">
                <i className="bi bi-bell" style={{ fontSize: "2.5rem" }}></i>
              </div>
              <h3 className="mb-1">{stats.rappelsActifs}</h3>
              <p className="text-muted mb-0">Rappels actifs</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card stat-card border-0 shadow-sm">
            <div className="card-body text-center">
              <div className="stat-icon text-warning mb-2">
                <i
                  className="bi bi-exclamation-triangle"
                  style={{ fontSize: "2.5rem" }}
                ></i>
              </div>
              <h3 className="mb-1">{stats.urgencesEnCours}</h3>
              <p className="text-muted mb-0">Urgences en cours</p>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card stat-card border-0 shadow-sm bg-danger text-white">
            <div className="card-body text-center">
              <Link
                to="/patient/urgence"
                className="text-white text-decoration-none"
              >
                <div className="stat-icon mb-2">
                  <i
                    className="bi bi-exclamation-octagon"
                    style={{ fontSize: "2.5rem" }}
                  ></i>
                </div>
                <h5 className="mb-0">SOS URGENCE</h5>
                <small>Cliquez ici</small>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="row mb-4">
        <div className="col-12">
          <h4 className="mb-3">Actions Rapides</h4>
        </div>

        <div className="col-md-4 mb-3">
          <Link to="/patient/rendez-vous" className="text-decoration-none">
            <div className="card action-card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <i
                      className="bi bi-calendar-plus text-primary"
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Prendre RDV</h6>
                    <small className="text-muted">
                      Réserver une consultation
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4 mb-3">
          <Link
            to="/patient/medication-reminders"
            className="text-decoration-none"
          >
            <div className="card action-card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-info bg-opacity-10 p-3 rounded-circle me-3">
                    <i
                      className="bi bi-capsule text-info"
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Mes Médicaments</h6>
                    <small className="text-muted">Gérer les rappels</small>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4 mb-3">
          <Link to="/articles" className="text-decoration-none">
            <div className="card action-card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="icon-wrapper bg-success bg-opacity-10 p-3 rounded-circle me-3">
                    <i
                      className="bi bi-book text-success"
                      style={{ fontSize: "1.5rem" }}
                    ></i>
                  </div>
                  <div>
                    <h6 className="mb-0">Articles Santé</h6>
                    <small className="text-muted">Conseils et prévention</small>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Informations */}
      <div className="row">
        <div className="col-12">
          <div className="alert alert-info border-0">
            <h6 className="alert-heading">
              <i className="bi bi-info-circle"></i> Conseils Santé
            </h6>
            <p className="mb-0">
              Consultez régulièrement vos rappels de médicaments et n'hésitez
              pas à prendre rendez-vous pour un suivi médical. En cas d'urgence,
              utilisez le bouton SOS ci-dessus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPatient;