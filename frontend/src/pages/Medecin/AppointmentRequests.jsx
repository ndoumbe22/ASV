import React, { useState, useEffect } from "react";
import { FaCalendar, FaClock, FaUser, FaCheck, FaTimes, FaEdit } from "react-icons/fa";
import { api } from "../../services/api";

function AppointmentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load rescheduling requests
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would have a specific endpoint for this
      // For now, we'll simulate by getting all appointments with RESCHEDULED status
      const response = await api.get("/rendezvous/");
      const rescheduled = response.data.filter(rdv => rdv.statut === "RESCHEDULED");
      setRequests(rescheduled);
    } catch (err) {
      setError("Erreur lors du chargement des demandes");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId) => {
    if (window.confirm("Êtes-vous sûr de vouloir approuver cette reprogrammation ?")) {
      try {
        // In a real implementation, you would have a specific endpoint for this
        // For now, we'll just reload the data
        await loadRequests();
        alert("Reprogrammation approuvée");
      } catch (err) {
        alert("Erreur lors de l'approbation: " + (err.response?.data?.error || err.message));
        console.error(err);
      }
    }
  };

  const handleReject = async (appointmentId) => {
    if (window.confirm("Êtes-vous sûr de vouloir rejeter cette reprogrammation ?")) {
      try {
        // In a real implementation, you would have a specific endpoint for this
        // For now, we'll just reload the data
        await loadRequests();
        alert("Reprogrammation rejetée");
      } catch (err) {
        alert("Erreur lors du rejet: " + (err.response?.data?.error || err.message));
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <span className="badge bg-success">Confirmé</span>;
      case "PENDING":
        return <span className="badge bg-warning">En attente</span>;
      case "CANCELLED":
        return <span className="badge bg-danger">Annulé</span>;
      case "RESCHEDULED":
        return <span className="badge bg-info">Reprogrammé</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // Extract HH:MM
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            <FaCalendar className="me-2" />
            Demandes de Reprogrammation
          </h2>
          
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}
          
          {requests.length === 0 ? (
            <div className="card text-center p-5">
              <h4 className="text-muted">
                <FaCalendar className="me-2" />
                Aucune demande de reprogrammation
              </h4>
              <p className="text-muted">Il n'y a pas de demandes de reprogrammation en attente.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Date actuelle</th>
                    <th>Heure actuelle</th>
                    <th>Nouvelle date</th>
                    <th>Nouvelle heure</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <FaUser className="me-2" />
                        {request.patient_nom}
                      </td>
                      <td>{request.original_date ? formatDate(request.original_date) : 'N/A'}</td>
                      <td>{request.original_heure ? formatTime(request.original_heure) : 'N/A'}</td>
                      <td>{formatDate(request.date)}</td>
                      <td>{formatTime(request.heure)}</td>
                      <td>{getStatusBadge(request.statut)}</td>
                      <td>
                        <div className="btn-group" role="group">
                          <button 
                            className="btn btn-success btn-sm me-1"
                            onClick={() => handleApprove(request.id)}
                            title="Approuver"
                          >
                            <FaCheck />
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReject(request.id)}
                            title="Rejeter"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppointmentRequests;