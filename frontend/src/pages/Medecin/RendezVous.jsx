import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { appointmentAPI } from "../../services/api";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaUser, FaSearch, FaCheck, FaTimes, FaClock, FaEdit } from "react-icons/fa";

function RendezVous() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({});
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointments();
      
      // Ensure we're working with an array
      let appointmentsData = [];
      if (response && response.data) {
        appointmentsData = Array.isArray(response.data) ? response.data : [];
      }
      
      // Filter appointments for the current doctor
      let doctorAppointments = appointmentsData;
      if (user) {
        // Filter appointments for this doctor using medecin_nom field
        // This matches the doctor's full name in the format "First Last"
        const doctorName = `${user.first_name} ${user.last_name}`.trim();
        doctorAppointments = appointmentsData.filter(app => 
          app.medecin_nom === `Dr. ${doctorName}`
        );
      }
      
      setAppointments(doctorAppointments);
      setFilteredAppointments(doctorAppointments);
    } catch (err) {
      setError("Erreur lors du chargement des rendez-vous");
      console.error(err);
      toast.error("Erreur lors du chargement des rendez-vous");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    const filtered = appointments.filter(
      (appointment) =>
        appointment.patient_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.date?.includes(searchTerm)
    );
    setFilteredAppointments(filtered);
  }, [searchTerm, appointments]);

  const handleConfirm = async (appointment) => {
    try {
      // Use the ID field that's available in the appointment object
      const id = appointment.numero || appointment.id;
      
      if (!id) {
        throw new Error("ID de rendez-vous manquant");
      }
      
      await appointmentAPI.updateAppointment(id, { statut: "CONFIRMED" });
      setAppointments(appointments.map(app => 
        (app.numero === id || app.id === id) ? { ...app, statut: "CONFIRMED" } : app
      ));
      setFilteredAppointments(filteredAppointments.map(app => 
        (app.numero === id || app.id === id) ? { ...app, statut: "CONFIRMED" } : app
      ));
      
      // Show success message
      toast.success("Rendez-vous confirmé avec succès !");
    } catch (err) {
      setError("Erreur lors de la confirmation du rendez-vous");
      console.error("Error confirming appointment:", err);
      toast.error("Erreur lors de la confirmation du rendez-vous");
    }
  };

  const handleCancel = async (appointment) => {
    try {
      // Use the ID field that's available in the appointment object
      const id = appointment.numero || appointment.id;
      
      if (!id) {
        throw new Error("ID de rendez-vous manquant");
      }
      
      await appointmentAPI.updateAppointment(id, { statut: "CANCELLED" });
      setAppointments(appointments.map(app => 
        (app.numero === id || app.id === id) ? { ...app, statut: "CANCELLED" } : app
      ));
      setFilteredAppointments(filteredAppointments.map(app => 
        (app.numero === id || app.id === id) ? { ...app, statut: "CANCELLED" } : app
      ));
      
      // Show success message
      toast.success("Rendez-vous annulé avec succès !");
    } catch (err) {
      setError("Erreur lors de l'annulation du rendez-vous");
      console.error("Error cancelling appointment:", err);
      toast.error("Erreur lors de l'annulation du rendez-vous");
    }
  };

  // Open reschedule modal
  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleData({
      date: appointment.date || "",
      heure: appointment.heure || "",
      description: appointment.description || ""
    });
    setShowRescheduleModal(true);
  };

  // Close reschedule modal
  const closeRescheduleModal = () => {
    setShowRescheduleModal(false);
    setSelectedAppointment(null);
    setRescheduleData({});
  };

  // Handle reschedule form changes
  const handleRescheduleChange = (e) => {
    const { name, value } = e.target;
    setRescheduleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reschedule appointment function for doctors
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Use the ID field that's available in the appointment object
      const id = selectedAppointment.numero || selectedAppointment.id;
      
      if (!id) {
        throw new Error("ID de rendez-vous manquant");
      }
      
      // Call the doctor reschedule API endpoint
      await appointmentAPI.doctorRescheduleAppointment(id, rescheduleData);
      
      // Reload appointments to get the updated data
      loadAppointments();
      
      // Close modal and show success message
      closeRescheduleModal();
      toast.success("Rendez-vous reprogrammé avec succès ! Le patient a été notifié de la nouvelle date.");
    } catch (err) {
      setError("Erreur lors de la reprogrammation du rendez-vous");
      console.error("Error rescheduling appointment:", err);
      toast.error("Erreur lors de la reprogrammation du rendez-vous");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "CONFIRMED":
        return <span className="badge bg-success">Confirmé</span>;
      case "CANCELLED":
        return <span className="badge bg-danger">Annulé</span>;
      case "RESCHEDULED":
        return <span className="badge bg-warning">Reprogrammé</span>;
      case "PENDING":
        return <span className="badge bg-info">En attente</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  if (loading) {
    return <div className="text-center py-5">Chargement...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Erreur: {error}</div>;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Rendez-vous</h2>
        <div style={{ position: "relative", width: "250px" }}>
          <input
            type="text"
            placeholder="Rechercher un rendez-vous..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
          <FaSearch
            style={{
              position: "absolute",
              top: "50%",
              right: "12px",
              transform: "translateY(-50%)",
              color: "#888",
            }}
          />
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="alert alert-info">Aucun rendez-vous trouvé.</div>
      ) : (
        <div className="row">
          {filteredAppointments.map((appointment, index) => (
            <div key={`appointment-${appointment.numero || appointment.id || index}`} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">
                    <FaUser className="me-2" />
                    {appointment.patient_nom}
                  </h5>
                  <p className="card-text">
                    <FaCalendarAlt className="me-2" />
                    {formatDate(appointment.date)}
                  </p>
                  <p className="card-text">
                    <FaClock className="me-2" />
                    {appointment.heure}
                  </p>
                  {appointment.description && (
                    <p className="card-text">{appointment.description}</p>
                  )}
                  <p className="card-text">
                    <strong>Type :</strong>{" "}
                    {appointment.type_consultation === "teleconsultation" ? (
                      <span className="badge bg-info">📹 Téléconsultation</span>
                    ) : (
                      <span className="badge bg-success">🏥 Au cabinet</span>
                    )}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    {getStatusBadge(appointment.statut)}
                    {appointment.statut === "PENDING" && (
                      <div>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleConfirm(appointment)}
                        >
                          <FaCheck className="me-1" />
                          Confirmer
                        </button>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => openRescheduleModal(appointment)}
                        >
                          <FaEdit className="me-1" />
                          Reporter
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancel(appointment)}
                        >
                          <FaTimes className="me-1" />
                          Annuler
                        </button>
                      </div>
                    )}
                    {appointment.statut === "CONFIRMED" && (
                      <div>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => openRescheduleModal(appointment)}
                        >
                          <FaEdit className="me-1" />
                          Reporter
                        </button>
                      </div>
                    )}
                    {(appointment.statut === "RESCHEDULED") && (
                      <div>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleConfirm(appointment)}
                        >
                          <FaCheck className="me-1" />
                          Confirmer
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => openRescheduleModal(appointment)}
                        >
                          <FaEdit className="me-1" />
                          Reporter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reprogrammer le rendez-vous</h5>
                <button type="button" className="btn-close" onClick={closeRescheduleModal}></button>
              </div>
              <form onSubmit={handleRescheduleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Patient</label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedAppointment?.patient_nom || ""}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nouvelle date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={rescheduleData.date || ""}
                      onChange={handleRescheduleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nouvelle heure</label>
                    <input
                      type="time"
                      className="form-control"
                      name="heure"
                      value={rescheduleData.heure || ""}
                      onChange={handleRescheduleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description (optionnelle)</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={rescheduleData.description || ""}
                      onChange={handleRescheduleChange}
                      rows="3"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeRescheduleModal}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Reprogrammer
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

export default RendezVous;