import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendar, FaHistory, FaClock, FaUserMd, FaUser, FaCheck, FaTimes, FaEdit } from "react-icons/fa";
import { api } from "../../services/api";

function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    new_date: "",
    new_heure: "",
    reason: ""
  });

  // Load appointments
  useEffect(() => {
    loadAppointments();
    loadHistory();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/appointments/upcoming/");
      setAppointments(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des rendez-vous");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await api.get("/appointments/history/");
      setHistory(response.data);
    } catch (err) {
      setError("Erreur lors du chargement de l'historique");
      console.error(err);
    }
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleData({
      new_date: "",
      new_heure: "",
      reason: ""
    });
    setShowRescheduleModal(true);
  };

  const submitReschedule = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/appointments/${selectedAppointment.id}/propose-reschedule/`, rescheduleData);
      setShowRescheduleModal(false);
      loadAppointments();
      loadHistory();
      alert("Demande de reprogrammation envoyée avec succès");
    } catch (err) {
      alert("Erreur lors de l'envoi de la demande: " + (err.response?.data?.error || err.message));
      console.error(err);
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
      case "TERMINE":
        return <span className="badge bg-secondary">Terminé</span>;
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
            Mes Rendez-vous
          </h2>
          
          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === "upcoming" ? "active" : ""}`}
                onClick={() => setActiveTab("upcoming")}
              >
                <FaClock className="me-2" />
                À venir
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                <FaHistory className="me-2" />
                Historique
              </button>
            </li>
          </ul>
          
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}
          
          {/* Upcoming Appointments */}
          {activeTab === "upcoming" && (
            <div className="row">
              {appointments.length === 0 ? (
                <div className="col-12">
                  <div className="card text-center p-5">
                    <h4 className="text-muted">
                      <FaCalendar className="me-2" />
                      Aucun rendez-vous à venir
                    </h4>
                    <p className="text-muted">Vous n'avez pas de rendez-vous programmé pour le moment.</p>
                  </div>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-primary text-white">
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">
                            <FaUserMd className="me-2" />
                            Rendez-vous
                          </h5>
                          {getStatusBadge(appointment.statut)}
                        </div>
                      </div>
                      <div className="card-body">
                        <p className="card-text">
                          <FaUserMd className="me-2" />
                          <strong>Médecin:</strong> {appointment.medecin_nom}
                        </p>
                        <p className="card-text">
                          <FaCalendar className="me-2" />
                          <strong>Date:</strong> {formatDate(appointment.date)}
                        </p>
                        <p className="card-text">
                          <FaClock className="me-2" />
                          <strong>Heure:</strong> {formatTime(appointment.heure)}
                        </p>
                        {appointment.description && (
                          <p className="card-text">
                            <strong>Description:</strong> {appointment.description}
                          </p>
                        )}
                      </div>
                      <div className="card-footer">
                        <div className="d-grid gap-2">
                          {appointment.statut === "CONFIRMED" && (
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => navigate(`/patient/rendez-vous/${appointment.id}/valider`)}
                            >
                              <FaCheck className="me-2" />
                              Valider et noter
                            </button>
                          )}
                          {appointment.statut !== "CANCELLED" && appointment.statut !== "TERMINE" && (
                            <button 
                              className="btn btn-warning btn-sm"
                              onClick={() => handleReschedule(appointment)}
                            >
                              <FaEdit className="me-2" />
                              Reprogrammer
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Appointment History */}
          {activeTab === "history" && (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Médecin</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        Aucun historique de rendez-vous
                      </td>
                    </tr>
                  ) : (
                    history.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{formatDate(appointment.date)}</td>
                        <td>{formatTime(appointment.heure)}</td>
                        <td>{appointment.medecin_nom}</td>
                        <td>{getStatusBadge(appointment.statut)}</td>
                        <td>
                          {appointment.statut === "RESCHEDULED" && appointment.original_date && (
                            <span className="badge bg-info">
                              Reprogrammé depuis le {formatDate(appointment.original_date)}
                            </span>
                          )}
                          {appointment.statut === "CONFIRMED" && (
                            <button 
                              className="btn btn-success btn-sm ms-2"
                              onClick={() => navigate(`/patient/rendez-vous/${appointment.id}/valider`)}
                            >
                              <FaCheck className="me-1" />
                              Valider
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FaEdit className="me-2" />
                  Reprogrammer le rendez-vous
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowRescheduleModal(false)}
                ></button>
              </div>
              <form onSubmit={submitReschedule}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Date actuelle</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formatDate(selectedAppointment.date)}
                      disabled
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Heure actuelle</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formatTime(selectedAppointment.heure)}
                      disabled
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Nouvelle date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={rescheduleData.new_date}
                      onChange={(e) => setRescheduleData({...rescheduleData, new_date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Nouvelle heure *</label>
                    <input
                      type="time"
                      className="form-control"
                      value={rescheduleData.new_heure}
                      onChange={(e) => setRescheduleData({...rescheduleData, new_heure: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Raison de la reprogrammation</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={rescheduleData.reason}
                      onChange={(e) => setRescheduleData({...rescheduleData, reason: e.target.value})}
                      placeholder="Expliquez brièvement pourquoi vous souhaitez reprogrammer..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowRescheduleModal(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Envoyer la demande
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;