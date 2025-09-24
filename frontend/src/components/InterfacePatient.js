// src/pages/PatientInterface.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaCalendarCheck,
  FaUserMd,
  FaFileMedical,
  FaComments,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaSearch,
  FaFolderOpen,
} from "react-icons/fa";
import { MdFeedback } from "react-icons/md";
import { IoMdNotificationsOutline } from "react-icons/io";
import { BsSun, BsMoon } from "react-icons/bs";
import "../assets/css/base.css";

function PatientInterface({ user }) {
  const [theme, setTheme] = useState("light");
  const [fullName, setFullName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [rendezvous, setRendezvous] = useState([]);
  const [filteredRdv, setFilteredRdv] = useState([]);

  // 🔔 Notifications
  const [notifications, setNotifications] = useState([
    "Rendez-vous demain à 10h avec Dr. Ndiaye.",
    "Votre ordonnance a été mise à jour.",
    "Résultats de votre analyse sanguine disponibles.",
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => setShowNotifications(!showNotifications);
  const clearNotifications = () => setNotifications([]);

  // Charger nom depuis localStorage
  useEffect(() => {
    const firstName = localStorage.getItem("first_name") || "";
    const lastName = localStorage.getItem("last_name") || "";
    setFullName(`${firstName} ${lastName}`.trim());
  }, []);

  // Charger le thème sauvegardé
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);

  // Appliquer le thème
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 🔹 Charger les rendez-vous depuis l'API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get("/api/appointments/upcoming/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setRendezvous(response.data);
        setFilteredRdv(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des rendez-vous :", error);
      }
    };
    fetchAppointments();
  }, []);

  // 🔹 Filtrer selon recherche
  useEffect(() => {
    const filtered = rendezvous.filter(
      (rdv) =>
        rdv.medecin_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rdv.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rdv.date?.includes(searchTerm)
    );
    setFilteredRdv(filtered);
  }, [searchTerm, rendezvous]);

  // 🔹 Annuler un rendez-vous
  const cancelAppointment = async (id) => {
    try {
      await axios.post(`/api/appointments/${id}/cancel/`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRendezvous((prev) =>
        prev.map((rdv) =>
          rdv.id === id ? { ...rdv, statut: "CANCELLED" } : rdv
        )
      );
    } catch (error) {
      console.error("Erreur lors de l’annulation :", error);
    }
  };

  // 🔹 Reprogrammer un rendez-vous
  const rescheduleAppointment = async (id) => {
    const newDate = prompt("Nouvelle date (YYYY-MM-DD) :");
    const newHeure = prompt("Nouvelle heure (HH:MM) :");
    if (!newDate || !newHeure) return;

    try {
      await axios.post(
        `/api/appointments/${id}/reschedule/`,
        { date: newDate, heure: newHeure },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
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

  // 🔹 Déterminer la couleur du fond selon le statut
  const getStatusBg = (statut) => {
    if (statut === "CONFIRMED") return "#d4edda"; // vert clair
    if (statut === "RESCHEDULED") return "#fff3cd"; // orange clair
    if (statut === "CANCELLED") return "#f8d7da"; // rouge clair
    return "#f5f6fa"; // neutre
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* ===== Sidebar ===== */}
      <aside style={{ width: "250px", padding: "20px" }}>
        <div className="d-flex align-items-center mb-4">
          <img src="/images/logo.png" alt="Logo" width="120" height="120" className="me-2" />
        </div>

        <ul className="nav flex-column">
          <li className="nav-item mb-3">
            <a href="/rendezvous" className="nav-link text-white">
              <FaCalendarCheck className="me-2" /> Mes Rendez-vous
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/prise-rendezvous" className="nav-link text-white">
              <FaFolderOpen className="me-2" /> Prise de rendez-vous
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/dossier-medical" className="nav-link text-white">
              <FaFileMedical className="me-2" /> Dossier médical
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/profil" className="nav-link text-white">
              <FaUserMd className="me-2" /> Profil
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/feedback" className="nav-link text-white">
              <MdFeedback className="me-2" /> Avis
            </a>
          </li>
        </ul>
        <hr />

        <div className="mt-auto pt-4">
          <a href="/" className="nav-link text-white">
            <FaSignOutAlt className="me-2" /> Déconnexion
          </a>
        </div>

        {/* Switch Light/Dark */}
        <div className="d-flex justify-content-center align-items-center mt-4">
          <BsSun size={20} className="me-2" />
          <div
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            style={{
              cursor: "pointer",
              background: theme === "light" ? "#ccc" : "#0e1216ff",
              borderRadius: "20px",
              width: "60px",
              height: "30px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "3px",
                left: theme === "light" ? "5px" : "35px",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: "white",
                transition: "all 0.3s ease",
              }}
            ></div>
          </div>
          <BsMoon size={20} className="ms-2" />
        </div>
      </aside>

      {/* ===== Contenu principal ===== */}
      <main className="flex-grow-1 p-4">
        {/* ===== Topbar ===== */}
        <div
          className="d-flex justify-content-between align-items-center mb-4 topbar"
          style={{ padding: "10px 20px", borderRadius: "10px" }}
        >
          {/* Barre de recherche */}
          <div style={{ position: "relative", width: "250px" }}>
            <input
              type="text"
              placeholder="Search here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderRadius: "20px",
                border: "1px solid #ddd",
                padding: "6px 12px 6px 35px",
                width: "100%",
                backgroundColor: "#f5f6fa",
                outline: "none",
              }}
            />
            <FaSearch
              style={{
                position: "absolute",
                top: "50%",
                left: "12px",
                transform: "translateY(-50%)",
                color: "#888",
              }}
            />
          </div>

          {/* Icônes + Profil */}
          <div className="d-flex align-items-center">
            <div style={iconStyle}><FaCog size={16} /></div>
            <div style={{ ...iconStyle, position: "relative" }}><FaComments size={16} /><span style={badgeStyle}></span></div>
            <div
              style={{ ...iconStyle, position: "relative" }}
              onClick={toggleNotifications}
            >
              <IoMdNotificationsOutline size={18} />
              {notifications.length > 0 && <span style={badgeStyle}></span>}

              {showNotifications && (
                <div
                  style={{
                    position: "absolute",
                    top: "40px",
                    right: "0",
                    width: "300px",
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    zIndex: 10,
                  }}
                >
                  <div style={{ padding: "10px", maxHeight: "200px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <p className="text-muted">Aucune notification</p>
                    ) : (
                      notifications.map((note, idx) => (
                        <p key={idx} style={{ margin: "0 0 10px 0", fontSize: "14px" }}>🔔 {note}</p>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      style={{
                        width: "100%",
                        border: "none",
                        padding: "8px",
                        background: "#f5f6fa",
                        borderTop: "1px solid #ddd",
                        cursor: "pointer",
                      }}
                    >
                      Tout effacer
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="d-flex align-items-center">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profil"
                  style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", marginRight: "10px" }}
                />
              ) : (
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#ddd", marginRight: "10px" }}></div>
              )}
              <div>
                <strong>{fullName || "Patient"}</strong>
                <p className="m-0 text-muted" style={{ fontSize: "12px" }}>{user?.role || "Patient"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Titre Dashboard ===== */}
        <div className="mb-4">
          <h5>
            <span style={{ color: "gray" }}> Tableau de Bord Patient &gt; </span>
            <strong>Dashboard</strong>
          </h5>
        </div>

        {/* ===== Tableau de rendez-vous filtré avec couleurs selon statut ===== */}
        <div className="row g-3">
          {filteredRdv.length === 0 ? (
            <p>Aucun rendez-vous planifié pour l’instant.</p>
          ) : (
            filteredRdv.map((rdv) => (
              <div key={rdv.id} className="col-md-6">
                <div className="card shadow-sm p-3" style={{ backgroundColor: getStatusBg(rdv.statut) }}>
                  <div className="d-flex justify-content-between align-items-start">
                    {/* Info rendez-vous */}
                    <div>
                      <h6 className="mb-1"><strong>{rdv.date}</strong> - {rdv.heure}</h6>
                      <p className="mb-1"><FaUserMd className="me-1 text-primary" />{rdv.medecin_nom}</p>
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
                        <button className="btn btn-success btn-sm mb-2" onClick={() => alert(`Joining session for appointment ${rdv.id}`)}>Join Session</button>
                      )}
                      {rdv.statut !== "CANCELLED" && (
                        <button className="btn btn-danger btn-sm mb-2" onClick={() => cancelAppointment(rdv.id)}>Annuler</button>
                      )}
                      <button className="btn btn-warning btn-sm" onClick={() => rescheduleAppointment(rdv.id)}>Reprogrammer</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

const iconStyle = {
  width: "35px",
  height: "35px",
  borderRadius: "50%",
  background: "#f5f6fa",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: "15px",
  cursor: "pointer",
};

const badgeStyle = {
  position: "absolute",
  top: "5px",
  right: "5px",
  width: "8px",
  height: "8px",
  background: "red",
  borderRadius: "50%",
};

export default PatientInterface;
