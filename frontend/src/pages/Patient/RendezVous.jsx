import React, { useState, useEffect } from "react";
import { patientAPI, appointmentAPI } from "../../services/api";
import { FaCalendarCheck, FaUserMd, FaSearch, FaEdit } from "react-icons/fa";
import appointmentReminderService from "../../services/appointmentReminderService";

function RendezVous() {
  const [rendezvous, setRendezvous] = useState([]);
  const [filteredRdv, setFilteredRdv] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les rendez-vous depuis l'API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await patientAPI.getAppointments();
        setRendezvous(response.data);
        setFilteredRdv(response.data);
        setLoading(false);
        
        // Initialize appointment reminders for confirmed appointments
        response.data
          .filter(app => app.statut === "CONFIRMED")
          .forEach(app => {
            appointmentReminderService.addAppointmentReminder(app);
          });
      } catch (err) {
        setError("Erreur lors du chargement des rendez-vous");
        setLoading(false);
        console.error("Erreur lors du chargement des rendez-vous :", err);
      }
    };

    fetchAppointments();
  }, []);

  // Filtrer selon recherche
  useEffect(() => {
    const filtered = rendezvous.filter(
      (rdv) =>
        rdv.medecin_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rdv.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rdv.date?.includes(searchTerm)
    );
    setFilteredRdv(filtered);
  }, [searchTerm, rendezvous]);

  // Annuler un rendez-vous
  const cancelAppointment = async (appointment) => {
    try {
      // Use the ID field that's available in the appointment object
      const id = appointment.id || appointment.numero;
      
      await patientAPI.cancelAppointment(id);
      setRendezvous((prev) =>
        prev.map((rdv) =>
          (rdv.id === id || rdv.numero === id) ? { ...rdv, statut: "CANCELLED" } : rdv
        )
      );
      
      // Remove the reminder for this appointment
      appointmentReminderService.removeReminder(id);
      
      // Show success message
      alert("Rendez-vous annulé avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
      
      // Show specific error message to user
      let errorMessage = "Erreur lors de l'annulation du rendez-vous. Veuillez réessayer.";
      
      if (error.response) {
        if (error.response.data && error.response.data.error) {
          errorMessage = `Erreur: ${error.response.data.error}`;
        } else if (error.response.data && error.response.data.detail) {
          errorMessage = `Erreur: ${error.response.data.detail}`;
        } else if (error.response.status) {
          errorMessage = `Erreur ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.message) {
        errorMessage = `Erreur: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  // Reprogrammer un rendez-vous
  const rescheduleAppointment = async (appointment) => {
    // Get today's date for validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newDate = prompt("Nouvelle date (YYYY-MM-DD) :");
    if (!newDate) return;
    
    // Validate that the date is not in the past
    const newDateObj = new Date(newDate);
    newDateObj.setHours(0, 0, 0, 0);
    
    if (newDateObj < today) {
      alert("Veuillez sélectionner une date future valide");
      return;
    }
    
    const newHeure = prompt("Nouvelle heure (HH:MM) :");
    if (!newHeure) return;

    try {
      // Use the ID field that's available in the appointment object
      const id = appointment.id || appointment.numero;
      
      await patientAPI.rescheduleAppointment(id, { date: newDate, heure: newHeure });
      const updatedRdv = {
        ...rendezvous.find(rdv => (rdv.id === id || rdv.numero === id)),
        date: newDate,
        heure: newHeure,
        statut: "RESCHEDULED"
      };
      
      setRendezvous((prev) =>
        prev.map((rdv) =>
          (rdv.id === id || rdv.numero === id) ? updatedRdv : rdv
        )
      );
      
      // Update the reminder for this appointment
      appointmentReminderService.removeReminder(id);
      appointmentReminderService.addAppointmentReminder(updatedRdv);
      
      // Show success message
      alert("Rendez-vous reprogrammé avec succès !");
    } catch (error) {
      console.error("Erreur lors du reprogrammation :", error);
      
      // Show specific error message to user
      let errorMessage = "Erreur lors de la reprogrammation du rendez-vous. Veuillez réessayer.";
      
      if (error.response) {
        if (error.response.data && error.response.data.error) {
          errorMessage = `Erreur: ${error.response.data.error}`;
        } else if (error.response.data && error.response.data.detail) {
          errorMessage = `Erreur: ${error.response.data.detail}`;
        } else if (error.response.status) {
          errorMessage = `Erreur ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.message) {
        errorMessage = `Erreur: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  // Proposer une reprogrammation (nouvelle fonctionnalité)
  const proposeReschedule = async (appointment) => {
    // Get today's date for validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newDate = prompt("Proposer une nouvelle date (YYYY-MM-DD) :");
    if (!newDate) return;
    
    // Validate that the date is not in the past
    const newDateObj = new Date(newDate);
    newDateObj.setHours(0, 0, 0, 0);
    
    if (newDateObj < today) {
      alert("Veuillez sélectionner une date future valide");
      return;
    }
    
    const newHeure = prompt("Proposer une nouvelle heure (HH:MM) :");
    if (!newHeure) return;

    try {
      // Use the ID field that's available in the appointment object
      const id = appointment.id || appointment.numero;
      
      // Use the propose reschedule API endpoint
      const response = await patientAPI.proposeReschedule(id, { date: newDate, heure: newHeure });
      
      // Update the appointment status to RESCHEDULED (matching backend)
      const updatedRdv = {
        ...rendezvous.find(rdv => (rdv.id === id || rdv.numero === id)),
        date: newDate,
        heure: newHeure,
        statut: "RESCHEDULED"
      };
      
      setRendezvous((prev) =>
        prev.map((rdv) =>
          (rdv.id === id || rdv.numero === id) ? updatedRdv : rdv
        )
      );
      
      // Remove the reminder for this appointment since it's now rescheduled
      appointmentReminderService.removeReminder(id);
      
      alert("Proposition de reprogrammation envoyée. En attente de confirmation du médecin.");
    } catch (error) {
      console.error("Erreur lors de la proposition de reprogrammation :", error);
      
      // Show specific error message to user
      let errorMessage = "Erreur lors de la proposition de reprogrammation du rendez-vous. Veuillez réessayer.";
      
      if (error.response) {
        if (error.response.data && error.response.data.error) {
          errorMessage = `Erreur: ${error.response.data.error}`;
        } else if (error.response.data && error.response.data.detail) {
          errorMessage = `Erreur: ${error.response.data.detail}`;
        } else if (error.response.status) {
          errorMessage = `Erreur ${error.response.status}: ${error.response.statusText}`;
        }
      } else if (error.message) {
        errorMessage = `Erreur: ${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  // Vérifier si un rendez-vous peut être reprogrammé (plus de 30 minutes après confirmation)
  const canReschedule = (rdv) => {
    // Si le rendez-vous est confirmé, vérifier s'il s'est écoulé plus de 30 minutes
    if (rdv.statut === "CONFIRMED") {
      const appointmentTime = new Date(`${rdv.date}T${rdv.heure}`);
      const now = new Date();
      const timeDiff = now - appointmentTime;
      const minutesDiff = timeDiff / (1000 * 60);
      
      // Si plus de 30 minutes se sont écoulées depuis la confirmation, on peut reprogrammer
      return minutesDiff > 30;
    }
    
    // Si le rendez-vous est reprogrammé, on ne peut pas en proposer un autre immédiatement
    if (rdv.statut === "RESCHEDULED") {
      return false;
    }
    
    // Pour les autres statuts, on ne peut pas reprogrammer
    return false;
  };

  // Vérifier si un rendez-vous peut être confirmé par le patient
  // (This should never be true as patients don't confirm appointments directly)
  const canConfirm = (rdv) => {
    // Patients should never be able to confirm appointments directly
    // Only doctors can confirm appointments
    return false;
  };

  // Déterminer la couleur du fond selon le statut
  const getStatusBg = (statut) => {
    if (statut === "CONFIRMED") return "#d4edda"; // vert clair
    if (statut === "RESCHEDULED") return "#fff3cd"; // orange clair
    if (statut === "CANCELLED") return "#f8d7da"; // rouge clair
    if (statut === "PENDING") return "#cce7ff"; // bleu clair
    return "#f5f6fa"; // neutre
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>Chargement...</div>;
  }

  if (error) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>Erreur: {error}</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <div className="card shadow-sm p-3 mb-4">
            <h5>Rendez-vous</h5>
            <ul className="list-group">
              <li className="list-group-item active">Mes Rendez-vous</li>
              <li className="list-group-item">Historique</li>
              <li className="list-group-item">Annulés</li>
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Mes Rendez-vous</h2>
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

          {filteredRdv.length === 0 ? (
            <div className="card shadow-sm p-5 text-center">
              <h4>Aucun rendez-vous planifié</h4>
              <p>Vous n'avez aucun rendez-vous à venir.</p>
              <a href="/patient/prise-rendez-vous" className="btn btn-success">Prendre un rendez-vous</a>
            </div>
          ) : (
            <div className="row g-3">
              {filteredRdv.map((rdv) => (
                <div key={rdv.id} className="col-md-6">
                  <div className="card shadow-sm p-3" style={{ backgroundColor: getStatusBg(rdv.statut) }}>
                    <div className="d-flex justify-content-between align-items-start">
                      {/* Info rendez-vous */}
                      <div>
                        <h6 className="mb-1"><strong>{rdv.date}</strong> - {rdv.heure}</h6>
                        <p className="mb-1"><FaUserMd className="me-1 text-primary" /> {rdv.medecin_nom}</p>
                        <p className="mb-1"><em>{rdv.description}</em></p>
                        <p className="mb-1" style={{ fontSize: "13px", color: "#6c757d" }}>
                          Statut :{" "}
                          {rdv.statut === "CONFIRMED" && <span style={{ color: "green" }}>✔ Confirmé</span>}
                          {rdv.statut === "RESCHEDULED" && <span style={{ color: "#ff9800" }}>↻ Reprogrammé</span>}
                          {rdv.statut === "CANCELLED" && <span style={{ color: "red" }}>✖ Annulé</span>}
                          {rdv.statut === "PENDING" && <span style={{ color: "#1976d2" }}>⏳ En attente</span>}
                        </p>
                      </div>

                      {/* Actions */}
                      {rdv.statut === "CONFIRMED" && (
                        <div className="d-flex flex-column gap-2">
                          {canReschedule(rdv) ? (
                            <>
                              <button className="btn btn-sm btn-warning" onClick={() => proposeReschedule(rdv)}>
                                <FaEdit className="me-1" /> Proposer un changement
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => cancelAppointment(rdv)}>
                                Annuler
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-sm btn-secondary" disabled>
                                Changement possible après 30 min
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => cancelAppointment(rdv)}>
                                Annuler
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      
                      {rdv.statut === "PENDING" && (
                        <div className="d-flex flex-column gap-2">
                          <button className="btn btn-sm btn-info" disabled>
                            En attente de confirmation
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => cancelAppointment(rdv)}>
                            Annuler
                          </button>
                        </div>
                      )}
                      
                      {rdv.statut === "RESCHEDULED" && (
                        <div className="d-flex flex-column gap-2">
                          <button className="btn btn-sm btn-warning" onClick={() => proposeReschedule(rdv)}>
                            <FaEdit className="me-1" /> Proposer un autre changement
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => cancelAppointment(rdv)}>
                            Annuler
                          </button>
                        </div>
                      )}
                      
                      {rdv.statut === "CANCELLED" && (
                        <div className="d-flex flex-column gap-2">
                          <button className="btn btn-sm btn-secondary" disabled>
                            Annulé
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RendezVous;