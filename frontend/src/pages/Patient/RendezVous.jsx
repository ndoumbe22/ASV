import React, { useState, useEffect } from "react";
import { patientAPI, appointmentAPI } from "../../services/api";
import { FaCalendarCheck, FaUserMd, FaSearch, FaQrcode } from "react-icons/fa";
import QRCode from "react-qr-code";

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
  const cancelAppointment = async (id) => {
    try {
      await patientAPI.cancelAppointment(id);
      setRendezvous((prev) =>
        prev.map((rdv) =>
          rdv.id === id ? { ...rdv, statut: "CANCELLED" } : rdv
        )
      );
    } catch (error) {
      console.error("Erreur lors de l’annulation :", error);
    }
  };

  // Reprogrammer un rendez-vous
  const rescheduleAppointment = async (id) => {
    const newDate = prompt("Nouvelle date (YYYY-MM-DD) :");
    const newHeure = prompt("Nouvelle heure (HH:MM) :");
    if (!newDate || !newHeure) return;

    try {
      await patientAPI.rescheduleAppointment(id, { date: newDate, heure: newHeure });
      setRendezvous((prev) =>
        prev.map((rdv) =>
          rdv.id === id
            ? { ...rdv, date: newDate, heure: newHeure, statut: "RESCHEDULED" }
            : rdv
        )
      );
    } catch (error) {
      console.error("Erreur lors du reprogrammation :", error);
    }
  };

  // Déterminer la couleur du fond selon le statut
  const getStatusBg = (statut) => {
    if (statut === "CONFIRMED") return "#d4edda"; // vert clair
    if (statut === "RESCHEDULED") return "#fff3cd"; // orange clair
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
          
          <div className="card shadow-sm p-3">
            <h5>QR Code</h5>
            <div className="d-flex justify-content-center my-3">
              <div style={{ background: "white", padding: "10px" }}>
                <QRCode value="rendezvous:patient" size={128} />
              </div>
            </div>
            <p className="text-center">Scannez pour accéder rapidement à vos rendez-vous</p>
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
                        </p>
                      </div>

                      {/* Boutons d’action */}
                      <div className="d-flex flex-column align-items-end">
                        {rdv.statut === "CONFIRMED" && (
                          <button className="btn btn-success btn-sm mb-2">Join Session</button>
                        )}
                        {rdv.statut !== "CANCELLED" && (
                          <button className="btn btn-danger btn-sm mb-2" onClick={() => cancelAppointment(rdv.id)}>Annuler</button>
                        )}
                        <button className="btn btn-warning btn-sm" onClick={() => rescheduleAppointment(rdv.id)}>Reprogrammer</button>
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