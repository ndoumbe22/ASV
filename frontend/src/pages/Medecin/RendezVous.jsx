import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { appointmentAPI, doctorAPI } from "../../services/api";
import { FaCalendarAlt, FaUser, FaSearch, FaCheck, FaTimes, FaClock, FaEdit } from "react-icons/fa";

function RendezVous() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    const filtered = appointments.filter(
      (appointment) =>
        appointment.patient_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.date?.includes(searchTerm)
    );
    setFilteredAppointments(filtered);
  }, [searchTerm, appointments]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointments();
      
      // Filter appointments for the current doctor
      let doctorAppointments = response.data;
      if (user) {
        // Filter appointments for this doctor using medecin_nom field
        // This matches the doctor's full name in the format "First Last"
        const doctorName = `${user.first_name} ${user.last_name}`.trim();
        doctorAppointments = response.data.filter(app => 
          app.medecin_nom === `Dr. ${doctorName}`
        );
      }
      
      setAppointments(doctorAppointments);
      setFilteredAppointments(doctorAppointments);
    } catch (err) {
      setError("Erreur lors du chargement des rendez-vous");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (appointment) => {
    try {
      // Use the ID field that's available in the appointment object
      const id = appointment.numero || appointment.id;
      
      if (!id) {
        throw new Error("ID de rendez-vous manquant");
      }
      
      const response = await appointmentAPI.updateAppointment(id, { statut: "CONFIRMED" });
      setAppointments(appointments.map(app => 
        (app.numero === id || app.id === id) ? { ...app, statut: "CONFIRMED" } : app
      ));
      setFilteredAppointments(filteredAppointments.map(app => 
        (app.numero === id || app.id === id) ? { ...app, statut: "CONFIRMED" } : app
      ));
      
      // Show success message
      alert("Rendez-vous confirmé avec succès !");
    } catch (err) {
      setError("Erreur lors de la confirmation du rendez-vous");
      console.error("Error confirming appointment:", err);
      
      // Show specific error message to user
      let errorMessage = "Erreur lors de la confirmation du rendez-vous. Veuillez réessayer.";
      
      if (err.response) {
        if (err.response.data) {
          if (err.response.data.error) {
            errorMessage = `Erreur: ${err.response.data.error}`;
          } else if (err.response.data.detail) {
            errorMessage = `Erreur: ${err.response.data.detail}`;
          } else if (err.response.data.message) {
            errorMessage = `Erreur: ${err.response.data.message}`;
          } else if (typeof err.response.data === 'object') {
            // Try to get the first error message from the object
            const firstKey = Object.keys(err.response.data)[0];
            if (firstKey) {
              const firstValue = err.response.data[firstKey];
              if (Array.isArray(firstValue)) {
                errorMessage = `Erreur ${firstKey}: ${firstValue.join(', ')}`;
              } else {
                errorMessage = `Erreur ${firstKey}: ${firstValue}`;
              }
            }
          } else if (typeof err.response.data === 'string') {
            errorMessage = `Erreur: ${err.response.data}`;
          }
        } else if (err.response.status) {
          errorMessage = `Erreur ${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err.request) {
        errorMessage = "Erreur réseau: Aucune réponse du serveur";
      } else if (err.message) {
        errorMessage = `Erreur: ${err.message}`;
      }
      
      alert(errorMessage);
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
      alert("Rendez-vous annulé avec succès !");
    } catch (err) {
      setError("Erreur lors de l'annulation du rendez-vous");
      console.error("Error cancelling appointment:", err);
      
      // Show specific error message to user
      let errorMessage = "Erreur lors de l'annulation du rendez-vous. Veuillez réessayer.";
      
      if (err.response) {
        if (err.response.data) {
          if (err.response.data.error) {
            errorMessage = `Erreur: ${err.response.data.error}`;
          } else if (err.response.data.detail) {
            errorMessage = `Erreur: ${err.response.data.detail}`;
          } else if (err.response.data.message) {
            errorMessage = `Erreur: ${err.response.data.message}`;
          } else if (typeof err.response.data === 'object') {
            // Try to get the first error message from the object
            const firstKey = Object.keys(err.response.data)[0];
            if (firstKey) {
              const firstValue = err.response.data[firstKey];
              if (Array.isArray(firstValue)) {
                errorMessage = `Erreur ${firstKey}: ${firstValue.join(', ')}`;
              } else {
                errorMessage = `Erreur ${firstKey}: ${firstValue}`;
              }
            }
          } else if (typeof err.response.data === 'string') {
            errorMessage = `Erreur: ${err.response.data}`;
          }
        } else if (err.response.status) {
          errorMessage = `Erreur ${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err.request) {
        errorMessage = "Erreur réseau: Aucune réponse du serveur";
      } else if (err.message) {
        errorMessage = `Erreur: ${err.message}`;
      }
      
      alert(errorMessage);
    }
  };

  // Reschedule appointment function for doctors
  const handleReschedule = async (appointment) => {
    // Get today's date for validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Prompt for new date and time
    const newDate = prompt("Nouvelle date (YYYY-MM-DD) :");
    if (!newDate) return;
    
    // Validate that the date is not in the past
    const newDateObj = new Date(newDate);
    newDateObj.setHours(0, 0, 0, 0);
    
    if (newDateObj < today) {
      alert("Veuillez sélectionner une date future valide");
      return;
    }
    
    const newTime = prompt("Nouvelle heure (HH:MM) :");
    if (!newTime) return;

    try {
      // Use the ID field that's available in the appointment object
      const id = appointment.numero || appointment.id;
      
      if (!id) {
        throw new Error("ID de rendez-vous manquant");
      }
      
      // Update the appointment with new date and time, and set status to RESCHEDULED
      const response = await appointmentAPI.updateAppointment(id, { 
        date: newDate, 
        heure: newTime, 
        statut: "RESCHEDULED" 
      });
      
      // Update the local state
      setAppointments(appointments.map(app => 
        (app.numero === id || app.id === id) ? { ...app, date: newDate, heure: newTime, statut: "RESCHEDULED" } : app
      ));
      setFilteredAppointments(filteredAppointments.map(app => 
        (app.numero === id || app.id === id) ? { ...app, date: newDate, heure: newTime, statut: "RESCHEDULED" } : app
      ));
      
      // Show success message
      alert("Rendez-vous reprogrammé avec succès !");
    } catch (err) {
      setError("Erreur lors de la reprogrammation du rendez-vous");
      console.error("Error rescheduling appointment:", err);
      
      // Show specific error message to user
      let errorMessage = "Erreur lors de la reprogrammation du rendez-vous. Veuillez réessayer.";
      
      if (err.response) {
        if (err.response.data) {
          if (err.response.data.error) {
            errorMessage = `Erreur: ${err.response.data.error}`;
          } else if (err.response.data.detail) {
            errorMessage = `Erreur: ${err.response.data.detail}`;
          } else if (err.response.data.message) {
            errorMessage = `Erreur: ${err.response.data.message}`;
          } else if (typeof err.response.data === 'object') {
            // Try to get the first error message from the object
            const firstKey = Object.keys(err.response.data)[0];
            if (firstKey) {
              const firstValue = err.response.data[firstKey];
              if (Array.isArray(firstValue)) {
                errorMessage = `Erreur ${firstKey}: ${firstValue.join(', ')}`;
              } else {
                errorMessage = `Erreur ${firstKey}: ${firstValue}`;
              }
            }
          } else if (typeof err.response.data === 'string') {
            errorMessage = `Erreur: ${err.response.data}`;
          }
        } else if (err.response.status) {
          errorMessage = `Erreur ${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err.request) {
        errorMessage = "Erreur réseau: Aucune réponse du serveur";
      } else if (err.message) {
        errorMessage = `Erreur: ${err.message}`;
      }
      
      alert(errorMessage);
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
          {filteredAppointments.map((appointment) => (
            <div key={appointment.numero} className="col-md-6 mb-3">
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
                          onClick={() => handleReschedule(appointment)}
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
                          onClick={() => handleReschedule(appointment)}
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
                          onClick={() => handleReschedule(appointment)}
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
    </div>
  );
}

export default RendezVous;