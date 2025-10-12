import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarCheck, FaUser, FaSearch, FaClock } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function RendezVous() {
  const [rendezvous, setRendezvous] = useState([]);
  const [filteredRdv, setFilteredRdv] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les rendez-vous depuis l'API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // Dans une vraie application, ces données viendraient de l'API
        // Pour l'instant, utilisons des données statiques
        const mockRendezvous = [
          {
            id: 1,
            patient: "Awa Diop",
            date: "2023-10-20",
            heure: "10:00",
            motif: "Contrôle rhume",
            statut: "CONFIRMED"
          },
          {
            id: 2,
            patient: "Mamadou Fall",
            date: "2023-10-20",
            heure: "11:30",
            motif: "Migraine chronique",
            statut: "CONFIRMED"
          },
          {
            id: 3,
            patient: "Fatou Ndiaye",
            date: "2023-10-21",
            heure: "09:00",
            motif: "Bilan de santé",
            statut: "PENDING"
          },
          {
            id: 4,
            patient: "Cheikh Sow",
            date: "2023-10-21",
            heure: "14:00",
            motif: "Douleurs articulaires",
            statut: "CONFIRMED"
          },
          {
            id: 5,
            patient: "Awa Diop",
            date: "2023-10-22",
            heure: "10:30",
            motif: "Suivi traitement",
            statut: "CONFIRMED"
          }
        ];
        
        setRendezvous(mockRendezvous);
        setFilteredRdv(mockRendezvous);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des rendez-vous");
        setLoading(false);
        console.error("Erreur lors du chargement des rendez-vous :", err);
      }
    };

    fetchAppointments();
  }, []);

  // Filtrer selon recherche et date sélectionnée
  useEffect(() => {
    const filtered = rendezvous.filter(
      rdv =>
        rdv.patient.toLowerCase().includes(searchTerm.toLowerCase()) &&
        rdv.date === selectedDate.toISOString().split('T')[0]
    );
    setFilteredRdv(filtered);
  }, [searchTerm, selectedDate, rendezvous]);

  // Confirmer un rendez-vous
  const confirmAppointment = async (id) => {
    try {
      // Dans une vraie application, cela enverrait une requête à l'API
      // await axios.put(`/api/appointments/${id}/confirm/`, {}, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      // });
      
      setRendezvous(prev =>
        prev.map(rdv =>
          rdv.id === id ? { ...rdv, statut: "CONFIRMED" } : rdv
        )
      );
    } catch (error) {
      console.error("Erreur lors de la confirmation :", error);
    }
  };

  // Annuler un rendez-vous
  const cancelAppointment = async (id) => {
    try {
      // Dans une vraie application, cela enverrait une requête à l'API
      // await axios.post(`/api/appointments/${id}/cancel/`, {}, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      // });
      
      setRendezvous(prev =>
        prev.map(rdv =>
          rdv.id === id ? { ...rdv, statut: "CANCELLED" } : rdv
        )
      );
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
    }
  };

  // Déterminer la couleur du fond selon le statut
  const getStatusBg = (statut) => {
    if (statut === "CONFIRMED") return "#d4edda"; // vert clair
    if (statut === "PENDING") return "#fff3cd"; // orange clair
    if (statut === "CANCELLED") return "#f8d7da"; // rouge clair
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
        {/* Sidebar - Calendrier */}
        <div className="col-md-4">
          <div className="card shadow-sm p-3 mb-4">
            <h5>Calendrier</h5>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="border-0"
            />
          </div>
          
          <div className="card shadow-sm p-3">
            <h5>Légende</h5>
            <div className="d-flex align-items-center mb-2">
              <div style={{ width: "20px", height: "20px", backgroundColor: "#d4edda", marginRight: "10px" }}></div>
              <span>Confirmé</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <div style={{ width: "20px", height: "20px", backgroundColor: "#fff3cd", marginRight: "10px" }}></div>
              <span>En attente</span>
            </div>
            <div className="d-flex align-items-center">
              <div style={{ width: "20px", height: "20px", backgroundColor: "#f8d7da", marginRight: "10px" }}></div>
              <span>Annulé</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Rendez-vous du {selectedDate.toLocaleDateString('fr-FR')}</h2>
            <div style={{ position: "relative", width: "250px" }}>
              <input
                type="text"
                placeholder="Rechercher un patient..."
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
              <h4>Aucun rendez-vous prévu</h4>
              <p>Aucun rendez-vous n'est prévu pour cette date.</p>
            </div>
          ) : (
            <div className="row g-3">
              {filteredRdv.map((rdv) => (
                <div key={rdv.id} className="col-md-12">
                  <div className="card shadow-sm p-3" style={{ backgroundColor: getStatusBg(rdv.statut) }}>
                    <div className="d-flex justify-content-between align-items-start">
                      {/* Info rendez-vous */}
                      <div>
                        <h6 className="mb-1"><strong>{rdv.heure}</strong> - {rdv.patient}</h6>
                        <p className="mb-1"><em>{rdv.motif}</em></p>
                        <p className="mb-1" style={{ fontSize: "13px", color: "#6c757d" }}>
                          Statut :{" "}
                          {rdv.statut === "CONFIRMED" && <span style={{ color: "green" }}>✔ Confirmé</span>}
                          {rdv.statut === "PENDING" && <span style={{ color: "#ff9800" }}>⏳ En attente</span>}
                          {rdv.statut === "CANCELLED" && <span style={{ color: "red" }}>✖ Annulé</span>}
                        </p>
                      </div>

                      {/* Boutons d’action */}
                      <div className="d-flex flex-column align-items-end">
                        {rdv.statut === "PENDING" && (
                          <button className="btn btn-success btn-sm mb-2" onClick={() => confirmAppointment(rdv.id)}>Confirmer</button>
                        )}
                        {rdv.statut !== "CANCELLED" && (
                          <button className="btn btn-danger btn-sm mb-2" onClick={() => cancelAppointment(rdv.id)}>Annuler</button>
                        )}
                        <button className="btn btn-outline-success btn-sm">Détails</button>
                      </div>
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